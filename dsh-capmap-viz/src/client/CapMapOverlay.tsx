// CapMap Viz 全屏浮层：项目根 → RPC parse → canvas 力导向图谱（切片 03）。
import { useCallback, useMemo, useState } from 'react';
import type { CapMapGraph } from '../parser/types.ts';
import { GraphCanvas } from './graph/GraphCanvas.tsx';

/** 与 Host 半 `handleRpc` 返回形状对齐。 */
export interface CapMapRpcResult {
  ok: boolean;
  value?: unknown;
  error?: { code?: string; message?: string };
}

export interface CapMapOverlayProps {
  call: (endpoint: string, payload: unknown) => Promise<CapMapRpcResult>;
}

export function CapMapOverlay({ call }: CapMapOverlayProps) {
  const [root, setRoot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graph, setGraph] = useState<CapMapGraph | null>(null);
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!root.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await call('parse', { root: root.trim() });
      if (res.ok) {
        setGraph(res.value as CapMapGraph);
        setSelected(null);
      } else {
        setError(res.error?.message ?? '解析失败');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [call, root]);

  const selectedNode = useMemo(
    () => (graph && selected ? graph.nodes.find((n) => n.id === selected) ?? null : null),
    [graph, selected],
  );

  const byType = useMemo(() => {
    const m: Record<string, number> = {};
    for (const n of graph?.nodes ?? []) m[n.type] = (m[n.type] ?? 0) + 1;
    return m;
  }, [graph]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none' }}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            pointerEvents: 'auto',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #374151',
            background: '#111827',
            color: '#e5e7eb',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          CapMap Viz
        </button>
      ) : (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10,12,18,0.86)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>CapMap Viz</span>
          <input
            value={root}
            onChange={(e) => setRoot(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="项目根目录（含 capmap.yaml 或 docs/）"
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #374151',
              background: '#111827',
              color: '#e5e7eb',
            }}
          />
          <button
            type="button"
            onClick={load}
            disabled={loading || !root.trim()}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {loading ? '加载中…' : '加载'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #374151',
              background: 'transparent',
              color: '#e5e7eb',
              cursor: 'pointer',
            }}
          >
            关闭
          </button>
        </div>

        {error && (
          <div style={{ padding: '8px 16px', color: '#fca5a5', fontSize: 13 }}>{error}</div>
        )}

        {selectedNode && (
          <div style={{ padding: '0 16px 8px', fontSize: 12, color: '#9ca3af' }}>
            聚焦：{selectedNode.title} · {selectedNode.type} · {selectedNode.status ?? '无状态 Tag'}
            {graph ? ` · 节点 ${graph.nodes.length} / 边 ${graph.edges.length}` : ''}
          </div>
        )}

        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {graph ? (
            <GraphCanvas graph={graph} selected={selected} onSelect={setSelected} />
          ) : (
            <div style={{ padding: 40, color: '#6b7280', fontSize: 14 }}>
              输入项目根并「加载」，渲染该项目的 capmap 文档体系图谱（类型填色 + 状态描边）。
            </div>
          )}
        </div>

        {graph && !selectedNode && (
          <div style={{ padding: '8px 16px', fontSize: 11, color: '#6b7280' }}>
            节点 {graph.nodes.length} · 边 {graph.edges.length} · 类型{' '}
            {Object.keys(byType)
              .map((t) => `${t}:${byType[t]}`)
              .join(' ')}
            {' '}· 语义边默认隐藏
          </div>
        )}
      </div>
      )}
    </div>
  );
}

export default CapMapOverlay;
