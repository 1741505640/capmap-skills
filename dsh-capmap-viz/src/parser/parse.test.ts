// CapMapParser 单测（node:test）。Node ≥ 23.6 原生 type-stripping 可直接跑 .ts。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseGraph,
  parseFrontMatter,
  parseWikilinks,
  classifyNode,
  tagsOf,
} from './parse.ts';

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

const HERE = fileURLToPath(new URL('.', import.meta.url));
const DOCS_ROOT = resolve(HERE, '..', '..', '..', 'docs');

test('parseFrontMatter 解析 tags 块列表', () => {
  const src = '---\ntags:\n  - 方案\n  - 状态/已确认\n  - 体量/大\n---\n\n# Title\n';
  const { data, body } = parseFrontMatter(src);
  assert.deepEqual(tagsOf(data), ['方案', '状态/已确认', '体量/大']);
  assert.ok(body.includes('# Title'));
});

test('parseWikilinks 解析别名与路径并去 .md', () => {
  const links = parseWikilinks('见 [[能力底图-文档能力体系]] · [[归档索引|归档]] · [[path/name.md]]');
  assert.deepEqual(links, ['能力底图-文档能力体系', '归档索引', 'name']);
});

test('classifyNode 分型', () => {
  assert.equal(classifyNode('_archive/方案/文档体系/x.md'), 'archive');
  assert.equal(classifyNode('方案/文档体系/能力底图-x.md'), 'map');
  assert.equal(classifyNode('测试/文档体系/测试-x.md'), 'test');
  assert.equal(classifyNode('规范/x.md'), 'norm');
  assert.equal(classifyNode('文档首页.md'), 'index');
  assert.equal(classifyNode('方案/文档体系/x.md'), 'scheme');
  assert.equal(classifyNode('方案/文档体系/切片/x/x-01-a.md'), null);
});

test('parseGraph 对真实 capmap-skills docs_root', () => {
  const files = walk(DOCS_ROOT).map((f) => ({
    path: relative(DOCS_ROOT, f).replace(/\\/g, '/'),
    content: readFileSync(f, 'utf8'),
  }));
  const g = parseGraph(files);
  const byType = (t: string) => g.nodes.filter((n) => n.type === t);

  assert.ok(g.nodes.length > 10, 'nodes > 10');
  assert.ok(g.edges.length > 0, 'edges > 0');
  assert.ok(byType('map').length >= 1, 'has capability map node');
  assert.ok(byType('scheme').length >= 1, 'has scheme node');
  assert.ok(byType('archive').length >= 1, 'has archive node');
  assert.ok(g.capabilities.length >= 1, 'has capabilities from §1');

  const ids = new Set(g.nodes.map((n) => n.id));
  for (const e of g.edges) {
    assert.ok(ids.has(e.source) && ids.has(e.target), `edge resolves: ${e.source} -> ${e.target}`);
  }

  // Demo 摘要
  console.log(
    JSON.stringify(
      {
        themes: g.themes,
        nodeCount: g.nodes.length,
        edgeCount: g.edges.length,
        wikilinkEdges: g.edges.filter((e) => e.kind === 'wikilink').length,
        semanticEdges: g.edges.filter((e) => e.kind === 'semantic').length,
        capabilityCount: g.capabilities.length,
        byType: Object.fromEntries(
          ['map', 'scheme', 'test', 'norm', 'index', 'archive'].map((t) => [t, byType(t).length]),
        ),
      },
      null,
      2,
    ),
  );
});
