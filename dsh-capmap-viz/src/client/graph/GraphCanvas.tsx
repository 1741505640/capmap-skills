import { useCallback, useEffect, useRef, useState } from 'react';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { CapMapGraph } from '../../parser/types.ts';
import { statusDashed, statusStroke, typeFill } from './colors.ts';
import {
  NODE_RADIUS,
  NODE_RADIUS_SELECTED,
  type Camera,
  type Point,
  degree,
  fitTransform,
  hitNode,
  oneHop,
  screenToWorld,
  worldToScreen,
  zoomAt,
} from './model.ts';

const HOVER_MS = 200;
const DRAG_THRESHOLD = 5;
const VISIBLE_KINDS = new Set(['wikilink']);

interface SimNode extends SimulationNodeDatum {
  id: string;
  title: string;
  type: string;
  status: string | null;
  summary: string | null;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
  kind: 'wikilink' | 'semantic';
}

export interface GraphCanvasProps {
  graph: CapMapGraph;
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function GraphCanvas({ graph, selected, onSelect }: GraphCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const camRef = useRef<Camera>({ x: 0, y: 0, k: 1 });
  const selectedRef = useRef<string | null>(selected);
  const hoverIdRef = useRef<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fittedRef = useRef(false);
  const pointerRef = useRef<{
    mode: 'none' | 'pan' | 'drag' | 'pending';
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    nodeId: string | null;
  }>({ mode: 'none', startX: 0, startY: 0, lastX: 0, lastY: 0, nodeId: null });

  const [hover, setHover] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  selectedRef.current = selected;

  const positionsOf = (): Record<string, Point> => {
    const out: Record<string, Point> = {};
    for (const n of nodesRef.current) {
      out[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
    }
    return out;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
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

    const cam = camRef.current;
    const sel = selectedRef.current;
    const edges = graph.edges.filter((e) => VISIBLE_KINDS.has(e.kind));
    const hop = sel ? oneHop(sel, edges, VISIBLE_KINDS) : null;
    const pos = positionsOf();

    ctx.save();
    ctx.lineCap = 'round';
    for (const e of graph.edges) {
      if (!VISIBLE_KINDS.has(e.kind)) continue;
      const a = pos[e.source];
      const b = pos[e.target];
      if (!a || !b) continue;
      const sa = worldToScreen(cam, a.x, a.y);
      const sb = worldToScreen(cam, b.x, b.y);
      const active = !hop || (hop.has(e.source) && hop.has(e.target));
      ctx.strokeStyle = active ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = active ? 1.2 : 0.7;
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.stroke();
    }

    for (const n of nodesRef.current) {
      const p = pos[n.id];
      if (!p) continue;
      const s = worldToScreen(cam, p.x, p.y);
      const isSel = n.id === sel;
      const active = !hop || hop.has(n.id);
      const r = (isSel ? NODE_RADIUS_SELECTED : NODE_RADIUS) * Math.min(cam.k, 1.4);
      ctx.globalAlpha = active ? 1 : 0.18;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fillStyle = typeFill(n.type);
      ctx.fill();
      ctx.lineWidth = isSel ? 3 : 2;
      ctx.strokeStyle = statusStroke(n.status);
      ctx.setLineDash(statusDashed(n.status) ? [4, 3] : []);
      ctx.stroke();
      ctx.setLineDash([]);
      if (cam.k >= 0.45) {
        ctx.fillStyle = '#e5e7eb';
        ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const label = n.title.length > 16 ? `${n.title.slice(0, 16)}…` : n.title;
        ctx.fillText(label, s.x, s.y - r - 4);
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }, [graph]);

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    fittedRef.current = true;
    const pts = nodesRef.current.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 }));
    camRef.current = fitTransform(pts, wrap.clientWidth, wrap.clientHeight);
    draw();
  }, [draw]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: wrap.clientWidth, h: wrap.clientHeight });
      draw();
    });
    ro.observe(wrap);
    setSize({ w: wrap.clientWidth, h: wrap.clientHeight });
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => {
    fittedRef.current = false;
    const nodes: SimNode[] = graph.nodes.map((n) => ({
      id: n.id,
      title: n.title,
      type: n.type,
      status: n.status,
      summary: n.summary,
    }));
    const byId = new Set(nodes.map((n) => n.id));
    const links: SimLink[] = graph.edges
      .filter((e) => VISIBLE_KINDS.has(e.kind) && byId.has(e.source) && byId.has(e.target))
      .map((e) => ({ source: e.source, target: e.target, kind: e.kind }));

    nodesRef.current = nodes;

    const wrap = wrapRef.current;
    const W = wrap?.clientWidth || 800;
    const H = wrap?.clientHeight || 560;
    const sim = forceSimulation<SimNode>(nodes)
      .force('link', forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(80).strength(0.55))
      .force('charge', forceManyBody().strength(-220))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide<SimNode>().radius(22))
      .on('tick', () => {
        if (!fittedRef.current && sim.alpha() < 0.08) {
          fittedRef.current = true;
          const pts = nodes.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 }));
          const el = wrapRef.current;
          if (el) camRef.current = fitTransform(pts, el.clientWidth, el.clientHeight);
        }
        draw();
      });
    simRef.current = sim;
    return () => {
      sim.stop();
      simRef.current = null;
    };
  }, [graph, draw]);

  useEffect(() => {
    draw();
  }, [selected, draw, size]);

  const localXY = (ev: React.PointerEvent): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  };

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const scheduleHover = (id: string | null, sx: number, sy: number) => {
    if (id === hoverIdRef.current) {
      if (id) setHover({ id, x: sx, y: sy });
      return;
    }
    hoverIdRef.current = id;
    clearHoverTimer();
    setHover(null);
    if (!id) return;
    hoverTimerRef.current = setTimeout(() => {
      setHover({ id, x: sx, y: sy });
    }, HOVER_MS);
  };

  const onPointerDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    ev.currentTarget.setPointerCapture(ev.pointerId);
    const { x, y } = localXY(ev);
    const world = screenToWorld(camRef.current, x, y);
    const id = hitNode(nodesRef.current, positionsOf(), world.x, world.y, NODE_RADIUS_SELECTED + 4);
    pointerRef.current = {
      mode: 'pending',
      startX: x,
      startY: y,
      lastX: x,
      lastY: y,
      nodeId: id,
    };
  };

  const onPointerMove = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = localXY(ev);
    const ptr = pointerRef.current;
    if (ptr.mode === 'none') {
      const world = screenToWorld(camRef.current, x, y);
      const id = hitNode(nodesRef.current, positionsOf(), world.x, world.y, NODE_RADIUS + 3);
      scheduleHover(id, x, y);
      return;
    }
    const dx = x - ptr.startX;
    const dy = y - ptr.startY;
    if (ptr.mode === 'pending' && dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) {
      ptr.mode = ptr.nodeId ? 'drag' : 'pan';
      if (ptr.mode === 'drag' && ptr.nodeId) {
        const n = nodesRef.current.find((node) => node.id === ptr.nodeId);
        if (n) {
          const w = screenToWorld(camRef.current, x, y);
          n.fx = w.x;
          n.fy = w.y;
          simRef.current?.alphaTarget(0.25).restart();
        }
      }
    }
    if (ptr.mode === 'pan') {
      fittedRef.current = true;
      camRef.current = {
        ...camRef.current,
        x: camRef.current.x + (x - ptr.lastX),
        y: camRef.current.y + (y - ptr.lastY),
      };
      draw();
    } else if (ptr.mode === 'drag' && ptr.nodeId) {
      const n = nodesRef.current.find((node) => node.id === ptr.nodeId);
      if (n) {
        const w = screenToWorld(camRef.current, x, y);
        n.fx = w.x;
        n.fy = w.y;
        n.x = w.x;
        n.y = w.y;
        draw();
      }
    }
    ptr.lastX = x;
    ptr.lastY = y;
  };

  const onPointerUp = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const ptr = pointerRef.current;
    if (ptr.mode === 'pending' && ptr.nodeId) {
      onSelect(ptr.nodeId);
    } else if (ptr.mode === 'pending' && !ptr.nodeId) {
      onSelect(null);
    }
    if (ptr.mode === 'drag') {
      simRef.current?.alphaTarget(0);
    }
    pointerRef.current = { mode: 'none', startX: 0, startY: 0, lastX: 0, lastY: 0, nodeId: null };
    try {
      ev.currentTarget.releasePointerCapture(ev.pointerId);
    } catch {
      // ignore
    }
  };

  const onWheel = (ev: React.WheelEvent<HTMLCanvasElement>) => {
    ev.preventDefault();
    const { x, y } = (() => {
      const rect = ev.currentTarget.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    })();
    fittedRef.current = true;
    const factor = ev.deltaY > 0 ? 0.92 : 1.08;
    camRef.current = zoomAt(camRef.current, x, y, camRef.current.k * factor);
    draw();
  };

  const hoverNode = hover ? graph.nodes.find((n) => n.id === hover.id) : null;
  const hoverDeg = hover
    ? degree(hover.id, graph.edges.filter((e) => VISIBLE_KINDS.has(e.kind)), VISIBLE_KINDS)
    : 0;

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          clearHoverTimer();
          hoverIdRef.current = null;
          setHover(null);
        }}
        onWheel={onWheel}
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'grab', touchAction: 'none' }}
      />
      <button
        type="button"
        onClick={fit}
        style={{
          position: 'absolute',
          right: 12,
          top: 12,
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid #374151',
          background: '#111827',
          color: '#e5e7eb',
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        Fit
      </button>
      {hoverNode && hover && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(hover.x + 12, Math.max(8, (wrapRef.current?.clientWidth ?? 400) - 240)),
            top: Math.min(hover.y + 12, Math.max(8, (wrapRef.current?.clientHeight ?? 300) - 120)),
            width: 220,
            padding: '8px 10px',
            borderRadius: 8,
            background: '#111827',
            border: '1px solid #374151',
            color: '#e5e7eb',
            fontSize: 12,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{hoverNode.title}</div>
          <div style={{ color: '#9ca3af' }}>类型 {hoverNode.type} · 状态 {hoverNode.status ?? '—'}</div>
          <div style={{ color: '#9ca3af' }}>度数 {hoverDeg}</div>
          {hoverNode.summary && (
            <div style={{ marginTop: 6, color: '#cbd5e1' }}>
              {hoverNode.summary.length > 80 ? `${hoverNode.summary.slice(0, 80)}…` : hoverNode.summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GraphCanvas;
