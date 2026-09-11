"use strict";
(() => {
  // src/webview/panel/themeTree.ts
  function isArchivedNode(n) {
    return n.type === "archive" || n.path.startsWith("_archive/") || n.status === "\u5DF2\u5F52\u6863" || n.tags.includes("\u5DF2\u5F52\u6863") || n.tags.includes("\u72B6\u6001/\u5DF2\u5F52\u6863");
  }
  function leafOf(n) {
    return { id: n.id, title: n.title, type: n.type, status: n.status };
  }
  function sliceLeaf(s) {
    return { id: s.id, title: s.title, type: "slice", status: s.status };
  }
  function linkedDocIds(schemeId, edges) {
    const out = /* @__PURE__ */ new Set();
    for (const e of edges) {
      if (e.kind !== "wikilink") continue;
      if (e.source === schemeId) out.add(e.target);
      if (e.target === schemeId) out.add(e.source);
    }
    return out;
  }
  function buildThemeTree(graph2, themeFilter) {
    const nodes = graph2.nodes;
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const themeNames = /* @__PURE__ */ new Set();
    for (const n of nodes) {
      if (themeFilter !== "\u5168\u90E8" && n.theme !== themeFilter) continue;
      if (n.theme) themeNames.add(n.theme);
    }
    const buckets = [];
    for (const theme of [...themeNames].sort()) {
      const inTheme = (n) => n.theme === theme;
      const maps = nodes.filter((n) => inTheme(n) && n.type === "map").map(leafOf);
      const schemes = nodes.filter(
        (n) => inTheme(n) && n.type !== "index" && !n.path.includes("/\u5207\u7247/") && (n.type === "scheme" || n.type === "archive" && n.path.includes("/\u65B9\u6848/") && !/索引\.md$/.test(n.path))
      );
      const active = [];
      const archived = [];
      const claimed = /* @__PURE__ */ new Set();
      for (const sch of schemes) {
        const archivedFlag = isArchivedNode(sch);
        const links = linkedDocIds(sch.id, graph2.edges);
        const slices = (graph2.slices ?? []).filter((s) => s.schemeId === sch.id || s.schemeId === sch.title).map(sliceLeaf);
        const tests = [];
        const norms = [];
        for (const id of links) {
          const n = byId.get(id);
          if (!n) continue;
          if (n.type === "test") {
            tests.push(leafOf(n));
            claimed.add(n.id);
          } else if (n.type === "norm") {
            norms.push(leafOf(n));
            claimed.add(n.id);
          }
        }
        const group = {
          schemeId: sch.id,
          title: sch.title,
          status: sch.status,
          archived: archivedFlag,
          scheme: leafOf(sch),
          slices,
          tests,
          norms
        };
        if (archivedFlag) archived.push(group);
        else active.push(group);
      }
      const ungrouped = [];
      for (const n of nodes) {
        if (!inTheme(n)) continue;
        if (n.type !== "test" && n.type !== "norm") continue;
        if (claimed.has(n.id)) continue;
        ungrouped.push(leafOf(n));
      }
      buckets.push({ theme, maps, active, ungrouped, archived });
    }
    if (themeFilter === "\u5168\u90E8") {
      const claimedAll = /* @__PURE__ */ new Set();
      for (const b of buckets) {
        for (const g of [...b.active, ...b.archived]) {
          for (const t of g.tests) claimedAll.add(t.id);
          for (const n of g.norms) claimedAll.add(n.id);
        }
        for (const u of b.ungrouped) claimedAll.add(u.id);
      }
      const unlinked = nodes.filter((n) => {
        if (n.type !== "norm" && !(n.type === "test" && !n.theme)) return false;
        if (claimedAll.has(n.id)) return false;
        if (n.theme && themeNames.has(n.theme)) return false;
        return true;
      });
      if (unlinked.length > 0) {
        buckets.push({
          theme: "\uFF08\u672A\u5F52\u7EC4\uFF09",
          maps: [],
          active: [],
          ungrouped: unlinked.map(leafOf),
          archived: []
        });
      }
    }
    return buckets;
  }
  var INDEX_ORDER = ["\u6587\u6863\u9996\u9875", "\u9879\u76EE\u5168\u8C8C", "\u65B9\u6848\u7D22\u5F15", "\u6D4B\u8BD5\u7D22\u5F15", "\u89C4\u8303\u7D22\u5F15", "\u5F52\u6863\u7D22\u5F15", "\u80FD\u529B\u603B\u89C8"];
  function listIndexNodes(nodes) {
    const indexes = nodes.filter((n) => n.type === "index" || n.type === "overview").map(leafOf);
    indexes.sort((a, b) => {
      const ia = INDEX_ORDER.findIndex((k) => a.id.includes(k) || a.title.includes(k));
      const ib = INDEX_ORDER.findIndex((k) => b.id.includes(k) || b.title.includes(k));
      if (ia >= 0 || ib >= 0) return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
      return a.title.localeCompare(b.title, "zh");
    });
    return indexes;
  }

  // src/webview/panel/treeUi.ts
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function sectionOpen(collapsed2, key, defaultOpen = true) {
    if (key in collapsed2) return !collapsed2[key];
    return defaultOpen;
  }
  function foldHeader(collapsed2, key, label, defaultOpen = true) {
    const open = sectionOpen(collapsed2, key, defaultOpen);
    return `<button type="button" class="drawer-h" data-fold="${escapeHtml(key)}" aria-expanded="${open ? "true" : "false"}"><span class="chev">${open ? "\u25BE" : "\u25B8"}</span> ${escapeHtml(label)}</button>`;
  }
  function foldBody(collapsed2, key, inner, defaultOpen = true) {
    const open = sectionOpen(collapsed2, key, defaultOpen);
    return `<div class="drawer-body${open ? "" : " is-collapsed"}" data-fold-body="${escapeHtml(key)}"><div class="drawer-body-inner">${inner}</div></div>`;
  }
  function leafButton(leaf, nested = false) {
    const st = leaf.status ? ` \xB7 ${escapeHtml(leaf.status)}` : "";
    return `<button type="button" class="drawer-item${nested ? " nested" : ""}" data-id="${escapeHtml(leaf.id)}" title="\u5355\u51FB\u6253\u5F00\u56FE\u8C31 \xB7 \u53CC\u51FB\u6253\u5F00\u6587\u4EF6"><span class="t">${escapeHtml(leaf.type)}</span><span class="title">${escapeHtml(leaf.title)}</span><span class="s">${st}</span></button>`;
  }
  function renderSchemeGroup(collapsed2, theme, g, archived) {
    const key = `grp:${theme}:${g.schemeId}`;
    const kids = [];
    if (g.scheme) kids.push(leafButton(g.scheme));
    for (const s of g.slices) kids.push(leafButton(s, true));
    for (const t of g.tests) kids.push(leafButton(t, true));
    for (const n of g.norms) kids.push(leafButton(n, true));
    const hasKids = g.slices.length + g.tests.length + g.norms.length > 0;
    if (!hasKids) {
      return `<div class="drawer-group">${g.scheme ? leafButton(g.scheme) : ""}</div>`;
    }
    const defaultOpen = !archived && g.schemeId === "CapMap\u53EF\u89C6\u5316-VSCode\u6269\u5C55";
    const label = g.title + (g.status ? ` \xB7 ${g.status}` : "");
    return `<div class="drawer-group">${foldHeader(collapsed2, key, label, defaultOpen)}${foldBody(collapsed2, key, kids.join(""), defaultOpen)}</div>`;
  }
  function renderBucket(collapsed2, b) {
    const key = `sec:${b.theme}`;
    const chunks = [];
    for (const m of b.maps) chunks.push(leafButton(m));
    for (const g of b.active) chunks.push(renderSchemeGroup(collapsed2, b.theme, g, false));
    if (b.ungrouped.length) {
      const uk = `sub:${b.theme}:ungrouped`;
      chunks.push(
        foldHeader(collapsed2, uk, "\u672A\u5F52\u7EC4", false) + foldBody(collapsed2, uk, b.ungrouped.map((u) => leafButton(u)).join(""), false)
      );
    }
    if (b.archived.length) {
      const ak = `sub:${b.theme}:archived`;
      const archInner = b.archived.map((g) => renderSchemeGroup(collapsed2, b.theme, g, true)).join("");
      chunks.push(foldHeader(collapsed2, ak, "\u843D\u5730 / \u5F52\u6863", false) + foldBody(collapsed2, ak, archInner, false));
    }
    const defaultOpen = b.active.length > 0 || b.maps.length > 0;
    return `<div class="drawer-sec">${foldHeader(collapsed2, key, b.theme, defaultOpen)}${foldBody(collapsed2, key, chunks.join(""), defaultOpen)}</div>`;
  }
  function renderCapMapTree(graph2, collapsed2) {
    const indexes = listIndexNodes(graph2.nodes);
    const buckets = buildThemeTree(graph2, "\u5168\u90E8");
    const parts = [];
    {
      const key = "sec:\u7D22\u5F15";
      const inner = indexes.map((leaf) => leafButton(leaf)).join("");
      parts.push(
        `<div class="drawer-sec">${foldHeader(collapsed2, key, "\u7D22\u5F15")}${foldBody(collapsed2, key, inner)}</div>`
      );
    }
    for (const b of buckets) parts.push(renderBucket(collapsed2, b));
    return parts.join("");
  }
  function toggleFold(root, collapsed2, foldBtn) {
    const key = foldBtn.dataset.fold;
    if (!key) return false;
    const open = foldBtn.getAttribute("aria-expanded") !== "true";
    foldBtn.setAttribute("aria-expanded", open ? "true" : "false");
    const chev = foldBtn.querySelector(".chev");
    if (chev) chev.textContent = open ? "\u25BE" : "\u25B8";
    const body = root.querySelector(`.drawer-body[data-fold-body="${CSS.escape(key)}"]`);
    body?.classList.toggle("is-collapsed", !open);
    collapsed2[key] = !open;
    return true;
  }
  function highlightTree(root, selectedId2) {
    for (const btn of root.querySelectorAll(".drawer-item")) {
      const on = btn.dataset.id === selectedId2;
      btn.classList.toggle("active", on);
      if (on) btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  // src/webview/sidebar-main.ts
  var vscode = acquireVsCodeApi();
  var statusEl = document.getElementById("status");
  var errEl = document.getElementById("error");
  var treeEl = document.getElementById("tree");
  var graph = null;
  var selectedId = null;
  var lastRevision = 0;
  var reqSeq = 0;
  var pending = /* @__PURE__ */ new Map();
  var collapsed = { ...vscode.getState()?.collapsed ?? {} };
  function persistCollapsed() {
    vscode.setState({ collapsed: { ...collapsed } });
  }
  function call(endpoint, payload = {}) {
    const id = `req-${++reqSeq}`;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      vscode.postMessage({ type: "request", id, endpoint, payload });
    });
  }
  function pathOf(id) {
    const n = graph?.nodes.find((x) => x.id === id);
    if (n) return n.path;
    const s = graph?.slices?.find((x) => x.id === id);
    return s?.path ?? null;
  }
  function render() {
    if (!graph) {
      treeEl.innerHTML = "";
      return;
    }
    treeEl.innerHTML = renderCapMapTree(graph, collapsed);
    highlightTree(treeEl, selectedId);
  }
  function showError(err) {
    errEl.hidden = false;
    treeEl.hidden = true;
    errEl.textContent = typeof err === "string" ? err : err.message || String(err);
  }
  function applyGraph(g) {
    graph = g;
    errEl.hidden = true;
    treeEl.hidden = false;
    statusEl.textContent = `${g.nodes.length} \u8282\u70B9 \xB7 rev=${lastRevision}`;
    render();
  }
  treeEl.addEventListener("click", (ev) => {
    const foldBtn = ev.target.closest("button.drawer-h");
    if (foldBtn && toggleFold(treeEl, collapsed, foldBtn)) {
      persistCollapsed();
      return;
    }
    const item = ev.target.closest("button.drawer-item");
    if (!item?.dataset.id) return;
    selectedId = item.dataset.id;
    highlightTree(treeEl, selectedId);
    vscode.postMessage({ type: "ui", action: "reveal", id: selectedId });
  });
  treeEl.addEventListener("dblclick", (ev) => {
    const item = ev.target.closest("button.drawer-item");
    if (!item?.dataset.id) return;
    const path = pathOf(item.dataset.id);
    if (path) void call("open", { path });
  });
  async function load() {
    try {
      const g = await call("parse", {});
      applyGraph(g);
      const w = await call("watchStart", {});
      lastRevision = w.revision || 0;
      statusEl.textContent = `${g.nodes.length} \u8282\u70B9 \xB7 rev=${lastRevision}`;
    } catch (e) {
      showError(e);
    }
  }
  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (!msg) return;
    if (msg.type === "response") {
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.ok) p.resolve(msg.result);
      else p.reject(msg.error || { message: "unknown error" });
    }
    if (msg.type === "event" && msg.event === "revision") {
      lastRevision = msg.payload.revision;
      statusEl.textContent = `rev=${lastRevision} \xB7 refreshing\u2026`;
      call("parse", {}).then((g) => applyGraph(g)).catch((e) => showError(e));
    }
    if (msg.type === "event" && msg.event === "select") {
      selectedId = msg.payload?.id ?? null;
      highlightTree(treeEl, selectedId);
    }
  });
  void load();
})();
