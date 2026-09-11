/**
 * 侧栏 / 主面板共用的目录树 HTML 渲染（可折叠）。
 */
import type { CapMapGraph } from '../../parser/types';
import {
  buildThemeTree,
  listIndexNodes,
  type ThemeBucket,
  type ThemeSchemeGroup,
  type ThemeTreeLeaf,
} from './themeTree';

export type CollapsedMap = Record<string, boolean>;

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sectionOpen(collapsed: CollapsedMap, key: string, defaultOpen = true): boolean {
  if (key in collapsed) return !collapsed[key];
  return defaultOpen;
}

function foldHeader(collapsed: CollapsedMap, key: string, label: string, defaultOpen = true): string {
  const open = sectionOpen(collapsed, key, defaultOpen);
  return `<button type="button" class="drawer-h" data-fold="${escapeHtml(key)}" aria-expanded="${open ? 'true' : 'false'}"><span class="chev">${open ? '▾' : '▸'}</span> ${escapeHtml(label)}</button>`;
}

function foldBody(collapsed: CollapsedMap, key: string, inner: string, defaultOpen = true): string {
  const open = sectionOpen(collapsed, key, defaultOpen);
  return `<div class="drawer-body${open ? '' : ' is-collapsed'}" data-fold-body="${escapeHtml(key)}"><div class="drawer-body-inner">${inner}</div></div>`;
}

function leafButton(leaf: ThemeTreeLeaf, nested = false): string {
  const st = leaf.status ? ` · ${escapeHtml(leaf.status)}` : '';
  return `<button type="button" class="drawer-item${nested ? ' nested' : ''}" data-id="${escapeHtml(leaf.id)}" title="单击打开图谱 · 双击打开文件"><span class="t">${escapeHtml(leaf.type)}</span><span class="title">${escapeHtml(leaf.title)}</span><span class="s">${st}</span></button>`;
}

function renderSchemeGroup(
  collapsed: CollapsedMap,
  theme: string,
  g: ThemeSchemeGroup,
  archived: boolean,
): string {
  const key = `grp:${theme}:${g.schemeId}`;
  const kids: string[] = [];
  if (g.scheme) kids.push(leafButton(g.scheme));
  for (const s of g.slices) kids.push(leafButton(s, true));
  for (const t of g.tests) kids.push(leafButton(t, true));
  for (const n of g.norms) kids.push(leafButton(n, true));
  const hasKids = g.slices.length + g.tests.length + g.norms.length > 0;
  if (!hasKids) {
    return `<div class="drawer-group">${g.scheme ? leafButton(g.scheme) : ''}</div>`;
  }
  const defaultOpen = !archived && g.schemeId === 'CapMap可视化-VSCode扩展';
  const label = g.title + (g.status ? ` · ${g.status}` : '');
  return `<div class="drawer-group">${foldHeader(collapsed, key, label, defaultOpen)}${foldBody(collapsed, key, kids.join(''), defaultOpen)}</div>`;
}

function renderBucket(collapsed: CollapsedMap, b: ThemeBucket): string {
  const key = `sec:${b.theme}`;
  const chunks: string[] = [];
  for (const m of b.maps) chunks.push(leafButton(m));
  for (const g of b.active) chunks.push(renderSchemeGroup(collapsed, b.theme, g, false));
  if (b.ungrouped.length) {
    const uk = `sub:${b.theme}:ungrouped`;
    chunks.push(
      foldHeader(collapsed, uk, '未归组', false) +
        foldBody(collapsed, uk, b.ungrouped.map((u) => leafButton(u)).join(''), false),
    );
  }
  if (b.archived.length) {
    const ak = `sub:${b.theme}:archived`;
    const archInner = b.archived.map((g) => renderSchemeGroup(collapsed, b.theme, g, true)).join('');
    chunks.push(foldHeader(collapsed, ak, '落地 / 归档', false) + foldBody(collapsed, ak, archInner, false));
  }
  const defaultOpen = b.active.length > 0 || b.maps.length > 0;
  return `<div class="drawer-sec">${foldHeader(collapsed, key, b.theme, defaultOpen)}${foldBody(collapsed, key, chunks.join(''), defaultOpen)}</div>`;
}

export function renderCapMapTree(graph: CapMapGraph, collapsed: CollapsedMap): string {
  const indexes = listIndexNodes(graph.nodes);
  const buckets = buildThemeTree(graph, '全部');
  const parts: string[] = [];
  {
    const key = 'sec:索引';
    const inner = indexes.map((leaf) => leafButton(leaf)).join('');
    parts.push(
      `<div class="drawer-sec">${foldHeader(collapsed, key, '索引')}${foldBody(collapsed, key, inner)}</div>`,
    );
  }
  for (const b of buckets) parts.push(renderBucket(collapsed, b));
  return parts.join('');
}

/** 处理折叠标题点击；返回是否已处理。 */
export function toggleFold(
  root: HTMLElement,
  collapsed: CollapsedMap,
  foldBtn: HTMLButtonElement,
): boolean {
  const key = foldBtn.dataset.fold;
  if (!key) return false;
  const open = foldBtn.getAttribute('aria-expanded') !== 'true';
  foldBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  const chev = foldBtn.querySelector('.chev');
  if (chev) chev.textContent = open ? '▾' : '▸';
  const body = root.querySelector<HTMLElement>(`.drawer-body[data-fold-body="${CSS.escape(key)}"]`);
  body?.classList.toggle('is-collapsed', !open);
  collapsed[key] = !open;
  return true;
}

export function highlightTree(root: HTMLElement, selectedId: string | null): void {
  for (const btn of root.querySelectorAll<HTMLButtonElement>('.drawer-item')) {
    const on = btn.dataset.id === selectedId;
    btn.classList.toggle('active', on);
    if (on) btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}
