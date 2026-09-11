import { existsSync, readFileSync } from 'node:fs';
import { normalize, resolve, sep } from 'node:path';
import * as vscode from 'vscode';
import { DocsRootMissingError, parseGraph } from '../parser/parse';
import type { CapMapGraph } from '../parser/types';
import { DOCS_ROOT_MISSING_CODE } from '../setupHint';

interface WatchEntry {
  watcher: vscode.FileSystemWatcher;
  disposables: vscode.Disposable[];
  revision: number;
  docsRoot: string;
}

/**
 * Extension Host：parse / watch / revision / read（语义对齐 DSH，实现换 VS Code API）。
 */
export class CapMapHost {
  private readonly watches = new Map<string, WatchEntry>();
  private readonly onRevisionEmitters = new Set<(root: string, revision: number, docsRoot: string) => void>();

  onRevision(cb: (root: string, revision: number, docsRoot: string) => void): vscode.Disposable {
    this.onRevisionEmitters.add(cb);
    return new vscode.Disposable(() => this.onRevisionEmitters.delete(cb));
  }

  parse(projectRoot: string): CapMapGraph {
    return parseGraph(projectRoot);
  }

  watchStart(projectRoot: string): { revision: number; docsRoot: string } {
    const key = projectRoot.replace(/[/\\]+$/, '');
    const existing = this.watches.get(key);
    if (existing) {
      return { revision: existing.revision, docsRoot: existing.docsRoot };
    }
    const graph = parseGraph(key);
    const pattern = new vscode.RelativePattern(graph.docsRoot, '**/*');
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);
    const entry: WatchEntry = {
      watcher,
      disposables: [],
      revision: 1,
      docsRoot: graph.docsRoot,
    };
    const bump = () => {
      entry.revision += 1;
      for (const cb of this.onRevisionEmitters) cb(key, entry.revision, entry.docsRoot);
    };
    entry.disposables.push(
      watcher.onDidCreate(bump),
      watcher.onDidChange(bump),
      watcher.onDidDelete(bump),
    );
    this.watches.set(key, entry);
    return { revision: entry.revision, docsRoot: entry.docsRoot };
  }

  watchStop(projectRoot: string): { stopped: boolean } {
    const key = projectRoot.replace(/[/\\]+$/, '');
    const entry = this.watches.get(key);
    if (!entry) return { stopped: false };
    for (const d of entry.disposables) d.dispose();
    entry.watcher.dispose();
    this.watches.delete(key);
    return { stopped: true };
  }

  revision(projectRoot: string): { revision: number } {
    const key = projectRoot.replace(/[/\\]+$/, '');
    const entry = this.watches.get(key);
    return { revision: entry?.revision ?? 0 };
  }

  read(projectRoot: string, relPath: string): { path: string; text: string } {
    const { cleaned, abs } = this.resolveUnderDocs(projectRoot, relPath);
    return { path: cleaned, text: readFileSync(abs, 'utf8') };
  }

  /** 在编辑器中打开 docs_root 内文件（旁路列，便于对照图谱）。 */
  async open(projectRoot: string, relPath: string): Promise<{ path: string; opened: true }> {
    const { cleaned, abs } = this.resolveUnderDocs(projectRoot, relPath);
    const uri = vscode.Uri.file(abs);
    // 用 vscode.open，勿走 openTextDocument：后者要求文档同步到扩展宿主，
    // 超限或宿主不同步时会抛「Documents above the size limit…」（与真实体积无关）。
    await vscode.commands.executeCommand('vscode.open', uri, {
      preview: true,
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: false,
    });
    return { path: cleaned, opened: true };
  }

  private resolveUnderDocs(projectRoot: string, relPath: string): { cleaned: string; abs: string } {
    const graph = parseGraph(projectRoot);
    const docsRoot = resolve(graph.docsRoot);
    const cleaned = relPath.replace(/\\/g, '/').replace(/^\/+/, '');
    const abs = resolve(docsRoot, cleaned);
    const normAbs = normalize(abs);
    const normRoot = normalize(docsRoot);
    const rootPrefix = normRoot.endsWith(sep) ? normRoot : normRoot + sep;
    if (normAbs !== normRoot && !normAbs.startsWith(rootPrefix)) {
      throw new Error('capmap: 路径越界 docs_root');
    }
    if (!existsSync(abs)) throw new Error(`capmap: 文件不存在 ${cleaned}`);
    return { cleaned, abs };
  }

  /** 统一处理 Webview 请求；错误带 code（docs_root_missing）。open 请用 open()。 */
  handle(
    endpoint: string,
    payload: unknown,
  ): { ok: true; result: unknown } | { ok: false; error: { message: string; code?: string } } {
    try {
      if (endpoint === 'parse') {
        const root = (payload as { root?: string })?.root;
        if (typeof root !== 'string' || root === '') {
          return { ok: false, error: { message: 'capmap.parse: root 必填' } };
        }
        return { ok: true, result: this.parse(root) };
      }
      if (endpoint === 'watchStart') {
        const root = (payload as { root?: string })?.root;
        if (typeof root !== 'string' || root === '') {
          return { ok: false, error: { message: 'capmap.watchStart: root 必填' } };
        }
        return { ok: true, result: this.watchStart(root) };
      }
      if (endpoint === 'revision') {
        const root = (payload as { root?: string })?.root;
        if (typeof root !== 'string' || root === '') {
          return { ok: false, error: { message: 'capmap.revision: root 必填' } };
        }
        return { ok: true, result: this.revision(root) };
      }
      if (endpoint === 'read') {
        const p = payload as { root?: string; path?: string };
        if (typeof p?.root !== 'string' || p.root === '') {
          return { ok: false, error: { message: 'capmap.read: root 必填' } };
        }
        if (typeof p?.path !== 'string' || p.path === '') {
          return { ok: false, error: { message: 'capmap.read: path 必填' } };
        }
        return { ok: true, result: this.read(p.root, p.path) };
      }
      if (endpoint === 'open') {
        return { ok: false, error: { message: 'capmap.open: 请走异步 open()' } };
      }
      return { ok: false, error: { message: `capmap: 未知端点 ${endpoint}` } };
    } catch (err) {
      if (err instanceof DocsRootMissingError) {
        return { ok: false, error: { message: err.message, code: DOCS_ROOT_MISSING_CODE } };
      }
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: { message } };
    }
  }

  dispose(): void {
    for (const [key] of [...this.watches]) this.watchStop(key);
    this.onRevisionEmitters.clear();
  }
}
