// Host 半：CapMapService（`ctx.capmap`）。CLI 侧读取 docs_root 下的 md → 图 JSON，
// 并把 `parse` 暴露为泛用 Connection RPC 通道 `/capmap` 供 Client 半调用。
// 形态对齐 @deepseek-ai/dsh-host-directory-picker 的 Service Definition 约定。
import { Context, Service } from '@deepseek-ai/cordis';
// 侧效 import：把 ctx.connection / ctx.fs 的 Context 增补拉进本包 tsc。
import '@deepseek-ai/dsh-client-connection';
import '@deepseek-ai/dsh-fs';
import type { FsTarget } from '@deepseek-ai/dsh-fs';
import { parseGraph } from './parser/parse.ts';
import type { FileInput } from './parser/parse.ts';
import type { CapMapGraph } from './parser/types.ts';

declare module '@deepseek-ai/cordis' {
  interface Context {
    capmap: CapMapService;
  }
}

export const name = 'capmap-viz';
export const inject = ['fs', 'connection'];

/** RPC 通道名（Host/Client 各持一份，写入 invariant/types 契约）。 */
export const CAPMAP_RPC_CHANNEL = '/capmap';

/**
 * Host 侧能力：把某个项目根的 capmap 文档体系解析成一张可渲染的图。
 * Client 半通过 `ctx.connection.rpc.call('/capmap', 'parse', { root })` 调用。
 */
export class CapMapService extends Service {
  static inject = ['fs', 'connection'];

  constructor(ctx: Context) {
    super(ctx, 'capmap');
    ctx.connection.rpc.handle(
      CAPMAP_RPC_CHANNEL,
      (endpoint, payload, signal) => this.handleRpc(endpoint, payload, signal),
      { authority: 'loopback' },
    );
  }

  /** 主入口：项目根 → 定位 docs_root → 解析全量 md → 图 JSON（真实 CapMapParser，无空图桩）。 */
  async parse(projectRoot: string): Promise<CapMapGraph> {
    const docsRoot = await this.resolveDocsRoot(projectRoot);
    const files = await this.readMarkdownFiles(docsRoot);
    return parseGraph(files);
  }

  /** 泛用 RPC 通道的端点分发（JSON-safe 结果）。 */
  private async handleRpc(endpoint: string, payload: unknown, _signal: AbortSignal) {
    if (endpoint === 'parse') {
      const root = (payload as { root?: string })?.root;
      if (typeof root !== 'string' || root === '') {
        return {
          ok: false as const,
          error: { code: 'internal' as const, message: 'capmap.parse: root 必填', details: {} },
        };
      }
      try {
        return { ok: true as const, value: await this.parse(root) };
      } catch (err) {
        return {
          ok: false as const,
          error: { code: 'internal' as const, message: String(err), details: {} },
        };
      }
    }
    return {
      ok: false as const,
      error: { code: 'internal' as const, message: `capmap: 未知端点 ${endpoint}`, details: {} },
    };
  }

  /** 定位 docs_root：优先 `.agents/skills/capmap-system/capmap.yaml`，回退 `<root>/docs`。 */
  private async resolveDocsRoot(projectRoot: string): Promise<string> {
    const base = projectRoot.replace(/\\/g, '/');
    const candidates = [
      `${base}/.agents/skills/capmap-system/capmap.yaml`,
      `${base}/.claude/skills/capmap-system/capmap.yaml`,
      `${base}/skills/capmap-system/capmap.yaml`,
      `${base}/capmap.yaml`,
    ];
    for (const c of candidates) {
      try {
        const target = await this.ctx.fs.resolve(c);
        const text = await this.ctx.fs.readText(target);
        const m = /^docs_root:\s*(.+?)\s*$/m.exec(text);
        if (m) {
          const rel = m[1].trim().replace(/^['"]|['"]$/g, '');
          const full = rel.startsWith('/') || /^[A-Za-z]:/.test(rel)
            ? rel.replace(/\\/g, '/')
            : `${base}/${rel.replace(/\\/g, '/')}`.replace(/\/+/g, '/');
          return full;
        }
      } catch {
        // 该候选不存在或不可读，继续下一个
      }
    }
    return `${base}/docs`;
  }

  /** 递归收集 docs_root 下全部 .md，产出 `{ path(相对 POSIX), content }`。 */
  private async readMarkdownFiles(root: string): Promise<FileInput[]> {
    const rootTarget = await this.ctx.fs.resolve(root);
    const out: FileInput[] = [];
    await this.walk(rootTarget, '', out, 0);
    return out;
  }

  private async walk(dir: FsTarget, rel: string, out: FileInput[], depth: number): Promise<void> {
    if (depth > 64) return; // 防御性深度上限
    let entries;
    try {
      entries = await this.ctx.fs.listDir(dir);
    } catch {
      return; // 不可列目录：跳过
    }
    for (const e of entries) {
      const relPath = rel ? `${rel}/${e.name}` : e.name;
      if (e.type === 'directory') {
        if (e.name.startsWith('.')) continue; // 跳过 .git/.obsidian 等
        await this.walk(e.target, relPath, out, depth + 1);
      } else if (e.type === 'file' && e.name.endsWith('.md')) {
        try {
          const content = await this.ctx.fs.readText(e.target);
          out.push({ path: relPath, content });
        } catch {
          // 不可读文件：跳过
        }
      }
    }
  }
}

export default CapMapService;
