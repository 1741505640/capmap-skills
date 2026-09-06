import { Context, Service } from '@deepseek-ai/cordis';
import '@deepseek-ai/dsh-client-connection';
import '@deepseek-ai/dsh-fs';
import type { CapMapGraph } from './parser/types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        capmap: CapMapService;
    }
}
export declare const name = "capmap-viz";
export declare const inject: string[];
/** RPC 通道名（Host/Client 各持一份，写入 invariant/types 契约）。 */
export declare const CAPMAP_RPC_CHANNEL = "/capmap";
/**
 * Host 侧能力：把某个项目根的 capmap 文档体系解析成一张可渲染的图。
 * Client 半通过 `ctx.connection.rpc.call('/capmap', 'parse', { root })` 调用。
 */
export declare class CapMapService extends Service {
    static inject: string[];
    constructor(ctx: Context);
    /** 主入口：项目根 → 定位 docs_root → 解析全量 md → 图 JSON（真实 CapMapParser，无空图桩）。 */
    parse(projectRoot: string): Promise<CapMapGraph>;
    /** 泛用 RPC 通道的端点分发（JSON-safe 结果）。 */
    private handleRpc;
    /** 定位 docs_root：优先 `.agents/skills/capmap-system/capmap.yaml`，回退 `<root>/docs`。 */
    private resolveDocsRoot;
    /** 递归收集 docs_root 下全部 .md，产出 `{ path(相对 POSIX), content }`。 */
    private readMarkdownFiles;
    private walk;
}
export default CapMapService;
//# sourceMappingURL=index.d.ts.map