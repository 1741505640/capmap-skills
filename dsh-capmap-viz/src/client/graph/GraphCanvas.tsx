import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
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
import type { CapMapGraph } from '../../parser/types.ts';
import { statusDashed, statusStroke, typeFill } from './colors.ts';
import { typeLabel } from '../labels.ts';
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
  path: string;
  theme: string | null;
  archive: boolean;
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
  /** 主题分簇 + 归档下沉。默认开。 */
  clusterThemes?: boolean;
}

export interface GraphCanvasHandle {
  fit: () => void;
  exportPng: (filename?: string) => void;
  focusNode: (id: string) => void;
}

function isArchiveNode(type: string, path: string): boolean {
  return type === 'archive' || path.startsWith('_archive/') || path.includes('/_archive/');
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(function GraphCanvas(
  { graph, selected, onSelect, clusterThemes = true },
  ref,
) {
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

  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [charge, setCharge] = useState(220);
  const [linkDist, setLinkDist] = useState(80);
  const [centerForce, setCenterForce] = useState(30);
  const [labelFade, setLabelFade] = useState(55);
  const [animOn, setAnimOn] = useState(true);
  const [zoomK, setZoomK] = useState(1);

  const forceParamsRef = useRef({ charge, linkDist, centerForce, labelFade, animOn, clusterThemes });
  forceParamsRef.current = { charge, linkDist, centerForce, labelFade, animOn, clusterThemes };

  selectedRef.current = selected;

  const positionsOf = (): Record<string, Point> => {
    const out: Record<string, Point> = {};
    for (const n of nodesRef.current) {
      out[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
    }
    return out;
  };

  const labelThreshold = () => {
    const fade = forceParamsRef.current.labelFade;
    return 0.15 + ((100 - fade) / 100) * 0.9;
  };

  const applyForces = useCallback((sim: Simulation<SimNode, SimLink>, W: number, H: number) => {
    const p = forceParamsRef.current;
    const themes = [...new Set(nodesRef.current.map((n) => n.theme).filter(Boolean) as string[])];
    const existing = sim.force('link') as ReturnType<typeof forceLink<SimNode, SimLink>> | undefined;
    const links = existing?.links() ?? [];
    sim
      .force(
        'link',
        forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(p.linkDist).strength(0.55),
      )
      .force('charge', forceManyBody().strength(-p.charge))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide<SimNode>().radius((d) => (d.archive ? 16 : 22)))
      .force('cx', forceX(W / 2).strength((p.centerForce / 100) * 0.15))
      .force('cy', forceY(H / 2).strength((p.centerForce / 100) * 0.15));

    if (p.clusterThemes && themes.length > 0) {
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
      sim.force('x', null);
      sim.force(
        'y',
        forceY<SimNode>((d) => (d.archive ? H * 0.72 : H * 0.5)).strength(0.04),
      );
    }
    sim.alphaTarget(p.animOn ? 0.02 : 0).restart();
  }, []);

  const draw = useCallback(() => {
    try {
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
      const thr = labelThreshold();

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
        const baseR = n.archive ? NODE_RADIUS * 0.75 : NODE_RADIUS;
        const r = (isSel ? NODE_RADIUS_SELECTED : baseR) * Math.min(cam.k, 1.4);
        let alpha = active ? 1 : 0.18;
        if (n.archive && active) alpha *= 0.55;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = typeFill(n.type);
        ctx.fill();
        ctx.lineWidth = isSel ? 3.5 : 2.5;
        ctx.strokeStyle = statusStroke(n.status);
        ctx.setLineDash(statusDashed(n.status) || n.archive ? ([4, 3] as number[]) : []);
        ctx.stroke();
        ctx.setLineDash([]);
        if (cam.k >= thr) {
          const labelAlpha = Math.min(1, Math.max(0, (cam.k - thr) / 0.35));
          ctx.globalAlpha = alpha * labelAlpha;
          ctx.fillStyle = n.archive ? '#9ca3af' : '#e5e7eb';
          ctx.font = '11px ui-sans-serif, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          const label = n.title.length > 16 ? `${n.title.slice(0, 16)}…` : n.title;
          ctx.fillText(label, s.x, s.y - r - 4);
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    } catch {
      /* 单帧绘制失败不拖垮 */
    }
  }, [graph]);

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    fittedRef.current = true;
    const pts = nodesRef.current.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 }));
    camRef.current = fitTransform(pts, wrap.clientWidth, wrap.clientHeight);
    setZoomK(camRef.current.k);
    draw();
  }, [draw]);

  const exportPng = useCallback(
    (filename = 'capmap-graph.png') => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      draw();
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    },
    [draw],
  );

  const focusNode = useCallback(
    (id: string) => {
      const wrap = wrapRef.current;
      const n = nodesRef.current.find((node) => node.id === id);
      if (!wrap || !n || n.x == null || n.y == null) return;
      const k = camRef.current.k;
      camRef.current = {
        x: wrap.clientWidth / 2 - n.x * k,
        y: wrap.clientHeight / 2 - n.y * k,
        k,
      };
      draw();
    },
    [draw],
  );

  useImperativeHandle(ref, () => ({ fit, exportPng, focusNode }), [fit, exportPng, focusNode]);

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
      path: n.path,
      theme: n.theme,
      archive: isArchiveNode(n.type, n.path),
    }));
    const byId = new Set(nodes.map((n) => n.id));
    const links: SimLink[] = graph.edges
      .filter((e) => VISIBLE_KINDS.has(e.kind) && byId.has(e.source) && byId.has(e.target))
      .map((e) => ({ source: e.source, target: e.target, kind: e.kind }));

    nodesRef.current = nodes;

    const wrap = wrapRef.current;
    const W = wrap?.clientWidth || 800;
    const H = wrap?.clientHeight || 560;
    const p = forceParamsRef.current;
    const themes = [...new Set(nodes.map((n) => n.theme).filter(Boolean) as string[])];

    const sim = forceSimulation<SimNode>(nodes)
      .force('link', forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(p.linkDist).strength(0.55))
      .force('charge', forceManyBody().strength(-p.charge))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide<SimNode>().radius((d) => (d.archive ? 16 : 22)))
      .force('cx', forceX(W / 2).strength((p.centerForce / 100) * 0.15))
      .force('cy', forceY(H / 2).strength((p.centerForce / 100) * 0.15));

    if (p.clusterThemes && themes.length > 0) {
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

    sim.alphaTarget(p.animOn ? 0.02 : 0);

    sim.on('tick', () => {
      if (!fittedRef.current && sim.alpha() < 0.08) {
        fittedRef.current = true;
        const pts = nodes.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 }));
        const el = wrapRef.current;
        if (el) {
          camRef.current = fitTransform(pts, el.clientWidth, el.clientHeight);
          setZoomK(camRef.current.k);
        }
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
    const sim = simRef.current;
    const wrap = wrapRef.current;
    if (!sim || !wrap) return;
    applyForces(sim, wrap.clientWidth || 800, wrap.clientHeight || 560);
  }, [charge, linkDist, centerForce, animOn, clusterThemes, applyForces, size.w, size.h]);

  useEffect(() => {
    draw();
  }, [selected, draw, size, labelFade]);

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
      const n = ptr.nodeId ? nodesRef.current.find((node) => node.id === ptr.nodeId) : null;
      if (n) {
        n.fx = null;
        n.fy = null;
      }
      simRef.current?.alphaTarget(forceParamsRef.current.animOn ? 0.02 : 0);
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
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const factor = ev.deltaY > 0 ? 0.92 : 1.08;
    camRef.current = zoomAt(camRef.current, x, y, camRef.current.k * factor);
    setZoomK(camRef.current.k);
    draw();
  };

  const bumpZoom = (factor: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const x = wrap.clientWidth / 2;
    const y = wrap.clientHeight / 2;
    camRef.current = zoomAt(camRef.current, x, y, camRef.current.k * factor);
    setZoomK(camRef.current.k);
    draw();
  };

  const hoverNode = hover ? graph.nodes.find((n) => n.id === hover.id) : null;
  const hoverDeg = hover
    ? degree(hover.id, graph.edges.filter((e) => VISIBLE_KINDS.has(e.kind)), VISIBLE_KINDS)
    : 0;

  const hudBtn: import('react').CSSProperties = {
    flex: 1,
    height: 26,
    borderRadius: 6,
    border: '1px solid var(--dsw-alias-border-l2, #374151)',
    background: 'var(--dsw-alias-button-elevated-fill, #1f2937)',
    color: 'var(--dsw-alias-label-primary, #e5e7eb)',
    fontSize: 12,
    cursor: 'pointer',
  };

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
      <div
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10,
          zIndex: 4,
          width: 188,
          padding: 8,
          borderRadius: 8,
          border: '1px solid var(--dsw-alias-border-l2, #374151)',
          background: 'var(--dsw-alias-bg-layer-1, #111827)',
        }}
      >
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          <button type="button" style={hudBtn} onClick={() => bumpZoom(1 / 1.12)} title="缩小">
            −
          </button>
          <button type="button" style={hudBtn} onClick={fit} title="适应">
            Fit
          </button>
          <button type="button" style={hudBtn} onClick={() => bumpZoom(1.12)} title="放大">
            +
          </button>
        </div>
        <HudSlider label="斥力" value={charge} min={80} max={400} onChange={setCharge} />
        <HudSlider label="距离" value={linkDist} min={40} max={180} onChange={setLinkDist} />
        <HudSlider label="中心" value={centerForce} min={0} max={100} onChange={setCenterForce} />
        <HudSlider label="标签" value={labelFade} min={0} max={100} onChange={setLabelFade} />
        <button
          type="button"
          onClick={() => setAnimOn((v) => !v)}
          style={{
            ...hudBtn,
            width: '100%',
            marginTop: 8,
            flex: 'none',
            background: animOn
              ? 'var(--dsw-alias-interactive-bg-active, rgba(255,255,255,0.14))'
              : 'var(--dsw-alias-button-elevated-fill, #1f2937)',
          }}
        >
          动画：{animOn ? '开' : '关'}
        </button>
        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #6b7280)' }}>
          缩放 {zoomK.toFixed(2)} · 滚轮 / 拖动画布
        </div>
      </div>
      {hoverNode && hover && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(hover.x + 12, Math.max(8, (wrapRef.current?.clientWidth ?? 400) - 240)),
            top: Math.min(hover.y + 12, Math.max(8, (wrapRef.current?.clientHeight ?? 300) - 120)),
            width: 220,
            padding: '8px 10px',
            borderRadius: 8,
            background: 'var(--dsw-alias-bg-layer-1, #111827)',
            border: '1px solid var(--dsw-alias-border-l2, #374151)',
            color: 'var(--dsw-alias-label-primary, #e5e7eb)',
            fontSize: 12,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{hoverNode.title}</div>
          <div style={{ color: 'var(--dsw-alias-label-secondary, #9ca3af)' }}>
            类型 {typeLabel(hoverNode.type)} · 状态 {hoverNode.status ?? '—'}
            {isArchiveNode(hoverNode.type, hoverNode.path) ? ' · 归档层' : ''}
          </div>
          <div style={{ color: 'var(--dsw-alias-label-secondary, #9ca3af)' }}>度数 {hoverDeg}</div>
          {hoverNode.summary && (
            <div style={{ marginTop: 6, color: 'var(--dsw-alias-label-secondary, #cbd5e1)' }}>
              {hoverNode.summary.length > 80 ? `${hoverNode.summary.slice(0, 80)}…` : hoverNode.summary}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

function HudSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
        fontSize: 10,
        color: 'var(--dsw-alias-label-secondary, #9ca3af)',
      }}
    >
      <span style={{ width: 28, flex: 'none' }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, minWidth: 0, accentColor: 'var(--dsw-alias-button-info-fill, #679efe)' }}
      />
      <b
        style={{
          width: 28,
          flex: 'none',
          textAlign: 'right',
          fontWeight: 500,
          color: 'var(--dsw-alias-label-tertiary, #6b7280)',
        }}
      >
        {value}
      </b>
    </label>
  );
}

export default GraphCanvas;
