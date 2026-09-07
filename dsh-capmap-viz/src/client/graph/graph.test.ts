import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statusDashed, statusStroke, typeFill } from './colors.ts';
import {
  clampZoom,
  degree,
  fitTransform,
  hitNode,
  oneHop,
  screenToWorld,
  worldToScreen,
  zoomAt,
} from './model.ts';

const edges = [
  { source: 'a', target: 'b', kind: 'wikilink' },
  { source: 'b', target: 'c', kind: 'wikilink' },
  { source: 'map', target: 'a', kind: 'semantic' },
];

test('typeFill / statusStroke 按类型与状态着色', () => {
  assert.equal(typeFill('scheme'), '#22c55e');
  assert.equal(statusStroke('方案中'), '#e2e8f0');
  assert.equal(statusStroke('开发中'), '#f97316');
  assert.equal(statusStroke('已开发'), '#22d3ee');
  assert.notEqual(statusStroke('开发中'), statusStroke('已开发'));
  assert.deepEqual(statusDashed('已归档'), [4, 3]);
  assert.equal(statusDashed('开发中'), null);
  assert.ok(statusStroke(null));
});

test('oneHop 仅沿可见边，含自身', () => {
  const hop = oneHop('b', edges, new Set(['wikilink']));
  assert.deepEqual([...hop].sort(), ['a', 'b', 'c']);
  const withSem = oneHop('a', edges);
  assert.ok(withSem.has('map'));
});

test('degree 不计自环、可过滤 kind', () => {
  assert.equal(degree('b', edges, new Set(['wikilink'])), 2);
  assert.equal(degree('a', edges, new Set(['wikilink'])), 1);
  assert.equal(degree('a', edges), 2);
});

test('hitNode 命中最上层节点', () => {
  const nodes = [{ id: 'a' }, { id: 'b' }];
  const pos = { a: { x: 0, y: 0 }, b: { x: 3, y: 0 } };
  assert.equal(hitNode(nodes, pos, 3, 0, 5), 'b');
  assert.equal(hitNode(nodes, pos, 80, 80, 5), null);
});

test('fitTransform 把包围盒放进视口中心', () => {
  const cam = fitTransform(
    [
      { x: 0, y: 0 },
      { x: 100, y: 50 },
    ],
    400,
    300,
    50,
  );
  const mid = worldToScreen(cam, 50, 25);
  assert.ok(Math.abs(mid.x - 200) < 1);
  assert.ok(Math.abs(mid.y - 150) < 1);
  assert.ok(cam.k > 0);
});

test('zoomAt 保持锚点世界坐标', () => {
  const cam0 = { x: 10, y: 20, k: 1 };
  const cam1 = zoomAt(cam0, 100, 80, 2);
  const w0 = screenToWorld(cam0, 100, 80);
  const w1 = screenToWorld(cam1, 100, 80);
  assert.ok(Math.abs(w0.x - w1.x) < 1e-9);
  assert.ok(Math.abs(w0.y - w1.y) < 1e-9);
  assert.equal(clampZoom(0.01), 0.2);
  assert.equal(clampZoom(99), 8);
});
