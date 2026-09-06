import type { CapMapGraph } from '../parser/types.ts';
/** Client → Host：请求解析某个项目根的 capmap 文档体系。 */
export interface CapMapParseRequest {
    /** 目标项目根（Host 端据此定位 capmap.yaml → docs_root）。 */
    root: string;
}
/** Host → Client：解析结果 = 一张可渲染的图 JSON。 */
export interface CapMapParseResponse {
    graph: CapMapGraph;
}
/** CapMap RPC 方法表（invariant 注册名，双半各持一份）。 */
export declare const CAPMAP_RPC: {
    readonly parse: "capmap.parse";
};
//# sourceMappingURL=types.d.ts.map