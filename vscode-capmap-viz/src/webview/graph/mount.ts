/**
 * Webview 力导向图谱（vanilla；配色/几何复用 src/graph）。
 */
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import { statusDashed, statusStroke, typeFill } from '../../graph/colors';
import {
  NODE_RADIUS,
  NODE_RADIUS_SELECTED,
  type Camera,
  type Point,
  fitTransform,
  hitNode,
  oneHop,
  screenToWorld,
  worldToScreen,
  zoomAt,
} from '../../graph/model';

export interface GraphNodeIn {
  id: string;
  title: string;
  type: string;
  status: string | null;
  path: string;
  theme: string | null;
}

export interface GraphEdgeIn {
  source: string;
  target: string;
  kind: string;
}

export interface GraphIn {
  nodes: GraphNodeIn[];
  edges: GraphEdgeIn[];
  docsRoot?: string;
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  title: string;
  type: string;
  status: string | null;
  path: string;
  theme: string | null;
  archive: boolean;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  kind: string;
}

const VISIBLE_KINDS = new Set(['wikilink']);
const DRAG_THRESHOLD = 5;

function isArchive(type: string, path: string): boolean {
  return type === 'archive' || path.startsWith('_archive/') || path.includes('/_archive/');
}

export interface CapMapGraphView {
  setGraph(graph: GraphIn, opts?: { keepSelected?: boolean }): void;
  selectNode(id: string | null, focus?: boolean): void;
  fit(): void;
  dispose(): void;
}

export function mountGraph(
  root: HTMLElement,
  opts?: { onSelect?: (id: string | null) => void },
): CapMapGraphView {
  root.innerHTML = '';
  root.classList.add('graph-root');

  const hud = document.createElement('div');
  hud.className = 'graph-hud';
  hud.innerHTML =
    '<button type="button" data-act="zoom-in" title="放大">+</button>' +
    '<button type="button" data-act="zoom-out" title="缩小">−</button>' +
    '<button type="button" data-act="fit" title="Fit">Fit</button>';
  root.appendChild(hud);

  const wrap = document.createElement('div');
  wrap.className = 'graph-wrap';
  const canvas = document.createElement('canvas');
  wrap.appendChild(canvas);
  root.appendChild(wrap);

  const tip = document.createElement('div');
  tip.className = 'graph-tip';
  tip.hidden = true;
  root.appendChild(tip);

  let graph: GraphIn = { nodes: [], edges: [] };
  let nodes: SimNode[] = [];
  let sim: Simulation<SimNode, SimLink> | null = null;
  let cam: Camera = { x: 0, y: 0, k: 1 };
  let selected: string | null = null;
  let fitted = false;
  let disposed = false;
  let pulseT0 = performance.now();

  const pointer = {
    mode: 'none' as 'none' | 'pan' | 'drag' | 'pending',
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    nodeId: null as string | null,
  };

  const positionsOf = (): Record<string, Point> => {
    const out: Record<string, Point> = {};
    for (const n of nodes) out[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
    return out;
  };

  const draw = () => {
    if (disposed) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w <= 0 || h <= 0) return;
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const edges = graph.edges.filter((e) => VISIBLE_KINDS.has(e.kind));
    const hop = selected ? oneHop(selected, edges, VISIBLE_KINDS) : null;
    const pos = positionsOf();

    for (const e of edges) {
      const a = pos[e.source];
      const b = pos[e.target];
      if (!a || !b) continue;
      const sa = worldToScreen(cam, a.x, a.y);
      const sb = worldToScreen(cam, b.x, b.y);
      const active = !hop || (hop.has(e.source) && hop.has(e.target));
      ctx.strokeStyle = active ? 'rgba(148,163,184,0.55)' : 'rgba(148,163,184,0.12)';
      ctx.lineWidth = active ? 1.4 : 0.8;
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.stroke();
    }

    for (const n of nodes) {
      const p = pos[n.id];
      if (!p) continue;
      const s = worldToScreen(cam, p.x, p.y);
      const isSel = n.id === selected;
      const active = !hop || hop.has(n.id);
      const baseR = n.archive ? NODE_RADIUS * 0.75 : NODE_RADIUS;
      let r = (isSel ? NODE_RADIUS_SELECTED : baseR) * Math.min(cam.k, 1.4);
      if (isSel) {
        const pulse = 1 + 0.08 * Math.sin(((performance.now() - pulseT0) / 1000) * Math.PI * 2);
        r *= pulse;
      }
      let alpha = active ? 1 : 0.18;
      if (n.archive && active) alpha *= 0.55;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fillStyle = typeFill(n.type);
      ctx.fill();
      ctx.lineWidth = isSel ? 3.5 : 2.5;
      ctx.strokeStyle = statusStroke(n.status);
      const dash = statusDashed(n.status) || (n.archive ? [4, 3] : null);
      ctx.setLineDash(dash ?? []);
      ctx.stroke();
      ctx.setLineDash([]);
      if (isSel) {
        ctx.globalAlpha = 0.25 * alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = statusStroke(n.status);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      if (cam.k >= 0.55) {
        ctx.fillStyle = n.archive ? '#9ca3af' : 'var(--vscode-foreground, #e5e7eb)';
        // canvas can't use CSS vars reliably — use light/dark-ish default
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const label = n.title.length > 16 ? `${n.title.slice(0, 16)}…` : n.title;
        ctx.fillText(label, s.x, s.y - r - 4);
      }
      ctx.globalAlpha = 1;
    }
  };

  const fit = () => {
    fitted = true;
    const pts = nodes.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 }));
    cam = fitTransform(pts, wrap.clientWidth || 800, wrap.clientHeight || 560);
    draw();
  };

  const restartSim = () => {
    sim?.stop();
    nodes = graph.nodes.map((n) => ({
      id: n.id,
      title: n.title,
      type: n.type,
      status: n.status,
      path: n.path,
      theme: n.theme,
      archive: isArchive(n.type, n.path),
    }));
    const byId = new Set(nodes.map((n) => n.id));
    const links: SimLink[] = graph.edges
      .filter((e) => VISIBLE_KINDS.has(e.kind) && byId.has(e.source) && byId.has(e.target))
      .map((e) => ({ source: e.source, target: e.target, kind: e.kind }));

    const W = wrap.clientWidth || 800;
    const H = wrap.clientHeight || 560;
    const themes = [...new Set(nodes.map((n) => n.theme).filter(Boolean) as string[])];

    fitted = false;
    sim = forceSimulation<SimNode>(nodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(80).strength(0.55),
      )
      .force('charge', forceManyBody().strength(-220))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide<SimNode>().radius((d) => (d.archive ? 16 : 22)))
      .force('cx', forceX(W / 2).strength(0.045))
      .force('cy', forceY(H / 2).strength(0.045));

    if (themes.length > 0) {
      sim
        .force(
          'x',
          forceX<SimNode>((d) => {
            const i = Math.max(0, themes.indexOf(d.theme ?? ''));
            return (W * (i + 1)) / (themes.length + 1);
          }).strength(0.12),
        )
        .force(
          'y',
          forceY<SimNode>((d) => (d.archive ? H * 0.78 : H * 0.38)).strength(0.1),
        );
    } else {
      sim.force(
        'y',
        forceY<SimNode>((d) => (d.archive ? H * 0.72 : H * 0.5)).strength(0.04),
      );
    }

    sim.alphaTarget(0.02);
    sim.on('tick', () => {
      if (!fitted && (sim?.alpha() ?? 1) < 0.08) fit();
      else draw();
    });
  };

  // 选中脉冲：力导向停下后仍持续轻动画
  const pulseTimer = window.setInterval(() => {
    if (disposed || !selected) return;
    draw();
  }, 40);

  const localXY = (ev: PointerEvent): Point => {
    const rect = canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  };

  const showTip = (id: string | null, sx: number, sy: number) => {
    if (!id) {
      tip.hidden = true;
      return;
    }
    const n = nodes.find((x) => x.id === id);
    if (!n) {
      tip.hidden = true;
      return;
    }
    tip.hidden = false;
    tip.style.left = `${sx + 12}px`;
    tip.style.top = `${sy + 12}px`;
    tip.innerHTML = `<div><strong>${escapeHtml(n.title)}</strong></div><div class="muted">${escapeHtml(n.type)}${n.status ? ' · ' + escapeHtml(n.status) : ''}</div>`;
  };

  canvas.addEventListener('pointerdown', (ev) => {
    canvas.setPointerCapture(ev.pointerId);
    const { x, y } = localXY(ev);
    const world = screenToWorld(cam, x, y);
    const hitR = (NODE_RADIUS_SELECTED + 6) / Math.max(cam.k, 0.2);
    const id = hitNode(nodes, positionsOf(), world.x, world.y, hitR);
    pointer.mode = 'pending';
    pointer.startX = x;
    pointer.startY = y;
    pointer.lastX = x;
    pointer.lastY = y;
    pointer.nodeId = id;
  });

  canvas.addEventListener('pointermove', (ev) => {
    const { x, y } = localXY(ev);
    if (pointer.mode === 'none') {
      const world = screenToWorld(cam, x, y);
      const hitR = (NODE_RADIUS + 4) / Math.max(cam.k, 0.2);
      const id = hitNode(nodes, positionsOf(), world.x, world.y, hitR);
      showTip(id, x, y);
      return;
    }
    const dx = x - pointer.startX;
    const dy = y - pointer.startY;
    if (pointer.mode === 'pending' && dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
      pointer.mode = pointer.nodeId ? 'drag' : 'pan';
      if (pointer.mode === 'drag' && pointer.nodeId) {
        const n = nodes.find((node) => node.id === pointer.nodeId);
        if (n) {
          const w = screenToWorld(cam, x, y);
          n.fx = w.x;
          n.fy = w.y;
          sim?.alphaTarget(0.25).restart();
        }
      }
    }
    if (pointer.mode === 'pan') {
      cam = { ...cam, x: cam.x + (x - pointer.lastX), y: cam.y + (y - pointer.lastY) };
      draw();
    } else if (pointer.mode === 'drag' && pointer.nodeId) {
      const n = nodes.find((node) => node.id === pointer.nodeId);
      if (n) {
        const w = screenToWorld(cam, x, y);
        n.fx = w.x;
        n.fy = w.y;
        draw();
      }
    }
    pointer.lastX = x;
    pointer.lastY = y;
  });

  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('lostpointercapture', () => {
    if (pointer.mode !== 'none') {
      if (pointer.mode === 'drag' && pointer.nodeId) {
        const n = nodes.find((node) => node.id === pointer.nodeId);
        if (n) {
          n.fx = null;
          n.fy = null;
          sim?.alphaTarget(0.02);
        }
      }
      pointer.mode = 'none';
      pointer.nodeId = null;
    }
  });

  function endPointer(ev: PointerEvent) {
    const { x, y } = localXY(ev);
    if (pointer.mode === 'pending') {
      const world = screenToWorld(cam, x, y);
      // 命中半径按缩放换算到世界坐标，避免缩放过小时点不中
      const hitR = (NODE_RADIUS_SELECTED + 6) / Math.max(cam.k, 0.2);
      const id = hitNode(nodes, positionsOf(), world.x, world.y, hitR);
      selected = id && selected === id ? null : id;
      opts?.onSelect?.(selected);
      draw();
    }
    if (pointer.mode === 'drag' && pointer.nodeId) {
      const n = nodes.find((node) => node.id === pointer.nodeId);
      if (n) {
        n.fx = null;
        n.fy = null;
        sim?.alphaTarget(0.02);
      }
    }
    pointer.mode = 'none';
    pointer.nodeId = null;
  }

  canvas.addEventListener(
    'wheel',
    (ev) => {
      ev.preventDefault();
      const { x, y } = localXY(ev);
      const factor = ev.deltaY > 0 ? 0.9 : 1.1;
      cam = zoomAt(cam, x, y, cam.k * factor);
      draw();
    },
    { passive: false },
  );

  hud.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement | null;
    const act = t?.getAttribute('data-act');
    if (act === 'fit') fit();
    if (act === 'zoom-in') {
      cam = zoomAt(cam, wrap.clientWidth / 2, wrap.clientHeight / 2, cam.k * 1.2);
      draw();
    }
    if (act === 'zoom-out') {
      cam = zoomAt(cam, wrap.clientWidth / 2, wrap.clientHeight / 2, cam.k * 0.8);
      draw();
    }
  });

  const focusNode = (id: string) => {
    const n = nodes.find((node) => node.id === id);
    if (!n || n.x == null || n.y == null) return;
    const k = cam.k;
    cam = {
      x: (wrap.clientWidth || 800) / 2 - n.x * k,
      y: (wrap.clientHeight || 560) / 2 - n.y * k,
      k,
    };
    draw();
  };

  const ro = new ResizeObserver(() => draw());
  ro.observe(wrap);

  return {
    setGraph(next, setOpts) {
      const prev = selected;
      graph = next;
      tip.hidden = true;
      if (setOpts?.keepSelected && prev && next.nodes.some((n) => n.id === prev)) {
        selected = prev;
      } else {
        selected = null;
      }
      restartSim();
    },
    selectNode(id, focus = true) {
      selected = id;
      pulseT0 = performance.now();
      tip.hidden = true;
      opts?.onSelect?.(id);
      draw();
      if (id && focus) {
        requestAnimationFrame(() => focusNode(id));
      }
    },
    fit,
    dispose() {
      disposed = true;
      window.clearInterval(pulseTimer);
      sim?.stop();
      ro.disconnect();
      root.innerHTML = '';
    },
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
