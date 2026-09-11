import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  alignCapabilityToScheme,
  deriveFrontier,
  deriveQueries,
  deriveSection1Fight,
  deriveValidationGate,
  stripStatusPrefix,
} from './queries.ts';
import type { CapMapCapability, CapMapNode, CapMapSlice } from './types.ts';
import { parseGraph } from './parse.ts';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

test('stripStatusPrefix', () => {
  assert.equal(stripStatusPrefix('状态/开发中'), '开发中');
  assert.equal(stripStatusPrefix('开发中'), '开发中');
  assert.equal(stripStatusPrefix(null), null);
});

test('fixture：frontier 非空', () => {
  const slices: CapMapSlice[] = [
    {
      id: 'demo-01',
      title: '01-脚手架',
      status: '已验收',
      theme: '文档体系',
      schemeId: 'Demo方案',
      blockedBy: [],
      path: '方案/文档体系/切片/Demo方案/demo-01.md',
    },
    {
      id: 'demo-02',
      title: '02-解析器',
      status: '已验收',
      theme: '文档体系',
      schemeId: 'Demo方案',
      blockedBy: [],
      path: '方案/文档体系/切片/Demo方案/demo-02.md',
    },
    {
      id: 'demo-03',
      title: '03-图谱',
      status: '待开发',
      theme: '文档体系',
      schemeId: 'Demo方案',
      blockedBy: ['demo-01', 'demo-02'],
      path: '方案/文档体系/切片/Demo方案/demo-03.md',
    },
    {
      id: 'demo-04',
      title: '04-面板',
      status: '待开发',
      theme: '文档体系',
      schemeId: 'Demo方案',
      blockedBy: ['demo-03'],
      path: '方案/文档体系/切片/Demo方案/demo-04.md',
    },
  ];
  const rows = deriveFrontier(slices);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, 'frontier:demo-03');
  assert.equal(rows[0].schemeId, 'Demo方案');
});

test('fixture：验证门真卡住', () => {
  const nodes: CapMapNode[] = [
    {
      id: '方案A',
      title: '方案A',
      type: 'scheme',
      status: '已开发',
      path: '方案/文档体系/方案A.md',
      theme: '文档体系',
      summary: null,
      tags: ['方案', '状态/已开发'],
    },
    {
      id: '方案B',
      title: '方案B',
      type: 'scheme',
      status: '开发中',
      path: '方案/文档体系/方案B.md',
      theme: '文档体系',
      summary: null,
      tags: ['方案', '状态/开发中'],
    },
  ];
  const rows = deriveValidationGate(nodes);
  assert.ok(rows.some((r) => r.schemeId === '方案A'));
  assert.equal(
    rows.some((r) => r.schemeId === '方案B'),
    false,
    '开发中且无测试不应报',
  );
});

test('fixture：无法对齐不进打架；精确不等才打架', () => {
  const schemes: CapMapNode[] = [
    {
      id: 'CapMap可视化-DSH插件',
      title: 'CapMap 可视化 DSH 插件',
      type: 'scheme',
      status: '开发中',
      path: '方案/文档体系/CapMap可视化-DSH插件.md',
      theme: '文档体系',
      summary: null,
      tags: ['方案', '状态/开发中'],
    },
  ];
  const caps: CapMapCapability[] = [
    {
      name: 'CapMap 可视化（DSH 插件）',
      status: '方案中',
      summary: null,
      mapId: '能力底图-文档能力体系',
      theme: '文档体系',
      schemeWikilink: null,
    },
    {
      name: '幽灵能力',
      status: '已落地',
      summary: null,
      mapId: '能力底图-文档能力体系',
      theme: '文档体系',
      schemeWikilink: null,
    },
    {
      name: '[[CapMap可视化-DSH插件]]',
      status: '状态/开发中',
      summary: null,
      mapId: '能力底图-文档能力体系',
      theme: '文档体系',
      schemeWikilink: 'CapMap可视化-DSH插件',
    },
  ];
  assert.equal(alignCapabilityToScheme(caps[1], schemes), null);
  const fights = deriveSection1Fight(caps, schemes);
  assert.ok(fights.some((f) => f.schemeId === 'CapMap可视化-DSH插件' && f.section1Status === '方案中'));
  assert.equal(
    fights.some((f) => f.label.includes('幽灵')),
    false,
  );
  // wikilink 对齐且状态相同 → 不打架
  assert.equal(
    fights.some((f) => f.section1Status === '开发中' && f.schemeStatus === '开发中'),
    false,
  );
});

test('本仓 parseGraph：slices + 字段打架 + frontier 可开计数', () => {
  const g = parseGraph(repoRoot);
  assert.ok(g.slices.length >= 1, '应有切片 sidecar');
  assert.ok(g.queries, '应有 queries');
  // V2 已归档后不再与 §1「已落地」构成进行中打架
  const fightV2 = g.queries.section1Fight.filter((r) => r.schemeId === 'CapMap可视化-DSH插件V2');
  assert.equal(fightV2.length, 0, 'V2 已归档不应再进 §1 打架');
  const capmapFrontier = g.queries.frontier.filter((r) => r.schemeId === 'CapMap可视化-DSH插件V2');
  console.log(
    `slices=${g.slices.length} frontier=${g.queries.frontier.length} gate=${g.queries.validationGate.length} fight=${g.queries.section1Fight.length} capmapFrontier=${capmapFrontier.length}`,
  );
  assert.ok(Array.isArray(g.queries.frontier));
});

test('deriveQueries 主题筛选', () => {
  const q = deriveQueries(
    [
      {
        id: 'A',
        title: 'A',
        type: 'scheme',
        status: '已开发',
        path: 'x',
        theme: '文档体系',
        summary: null,
        tags: [],
      },
    ],
    [],
    [],
    '不存在主题',
  );
  assert.equal(q.validationGate.length, 0);
  assert.equal(q.frontier.length, 0);
  assert.equal(q.section1Fight.length, 0);
});
