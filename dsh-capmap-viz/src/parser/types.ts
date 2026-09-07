/** CapMap 图模型（Cordis-free）。 */

export type CapMapNodeType = 'map' | 'scheme' | 'test' | 'norm' | 'index' | 'archive';

export interface CapMapNode {
  id: string;
  title: string;
  type: CapMapNodeType;
  status: string | null;
  path: string;
  theme: string | null;
  summary: string | null;
  tags: string[];
}

export interface CapMapEdge {
  source: string;
  target: string;
  kind: 'wikilink' | 'semantic';
}

export interface CapMapCapability {
  name: string;
  /** 单元格原文状态（可含「状态/」前缀）。 */
  status: string | null;
  summary: string | null;
  mapId: string | null;
  theme: string | null;
  /** 名称单元格内 `[[wikilink]]`（若有）。 */
  schemeWikilink: string | null;
}

/** 切片 sidecar：不入主图。 */
export interface CapMapSlice {
  id: string;
  title: string;
  status: string | null;
  theme: string | null;
  /** 所属方案节点 id（主图聚焦目标）。 */
  schemeId: string | null;
  blockedBy: string[];
  path: string;
}

export type CapMapQueryKind = 'frontier' | 'validation_gate' | 'section1_fight';

export interface CapMapQueryRow {
  kind: CapMapQueryKind;
  id: string;
  label: string;
  schemeId: string | null;
  mapId?: string | null;
  detail?: string | null;
  /** §1 打架专用 */
  section1Status?: string | null;
  schemeStatus?: string | null;
}

export interface CapMapQueries {
  frontier: CapMapQueryRow[];
  validationGate: CapMapQueryRow[];
  section1Fight: CapMapQueryRow[];
}

export interface CapMapGraph {
  theme: string | null;
  docsRoot: string;
  nodes: CapMapNode[];
  edges: CapMapEdge[];
  capabilities: CapMapCapability[];
  /** 活跃/归档切片执行件；不入 nodes。 */
  slices: CapMapSlice[];
  /** 派生活看板查询。 */
  queries: CapMapQueries;
}
