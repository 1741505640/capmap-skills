// CapMap 图模型类型（Cordis-free，Host/Client/invariant 共用）。
// 节点/边/能力与方案 §3 对齐。

/** 节点类型（目录位置 + tags 判定）。 */
export type NodeType = 'map' | 'scheme' | 'test' | 'norm' | 'index' | 'archive';

/** 一个文档节点。 */
export interface CapMapNode {
  /** 唯一文件名 stem（Vault 内唯一，图谱按此解析 wikilink）。 */
  id: string;
  /** H1 标题，缺省回退为 stem。 */
  title: string;
  /** 相对 docs_root 的 POSIX 路径。 */
  path: string;
  type: NodeType;
  /** 生命周期状态值（去 `状态/` 前缀，如 `开发中` / `测试中` / `已归档`）。 */
  status: string | null;
  /** 方案体量（`小` / `大`），非方案为 null。 */
  volume: '小' | '大' | null;
  /** 所属主题名（`方案/<主题>/` 或 `测试/<主题>/`），无主题为 null。 */
  theme: string | null;
  /** 摘要（frontmatter 之后首个非标题/引用段落，用于 hover 迷你卡）。 */
  summary: string | null;
}

/** 一条边。 */
export interface CapMapEdge {
  /** 源节点 id（stem）。 */
  source: string;
  /** 目标节点 id（stem）。 */
  target: string;
  /** `wikilink` = [[..]] 引用；`semantic` = 目录契约推导（默认隐藏）。 */
  kind: 'wikilink' | 'semantic';
}

/** 能力清单（能力底图 §1 表的一行）。 */
export interface Capability {
  name: string;
  status: string;
  summary: string;
}

/** CapMapParser 输出：一张可渲染的图 JSON。 */
export interface CapMapGraph {
  /** 检测到的主题名列表。 */
  themes: string[];
  nodes: CapMapNode[];
  edges: CapMapEdge[];
  /** 所有能力底图 §1 能力清单的并集。 */
  capabilities: Capability[];
}
