/**
 * Client 视图：把扁平图 JSON 编成「主题 → 方案组 → 未归组 → 落地归档」。
 * 不改磁盘契约；测试/规范靠 wikilink 挂进方案组（可多挂）。
 */
import type { CapMapEdge, CapMapGraph, CapMapNode, CapMapSlice } from '../../parser/types';

export interface ThemeTreeLeaf {
  id: string;
  title: string;
  type: CapMapNode['type'] | 'slice';
  status: string | null;
}

export interface ThemeSchemeGroup {
  schemeId: string;
  title: string;
  status: string | null;
  archived: boolean;
  scheme: ThemeTreeLeaf | null;
  slices: ThemeTreeLeaf[];
  tests: ThemeTreeLeaf[];
  norms: ThemeTreeLeaf[];
}

export interface ThemeBucket {
  theme: string;
  maps: ThemeTreeLeaf[];
  active: ThemeSchemeGroup[];
  ungrouped: ThemeTreeLeaf[];
  archived: ThemeSchemeGroup[];
}

function isArchivedNode(n: CapMapNode): boolean {
  return (
    n.type === 'archive' ||
    n.path.startsWith('_archive/') ||
    n.status === '已归档' ||
    n.tags.includes('已归档') ||
    n.tags.includes('状态/已归档')
  );
}

function leafOf(n: CapMapNode): ThemeTreeLeaf {
  return { id: n.id, title: n.title, type: n.type, status: n.status };
}

function sliceLeaf(s: CapMapSlice): ThemeTreeLeaf {
  return { id: s.id, title: s.title, type: 'slice', status: s.status };
}

/** 与某方案有 wikilink 邻接的测试/规范（双向）。 */
function linkedDocIds(schemeId: string, edges: CapMapEdge[]): Set<string> {
  const out = new Set<string>();
  for (const e of edges) {
    if (e.kind !== 'wikilink') continue;
    if (e.source === schemeId) out.add(e.target);
    if (e.target === schemeId) out.add(e.source);
  }
  return out;
}

export function buildThemeTree(graph: CapMapGraph, themeFilter: string): ThemeBucket[] {
  const nodes = graph.nodes;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const themeNames = new Set<string>();
  for (const n of nodes) {
    if (themeFilter !== '全部' && n.theme !== themeFilter) continue;
    if (n.theme) themeNames.add(n.theme);
  }

  const buckets: ThemeBucket[] = [];

  for (const theme of [...themeNames].sort()) {
    const inTheme = (n: CapMapNode) => n.theme === theme;
    const maps = nodes.filter((n) => inTheme(n) && n.type === 'map').map(leafOf);

    const schemes = nodes.filter(
      (n) =>
        inTheme(n) &&
        n.type !== 'index' &&
        !n.path.includes('/切片/') &&
        (n.type === 'scheme' || (n.type === 'archive' && n.path.includes('/方案/') && !/索引\.md$/.test(n.path))),
    );

    const active: ThemeSchemeGroup[] = [];
    const archived: ThemeSchemeGroup[] = [];
    const claimed = new Set<string>();

    for (const sch of schemes) {
      const archivedFlag = isArchivedNode(sch);
      const links = linkedDocIds(sch.id, graph.edges);
      const slices = (graph.slices ?? [])
        .filter((s) => s.schemeId === sch.id || s.schemeId === sch.title)
        .map(sliceLeaf);
      const tests: ThemeTreeLeaf[] = [];
      const norms: ThemeTreeLeaf[] = [];
      for (const id of links) {
        const n = byId.get(id);
        if (!n) continue;
        if (n.type === 'test') {
          tests.push(leafOf(n));
          claimed.add(n.id);
        } else if (n.type === 'norm') {
          norms.push(leafOf(n));
          claimed.add(n.id);
        }
      }
      const group: ThemeSchemeGroup = {
        schemeId: sch.id,
        title: sch.title,
        status: sch.status,
        archived: archivedFlag,
        scheme: leafOf(sch),
        slices,
        tests,
        norms,
      };
      if (archivedFlag) archived.push(group);
      else active.push(group);
    }

    const ungrouped: ThemeTreeLeaf[] = [];
    for (const n of nodes) {
      if (!inTheme(n)) continue;
      if (n.type !== 'test' && n.type !== 'norm') continue;
      if (claimed.has(n.id)) continue;
      ungrouped.push(leafOf(n));
    }

    buckets.push({ theme, maps, active, ungrouped, archived });
  }

  if (themeFilter === '全部') {
    const claimedAll = new Set<string>();
    for (const b of buckets) {
      for (const g of [...b.active, ...b.archived]) {
        for (const t of g.tests) claimedAll.add(t.id);
        for (const n of g.norms) claimedAll.add(n.id);
      }
      for (const u of b.ungrouped) claimedAll.add(u.id);
    }
    const unlinked = nodes.filter((n) => {
      if (n.type !== 'norm' && !(n.type === 'test' && !n.theme)) return false;
      if (claimedAll.has(n.id)) return false;
      if (n.theme && themeNames.has(n.theme)) return false;
      return true;
    });
    if (unlinked.length > 0) {
      buckets.push({
        theme: '（未归组）',
        maps: [],
        active: [],
        ungrouped: unlinked.map(leafOf),
        archived: [],
      });
    }
  }

  return buckets;
}

const INDEX_ORDER = ['文档首页', '项目全貌', '方案索引', '测试索引', '规范索引', '归档索引', '能力总览'];

/** 顶层索引节点（与主题同级，不进主题桶）。 */
export function listIndexNodes(nodes: CapMapNode[]): ThemeTreeLeaf[] {
  const indexes = nodes.filter((n) => n.type === 'index' || n.type === 'overview').map(leafOf);
  indexes.sort((a, b) => {
    const ia = INDEX_ORDER.findIndex((k) => a.id.includes(k) || a.title.includes(k));
    const ib = INDEX_ORDER.findIndex((k) => b.id.includes(k) || b.title.includes(k));
    if (ia >= 0 || ib >= 0) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    return a.title.localeCompare(b.title, 'zh');
  });
  return indexes;
}

/** 生命周期计数：有 status 的节点。 */
export function lifecycleCounts(
  nodes: CapMapNode[],
  themeFilter: string,
): { status: string; count: number }[] {
  const m = new Map<string, number>();
  for (const n of nodes) {
    if (themeFilter !== '全部' && n.theme !== themeFilter) continue;
    if (!n.status) continue;
    m.set(n.status, (m.get(n.status) ?? 0) + 1);
  }
  const order = [
    '方案中',
    '已确认',
    '规格中',
    '已拆分',
    '开发中',
    '已开发',
    '验证中',
    '已验证',
    '测试中',
    '落地中',
    '已落地',
    '已归档',
    '待开发',
    '待验收',
    '已验收',
  ];
  const entries = [...m.entries()];
  entries.sort((a, b) => {
    const ia = order.indexOf(a[0]);
    const ib = order.indexOf(b[0]);
    if (ia >= 0 || ib >= 0) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    return b[1] - a[1];
  });
  return entries.map(([status, count]) => ({ status, count }));
}
