import type { CapMapGraph, CapMapNode } from '../parser/types';
import {
  highlightTree,
  renderCapMapTree,
  toggleFold,
  type CollapsedMap,
} from './panel/treeUi';

declare function acquireVsCodeApi(): {
  postMessage(msg: unknown): void;
  getState(): { collapsed?: CollapsedMap } | undefined;
  setState(state: { collapsed?: CollapsedMap }): void;
};

const vscode = acquireVsCodeApi();
const statusEl = document.getElementById('status')!;
const errEl = document.getElementById('error')!;
const treeEl = document.getElementById('tree')!;

let graph: CapMapGraph | null = null;
let selectedId: string | null = null;
let lastRevision = 0;
let reqSeq = 0;
const pending = new Map<
  string,
  { resolve: (v: unknown) => void; reject: (e: { message: string; code?: string }) => void }
>();
const collapsed: CollapsedMap = { ...(vscode.getState()?.collapsed ?? {}) };

function persistCollapsed() {
  vscode.setState({ collapsed: { ...collapsed } });
}

function call(endpoint: string, payload: Record<string, unknown> = {}): Promise<unknown> {
  const id = `req-${++reqSeq}`;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    vscode.postMessage({ type: 'request', id, endpoint, payload });
  });
}

function pathOf(id: string): string | null {
  const n = graph?.nodes.find((x: CapMapNode) => x.id === id);
  if (n) return n.path;
  const s = graph?.slices?.find((x) => x.id === id);
  return s?.path ?? null;
}

function render() {
  if (!graph) {
    treeEl.innerHTML = '';
    return;
  }
  treeEl.innerHTML = renderCapMapTree(graph, collapsed);
  highlightTree(treeEl, selectedId);
}

function showError(err: { message?: string } | string) {
  errEl.hidden = false;
  treeEl.hidden = true;
  errEl.textContent = typeof err === 'string' ? err : err.message || String(err);
}

function applyGraph(g: CapMapGraph) {
  graph = g;
  errEl.hidden = true;
  treeEl.hidden = false;
  statusEl.textContent = `${g.nodes.length} 节点 · rev=${lastRevision}`;
  render();
}

treeEl.addEventListener('click', (ev) => {
  const foldBtn = (ev.target as HTMLElement).closest('button.drawer-h') as HTMLButtonElement | null;
  if (foldBtn && toggleFold(treeEl, collapsed, foldBtn)) {
    persistCollapsed();
    return;
  }
  const item = (ev.target as HTMLElement).closest('button.drawer-item') as HTMLButtonElement | null;
  if (!item?.dataset.id) return;
  selectedId = item.dataset.id;
  highlightTree(treeEl, selectedId);
  vscode.postMessage({ type: 'ui', action: 'reveal', id: selectedId });
});

treeEl.addEventListener('dblclick', (ev) => {
  const item = (ev.target as HTMLElement).closest('button.drawer-item') as HTMLButtonElement | null;
  if (!item?.dataset.id) return;
  const path = pathOf(item.dataset.id);
  if (path) void call('open', { path });
});

async function load() {
  try {
    const g = (await call('parse', {})) as CapMapGraph;
    applyGraph(g);
    const w = (await call('watchStart', {})) as { revision?: number };
    lastRevision = w.revision || 0;
    statusEl.textContent = `${g.nodes.length} 节点 · rev=${lastRevision}`;
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
      .then((g) => applyGraph(g as CapMapGraph))
      .catch((e) => showError(e));
  }
  if (msg.type === 'event' && msg.event === 'select') {
    selectedId = msg.payload?.id ?? null;
    highlightTree(treeEl, selectedId);
  }
});

void load();
