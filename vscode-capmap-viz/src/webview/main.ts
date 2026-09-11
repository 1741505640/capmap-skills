import type { CapMapGraph, CapMapNode } from '../parser/types';
import { mountGraph } from './graph/mount';
import { renderMarkdownLite } from './panel/markdownLite';

declare function acquireVsCodeApi(): {
  postMessage(msg: unknown): void;
};

const vscode = acquireVsCodeApi();

const statusEl = document.getElementById('status')!;
const errEl = document.getElementById('error')!;
const shellEl = document.getElementById('shell')!;
const graphEl = document.getElementById('graph')!;
const detailEl = document.getElementById('detail')!;
const previewEl = document.getElementById('preview')!;

let graph: CapMapGraph | null = null;
let selectedId: string | null = null;
let lastRevision = 0;
let reqSeq = 0;
const pending = new Map<
  string,
  { resolve: (v: unknown) => void; reject: (e: { message: string; code?: string }) => void }
>();

function call(endpoint: string, payload: Record<string, unknown> = {}): Promise<unknown> {
  const id = `req-${++reqSeq}`;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    vscode.postMessage({ type: 'request', id, endpoint, payload });
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const view = mountGraph(graphEl, {
  onSelect(id) {
    selectedId = id;
    renderDetail(true);
    updateStatusSelected();
  },
});

function updateStatusSelected() {
  const base = statusEl.dataset.base || '';
  statusEl.textContent = selectedId ? `${base} · selected=${selectedId}` : base;
}

function showError(err: { message?: string } | string) {
  errEl.hidden = false;
  shellEl.hidden = true;
  errEl.textContent = typeof err === 'string' ? err : err.message || String(err);
}

function nodeById(id: string): CapMapNode | undefined {
  return graph?.nodes.find((n) => n.id === id);
}

function renderDetail(animate = false) {
  detailEl.classList.toggle('has-selection', Boolean(selectedId));
  if (animate) {
    detailEl.classList.remove('detail-pop');
    void detailEl.offsetWidth;
    detailEl.classList.add('detail-pop');
  }

  if (!selectedId || !graph) {
    detailEl.innerHTML =
      '<div class="detail-empty muted">点选图谱节点或侧栏目录查看详情</div>';
    shellEl.classList.remove('detail-open');
    return;
  }

  shellEl.classList.add('detail-open');

  const n = nodeById(selectedId);
  if (!n) {
    const slice = graph.slices?.find((s) => s.id === selectedId);
    if (slice) {
      detailEl.innerHTML = detailHtml({
        title: slice.title,
        kind: '切片',
        status: slice.status,
        theme: slice.theme,
        path: slice.path,
        summary: null,
      });
      bindDetailActions(slice.path, slice.title);
      return;
    }
    detailEl.innerHTML = '<div class="detail-empty muted">未找到节点</div>';
    return;
  }

  detailEl.innerHTML = detailHtml({
    title: n.title,
    kind: n.type,
    status: n.status,
    theme: n.theme,
    path: n.path,
    summary: n.summary,
  });
  bindDetailActions(n.path, n.title);
}

function detailHtml(d: {
  title: string;
  kind: string;
  status: string | null;
  theme: string | null;
  path: string;
  summary: string | null;
}): string {
  return `
    <div class="detail-h">${escapeHtml(d.title)}</div>
    <div class="muted">${escapeHtml(d.kind)}${d.status ? ' · ' + escapeHtml(d.status) : ''}${d.theme ? ' · ' + escapeHtml(d.theme) : ''}</div>
    <button type="button" class="detail-path linkish" id="btn-path" title="打开文件">${escapeHtml(d.path)}</button>
    ${d.summary ? `<p class="detail-sum">${escapeHtml(d.summary)}</p>` : ''}
    <div class="detail-actions">
      <button type="button" id="btn-open" class="primary">打开文件</button>
      <button type="button" id="btn-preview" class="secondary">只读预览</button>
    </div>`;
}

function bindDetailActions(relPath: string, title: string) {
  document.getElementById('btn-open')?.addEventListener('click', () => {
    void openFile(relPath);
  });
  document.getElementById('btn-path')?.addEventListener('click', () => {
    void openFile(relPath);
  });
  document.getElementById('btn-preview')?.addEventListener('click', () => {
    void openPreview(relPath, title);
  });
}

async function openFile(relPath: string) {
  try {
    await call('open', { path: relPath });
  } catch (e) {
    const msg = (e as { message?: string }).message || String(e);
    statusEl.textContent = `打开失败：${msg}`;
  }
}

async function openPreview(relPath: string, title: string) {
  try {
    const res = (await call('read', { path: relPath })) as { path: string; text: string };
    previewEl.hidden = false;
    previewEl.innerHTML = `
      <div class="preview-card" role="dialog">
        <div class="preview-bar">
          <strong>${escapeHtml(title)}</strong>
          <span class="pill">只读</span>
          <span class="muted">${escapeHtml(res.path)}</span>
          <button type="button" id="btn-open-from-preview" class="secondary">打开文件</button>
          <button type="button" id="btn-preview-close">关闭</button>
        </div>
        <div class="preview-body md">${renderMarkdownLite(res.text)}</div>
      </div>`;
    document.getElementById('btn-preview-close')?.addEventListener('click', closePreview);
    document.getElementById('btn-open-from-preview')?.addEventListener('click', () => {
      void openFile(res.path);
    });
  } catch (e) {
    const msg = (e as { message?: string }).message || String(e);
    previewEl.hidden = false;
    previewEl.innerHTML = `
      <div class="preview-card">
        <div class="preview-bar"><strong>预览失败</strong><button type="button" id="btn-preview-close">关闭</button></div>
        <pre class="stub-json">${escapeHtml(msg)}</pre>
      </div>`;
    document.getElementById('btn-preview-close')?.addEventListener('click', closePreview);
  }
}

function closePreview() {
  previewEl.hidden = true;
  previewEl.innerHTML = '';
}

function selectFromUi(id: string) {
  selectedId = id;
  view.selectNode(id, true);
  renderDetail(true);
  updateStatusSelected();
}

function applyGraph(g: CapMapGraph, keepSelected: boolean) {
  graph = g;
  errEl.hidden = true;
  shellEl.hidden = false;
  const wiki = g.edges.filter((e) => e.kind === 'wikilink').length;
  const base = `docsRoot=${g.docsRoot} · nodes=${g.nodes.length} · edges=${g.edges.length} (wiki=${wiki}) · rev=${lastRevision}`;
  statusEl.dataset.base = base;
  statusEl.textContent = base + ' · watching';
  view.setGraph(g, { keepSelected });
  if (keepSelected && selectedId) {
    view.selectNode(selectedId, false);
  } else if (!keepSelected) {
    selectedId = null;
  }
  renderDetail(false);
}

previewEl.addEventListener('click', (ev) => {
  if (ev.target === previewEl) closePreview();
});

window.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') closePreview();
});

async function load() {
  try {
    const g = (await call('parse', {})) as CapMapGraph;
    applyGraph(g, false);
    const w = (await call('watchStart', {})) as { revision?: number };
    lastRevision = w.revision || 0;
    const base = statusEl.dataset.base?.replace(/ · rev=\d+/, ` · rev=${lastRevision}`) || '';
    statusEl.dataset.base = base;
    statusEl.textContent = base + ' · watching';
    vscode.postMessage({ type: 'ui', action: 'ready' });
  } catch (e) {
    showError(e as { message: string });
  }
}

window.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg) return;
  if (msg.type === 'response') {
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    if (msg.ok) p.resolve(msg.result);
    else p.reject(msg.error || { message: 'unknown error' });
  }
  if (msg.type === 'event' && msg.event === 'revision') {
    lastRevision = msg.payload.revision;
    statusEl.textContent = `rev=${lastRevision} · refreshing…`;
    call('parse', {})
      .then((g) => applyGraph(g as CapMapGraph, true))
      .catch((e) => showError(e));
  }
  if (msg.type === 'event' && msg.event === 'select') {
    const id = msg.payload?.id as string | undefined;
    if (id) selectFromUi(id);
  }
});

void load();
