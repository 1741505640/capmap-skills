import type { CapMapGraph } from './types.ts';
/** 工作区无 capmap.yaml / docs_root 时抛出；RPC 层用 code=internal，Client 用文案识别。 */
export declare class DocsRootMissingError extends Error {
    readonly code: "docs_root_missing";
    constructor(projectRoot: string);
}
/** 主入口：项目根 → docs_root → 图 JSON + sidecar。 */
export declare function parseGraph(projectRoot: string): CapMapGraph;
export { deriveQueries } from './queries.ts';
//# sourceMappingURL=parse.d.ts.map