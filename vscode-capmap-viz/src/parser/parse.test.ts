import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseGraph } from './parse.ts';

/** vscode-capmap-viz/src/parser → 仓库根 */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

test('frontmatter tags（块列表）与节点分型', () => {
  const g = parseGraph(repoRoot);
  const map = g.nodes.find((n) => n.type === 'map');
  assert.ok(map, '应有能力底图节点');
  assert.equal(map!.tags.includes('能力底图'), true);
  const scheme = g.nodes.find(
    (n) => n.id === 'CapMap可视化-VSCode扩展' && n.type === 'scheme',
  );
  assert.ok(scheme, '应有进行中 VS Code 方案节点');
  assert.equal(scheme!.status, '开发中');
});

test('overview 类型（项目全貌）', () => {
  const g = parseGraph(repoRoot);
  const overview = g.nodes.find((n) => n.type === 'overview');
  assert.ok(overview, '应有 overview 节点');
  assert.ok(overview!.path.includes('项目全貌'));
});

test('wikilink / md 双轨去重；边端点可解析', () => {
  const g = parseGraph(repoRoot);
  for (const e of g.edges) {
    assert.ok(g.nodes.some((n) => n.id === e.source), `悬空 source ${e.source}`);
    assert.ok(g.nodes.some((n) => n.id === e.target), `悬空 target ${e.target}`);
  }
  const wiki = g.edges.filter((e) => e.kind === 'wikilink');
  assert.ok(wiki.length > 0, '应有 wikilink 边');
});

test('活跃切片跳过主图但进 sidecar；§1 能力清单', () => {
  const g = parseGraph(repoRoot);
  assert.equal(
    g.nodes.some((n) => n.path.includes('CapMap可视化-VSCode扩展-03')),
    false,
    '活跃切片不应入主图',
  );
  assert.ok(
    g.slices.some((s) => s.id.includes('CapMap可视化-VSCode扩展-03')),
    '切片应进 sidecar',
  );
  assert.ok(g.capabilities.length >= 10, `能力数应接近 §1，实际 ${g.capabilities.length}`);
  assert.ok(Array.isArray(g.queries.section1Fight), '应有 section1Fight 数组');
});

test('归档规格进 sidecar，不入主图', () => {
  const g = parseGraph(repoRoot);
  const specPath =
    '_archive/方案/文档体系/切片/CapMap可视化-DSH插件/CapMap可视化-DSH插件-00-规格.md';
  assert.equal(
    g.nodes.some((n) => n.path === specPath || n.id === 'CapMap可视化-DSH插件-00-规格'),
    false,
    '规格不应入主图',
  );
  const spec = g.slices.find((s) => s.id === 'CapMap可视化-DSH插件-00-规格');
  assert.ok(spec, '规格应进 sidecar');
  assert.equal(spec!.schemeId, 'CapMap可视化-DSH插件');
});

test('真实 docs_root 图摘要', () => {
  const g = parseGraph(repoRoot);
  console.log(
    `nodes=${g.nodes.length} edges=${g.edges.length} (wiki=${g.edges.filter((e) => e.kind === 'wikilink').length} sem=${g.edges.filter((e) => e.kind === 'semantic').length}) caps=${g.capabilities.length}`,
  );
  assert.ok(g.nodes.length >= 12, `nodes ${g.nodes.length}`);
  assert.ok(g.edges.length >= 20, `edges ${g.edges.length}`);
  assert.ok(g.docsRoot.replace(/\\/g, '/').endsWith('/docs'));
});

test('方案索引/测试索引/规范索引 为 index，无主题', () => {
  const g = parseGraph(repoRoot);
  const schemeIdx = g.nodes.find((n) => n.path === '方案/方案索引.md');
  const testIdx = g.nodes.find((n) => n.path === '测试/测试索引.md');
  const normIdx = g.nodes.find((n) => n.path === '规范/规范索引.md');
  assert.ok(schemeIdx);
  assert.equal(schemeIdx!.type, 'index');
  assert.equal(schemeIdx!.theme, null);
  assert.ok(testIdx);
  assert.equal(testIdx!.type, 'index');
  assert.equal(testIdx!.theme, null);
  assert.ok(normIdx);
  assert.equal(normIdx!.type, 'index');
  assert.equal(normIdx!.theme, null);
});
