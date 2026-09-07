import assert from 'node:assert/strict';
import test from 'node:test';
import { buildThemeTree, lifecycleCounts, listIndexNodes } from './themeTree.ts';
import type { CapMapGraph } from '../../parser/types.ts';

function sampleGraph(): CapMapGraph {
  return {
    theme: null,
    docsRoot: '/docs',
    nodes: [
      {
        id: '能力底图-文档能力体系',
        title: '能力底图-文档能力体系',
        type: 'map',
        status: null,
        path: '方案/文档体系/能力底图-文档能力体系.md',
        theme: '文档体系',
        summary: null,
        tags: ['能力底图'],
      },
      {
        id: 'CapMap可视化-DSH插件V3',
        title: 'CapMap可视化-DSH插件V3',
        type: 'scheme',
        status: '开发中',
        path: '方案/文档体系/CapMap可视化-DSH插件V3.md',
        theme: '文档体系',
        summary: null,
        tags: ['方案', '状态/开发中'],
      },
      {
        id: 'CapMap可视化-DSH插件V2',
        title: 'CapMap可视化-DSH插件V2',
        type: 'archive',
        status: '已归档',
        path: '_archive/方案/文档体系/CapMap可视化-DSH插件V2.md',
        theme: '文档体系',
        summary: null,
        tags: ['方案', '状态/已归档'],
      },
      {
        id: '测试-CapMap可视化-DSH插件V2',
        title: '测试-CapMap可视化-DSH插件V2',
        type: 'test',
        status: '已验证',
        path: '测试/文档体系/测试-CapMap可视化-DSH插件V2.md',
        theme: '文档体系',
        summary: null,
        tags: ['测试'],
      },
      {
        id: 'CapMap可视化-DSH插件安装与使用',
        title: '安装与使用',
        type: 'norm',
        status: '已落地',
        path: '规范/CapMap可视化-DSH插件安装与使用.md',
        theme: null,
        summary: null,
        tags: ['规范'],
      },
      {
        id: '测试-孤立草稿',
        title: '测试-孤立草稿',
        type: 'test',
        status: '测试中',
        path: '测试/文档体系/测试-孤立草稿.md',
        theme: '文档体系',
        summary: null,
        tags: ['测试'],
      },
    ],
    edges: [
      {
        source: '测试-CapMap可视化-DSH插件V2',
        target: 'CapMap可视化-DSH插件V2',
        kind: 'wikilink',
      },
      {
        source: 'CapMap可视化-DSH插件安装与使用',
        target: 'CapMap可视化-DSH插件V2',
        kind: 'wikilink',
      },
      {
        source: 'CapMap可视化-DSH插件安装与使用',
        target: 'CapMap可视化-DSH插件V3',
        kind: 'wikilink',
      },
    ],
    capabilities: [],
    slices: [],
    queries: { frontier: [], validationGate: [], section1Fight: [] },
  };
}

test('buildThemeTree：方案组 + 未归组 + 落地归档；规范可多挂', () => {
  const buckets = buildThemeTree(sampleGraph(), '全部');
  const doc = buckets.find((b) => b.theme === '文档体系');
  assert.ok(doc);
  assert.equal(doc!.maps.length, 1);
  assert.equal(doc!.active.length, 1);
  assert.equal(doc!.active[0].schemeId, 'CapMap可视化-DSH插件V3');
  assert.ok(doc!.active[0].norms.some((n) => n.id === 'CapMap可视化-DSH插件安装与使用'));
  assert.ok(doc!.ungrouped.some((n) => n.id === '测试-孤立草稿'));
  assert.equal(doc!.archived.length, 1);
  assert.equal(doc!.archived[0].schemeId, 'CapMap可视化-DSH插件V2');
  assert.ok(doc!.archived[0].tests.some((t) => t.id === '测试-CapMap可视化-DSH插件V2'));
  assert.ok(doc!.archived[0].norms.some((n) => n.id === 'CapMap可视化-DSH插件安装与使用'));
});

test('lifecycleCounts 按状态计数', () => {
  const rows = lifecycleCounts(sampleGraph().nodes, '全部');
  const m = Object.fromEntries(rows.map((r) => [r.status, r.count]));
  assert.equal(m['开发中'], 1);
  assert.equal(m['已归档'], 1);
  assert.equal(m['已验证'], 1);
});

test('主题树不含方案索引/测试索引', () => {
  const g = sampleGraph();
  g.nodes.push(
    {
      id: '方案索引',
      title: '方案索引',
      type: 'index',
      status: null,
      path: '方案/方案索引.md',
      theme: null,
      summary: null,
      tags: ['方案索引'],
    },
    {
      id: '测试索引',
      title: '测试索引',
      type: 'index',
      status: null,
      path: '测试/测试索引.md',
      theme: null,
      summary: null,
      tags: ['测试索引'],
    },
  );
  const buckets = buildThemeTree(g, '全部');
  assert.equal(buckets.some((b) => b.theme.includes('索引')), false);
  for (const b of buckets) {
    for (const group of [...b.active, ...b.archived]) {
      assert.notEqual(group.schemeId, '方案索引');
      assert.notEqual(group.schemeId, '测试索引');
    }
  }
});

test('listIndexNodes 顶层索引排序', () => {
  const g = sampleGraph();
  g.nodes.push(
    {
      id: '测试索引',
      title: '测试索引',
      type: 'index',
      status: null,
      path: '测试/测试索引.md',
      theme: null,
      summary: null,
      tags: ['测试索引'],
    },
    {
      id: '方案索引',
      title: '方案索引',
      type: 'index',
      status: null,
      path: '方案/方案索引.md',
      theme: null,
      summary: null,
      tags: ['方案索引'],
    },
    {
      id: '文档首页',
      title: '文档首页',
      type: 'index',
      status: null,
      path: '文档首页.md',
      theme: null,
      summary: null,
      tags: ['文档首页'],
    },
  );
  const idxs = listIndexNodes(g.nodes);
  assert.deepEqual(
    idxs.map((x) => x.id),
    ['文档首页', '方案索引', '测试索引'],
  );
});

test('切片目录下的归档规格不当成方案组', () => {
  const g = sampleGraph();
  g.nodes.push({
    id: 'CapMap可视化-DSH插件',
    title: 'CapMap可视化-DSH插件',
    type: 'archive',
    status: '已归档',
    path: '_archive/方案/文档体系/CapMap可视化-DSH插件.md',
    theme: '文档体系',
    summary: null,
    tags: ['方案', '状态/已归档'],
  });
  // 就算规格误入主图，路径含 /切片/ 也不应成方案组
  g.nodes.push({
    id: 'CapMap可视化-DSH插件-00-规格',
    title: '规格：CapMap',
    type: 'archive',
    status: null,
    path: '_archive/方案/文档体系/切片/CapMap可视化-DSH插件/CapMap可视化-DSH插件-00-规格.md',
    theme: '文档体系',
    summary: null,
    tags: ['规格'],
  });
  g.slices.push({
    id: 'CapMap可视化-DSH插件-00-规格',
    title: '规格：CapMap',
    status: null,
    theme: '文档体系',
    schemeId: 'CapMap可视化-DSH插件',
    blockedBy: [],
    path: '_archive/方案/文档体系/切片/CapMap可视化-DSH插件/CapMap可视化-DSH插件-00-规格.md',
  });
  const buckets = buildThemeTree(g, '全部');
  const doc = buckets.find((b) => b.theme === '文档体系')!;
  assert.equal(
    doc.archived.some((a) => a.schemeId === 'CapMap可视化-DSH插件-00-规格'),
    false,
  );
  const sch = doc.archived.find((a) => a.schemeId === 'CapMap可视化-DSH插件');
  assert.ok(sch);
  assert.ok(sch!.slices.some((s) => s.id === 'CapMap可视化-DSH插件-00-规格'));
});
