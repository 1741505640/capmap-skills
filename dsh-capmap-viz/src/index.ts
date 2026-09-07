import { Context, Service } from '@deepseek-ai/cordis';
import chokidar from 'chokidar';
import { existsSync, readFileSync } from 'node:fs';
import { normalize, resolve, sep } from 'node:path';
import { getBootstrapJob, pruneBootstrapJobs, startBootstrapJob } from './bootstrap/job.ts';
import { parseGraph } from './parser/parse.ts';
// ctx.connection 类型见 ./shims-dsh-host.d.ts（禁止 side-effect import client-connection）

/** 泛用 Connection RPC 通道（单段名）。 */
export const CAPMAP_RPC_CHANNEL = '/capmap';

interface WatchEntry {
  watcher: ReturnType<typeof chokidar.watch>;
  revision: number;
  docsRoot: string;
}

/**
 * Host 半：CapMapService。
 * Client：parse | watch | revision | read | bootstrap | bootstrapStatus
 */
export class CapMapService extends Service {
  static inject = ['connection'];

  private readonly watches = new Map<string, WatchEntry>();

  constructor(ctx: Context) {
    super(ctx, 'capmap');
    ctx.effect(() => {
      const dispose = ctx.connection.rpc.handle(
        CAPMAP_RPC_CHANNEL,
        (endpoint, payload, signal) => this.handleRpc(endpoint, payload, signal),
        { authority: 'trusted-host' },
      );
      return () => {
        for (const [, w] of this.watches) void w.watcher.close();
        this.watches.clear();
        void dispose();
      };
    }, 'capmap-viz: rpc /capmap');
  }

  async parse(projectRoot: string) {
    return parseGraph(projectRoot);
  }

  /**
   * 启动后台初始化（立即返回 jobId）。
   * 勿在单次 RPC 里同步跑完 npx——会拖死连接导致 Failed to fetch。
   */
  bootstrapStart(
    projectRoot: string,
    opts?: {
      docsRoot?: string;
      themeId?: string;
      installSkills?: boolean;
      forceSkills?: boolean;
      obsidian?: boolean;
    },
  ) {
    pruneBootstrapJobs();
    return startBootstrapJob(projectRoot, opts);
  }

  bootstrapStatus(jobId: string) {
    const snap = getBootstrapJob(jobId);
    if (!snap) throw new Error(`capmap.bootstrapStatus: 未知 jobId ${jobId}`);
    return snap;
  }

  watchStart(projectRoot: string) {
    const key = projectRoot.replace(/[/\\]+$/, '');
    const existing = this.watches.get(key);
    if (existing) {
      return { revision: existing.revision, docsRoot: existing.docsRoot };
    }
    const graph = parseGraph(key);
    const entry: WatchEntry = {
      watcher: chokidar.watch(graph.docsRoot, {
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 400, pollInterval: 100 },
        ignored: /(^|[/\\])\../,
      }),
      revision: 1,
      docsRoot: graph.docsRoot,
    };
    entry.watcher.on('all', () => {
      entry.revision += 1;
    });
    this.watches.set(key, entry);
    return { revision: entry.revision, docsRoot: entry.docsRoot };
  }

  watchStop(projectRoot: string) {
    const key = projectRoot.replace(/[/\\]+$/, '');
    const entry = this.watches.get(key);
    if (!entry) return { stopped: false as const };
    void entry.watcher.close();
    this.watches.delete(key);
    return { stopped: true as const };
  }

  revision(projectRoot: string) {
    const key = projectRoot.replace(/[/\\]+$/, '');
    const entry = this.watches.get(key);
    return { revision: entry?.revision ?? 0 };
  }

  read(projectRoot: string, relPath: string) {
    const graph = parseGraph(projectRoot);
    const docsRoot = resolve(graph.docsRoot);
    const cleaned = relPath.replace(/\\/g, '/').replace(/^\/+/, '');
    const abs = resolve(docsRoot, cleaned);
    const normAbs = normalize(abs);
    const normRoot = normalize(docsRoot);
    const rootPrefix = normRoot.endsWith(sep) ? normRoot : normRoot + sep;
    if (normAbs !== normRoot && !normAbs.startsWith(rootPrefix)) {
      throw new Error('capmap.read: 路径越界 docs_root');
    }
    if (!existsSync(abs)) throw new Error(`capmap.read: 文件不存在 ${cleaned}`);
    const text = readFileSync(abs, 'utf8');
    return { path: cleaned, text };
  }

  private async handleRpc(endpoint: string, payload: unknown, _signal: AbortSignal) {
    const fail = (message: string) => ({
      ok: false as const,
      error: { code: 'internal' as const, message, details: {} },
    });
    try {
      if (endpoint === 'parse') {
        const root = (payload as { root?: string })?.root;
        if (typeof root !== 'string' || root === '') return fail('capmap.parse: root 必填');
        return { ok: true as const, value: await this.parse(root) };
      }
      if (endpoint === 'bootstrap') {
        const p = payload as {
          root?: string;
          docsRoot?: string;
          themeId?: string;
          installSkills?: boolean;
          forceSkills?: boolean;
          obsidian?: boolean;
        };
        if (typeof p?.root !== 'string' || p.root === '') return fail('capmap.bootstrap: root 必填');
        return {
          ok: true as const,
          value: this.bootstrapStart(p.root, {
            docsRoot: p.docsRoot,
            themeId: p.themeId,
            installSkills: p.installSkills,
            forceSkills: p.forceSkills,
            obsidian: p.obsidian,
          }),
        };
      }
      if (endpoint === 'bootstrapStatus') {
        const jobId = (payload as { jobId?: string })?.jobId;
        if (typeof jobId !== 'string' || jobId === '') return fail('capmap.bootstrapStatus: jobId 必填');
        return { ok: true as const, value: this.bootstrapStatus(jobId) };
      }
      if (endpoint === 'watch') {
        const p = payload as { root?: string; action?: string };
        if (typeof p?.root !== 'string' || p.root === '') return fail('capmap.watch: root 必填');
        if (p.action === 'stop') return { ok: true as const, value: this.watchStop(p.root) };
        return { ok: true as const, value: this.watchStart(p.root) };
      }
      if (endpoint === 'revision') {
        const root = (payload as { root?: string })?.root;
        if (typeof root !== 'string' || root === '') return fail('capmap.revision: root 必填');
        return { ok: true as const, value: this.revision(root) };
      }
      if (endpoint === 'read') {
        const p = payload as { root?: string; path?: string };
        if (typeof p?.root !== 'string' || p.root === '') return fail('capmap.read: root 必填');
        if (typeof p?.path !== 'string' || p.path === '') return fail('capmap.read: path 必填');
        return { ok: true as const, value: this.read(p.root, p.path) };
      }
      return fail(`capmap: 未知端点 ${endpoint}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return fail(msg);
    }
  }
}

export const name = 'capmap-viz';
export default CapMapService;
