// Host↔Client 共享 RPC 契约（invariant 侧类型，双半共用）。
// 这些 shape 由 invariant 伴生插件注册，Client 侧 `host.call('capmap.parse', req)` 与
// Host 侧 `CapMapService.parse` 对齐。
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
export const CAPMAP_RPC = {
  parse: 'capmap.parse',
} as const;
