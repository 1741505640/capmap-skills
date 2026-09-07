import { useMemo } from 'react';
import type { CapMapGraph, CapMapQueryRow } from '../../parser/types.ts';
import { statusStroke } from '../graph/colors.ts';
import { typeLabel } from '../labels.ts';

export interface NodeDetailProps {
  graph: CapMapGraph;
  selected: string | null;
  queryHint: CapMapQueryRow | null;
  onClose?: () => void;
  onSelectNeighbor?: (id: string) => void;
  onOpenSource?: (relPath: string) => void;
}

export function NodeDetail({
  graph,
  selected,
  queryHint,
  onClose,
  onSelectNeighbor,
  onOpenSource,
}: NodeDetailProps) {
  const node = useMemo(
    () => (selected ? (graph.nodes.find((n) => n.id === selected) ?? null) : null),
    [graph.nodes, selected],
  );

  const neighbors = useMemo(() => {
    if (!node) return [];
    const ids = new Set<string>();
    for (const e of graph.edges) {
      if (e.kind !== 'wikilink') continue;
      if (e.source === node.id) ids.add(e.target);
      if (e.target === node.id) ids.add(e.source);
    }
    return [...ids].map((id) => graph.nodes.find((n) => n.id === id)).filter(Boolean);
  }, [graph, node]);

  if (!node) return null;

  const pill = (accent?: string | null): import('react').CSSProperties => ({
    display: 'inline-block',
    fontSize: 10,
    padding: '1px 6px',
    borderRadius: 999,
    border: `1px solid ${accent ?? 'var(--dsw-alias-border-l2, #374151)'}`,
    color: accent ?? 'var(--dsw-alias-label-secondary, #9ca3af)',
    marginRight: 4,
  });

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        borderLeft: '1px solid var(--dsw-alias-border-l3, #1f2937)',
        background: 'var(--dsw-alias-bg-layer-1, #0b1220)',
        padding: 12,
        color: 'var(--dsw-alias-label-primary, #e5e7eb)',
        fontSize: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, flex: 1 }}>{node.title}</div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: 'transparent',
              color: 'var(--dsw-alias-label-secondary, #9ca3af)',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            关闭
          </button>
        )}
      </div>
      <div style={{ marginBottom: 8 }}>
        <span style={pill()}>{typeLabel(node.type)}</span>
        {node.status && <span style={pill(statusStroke(node.status))}>{node.status}</span>}
        {node.theme && <span style={pill()}>{node.theme}</span>}
      </div>
      <div
        style={{
          color: 'var(--dsw-alias-label-tertiary, #6b7280)',
          wordBreak: 'break-all',
          marginBottom: 10,
          fontSize: 11,
        }}
      >
        {node.path}
      </div>
      {node.summary && <div style={{ marginBottom: 10, lineHeight: 1.4 }}>{node.summary}</div>}

      {queryHint?.kind === 'section1_fight' && queryHint.schemeId === node.id && (
        <div
          style={{
            marginBottom: 10,
            padding: 8,
            borderRadius: 6,
            background: '#3f1d1d',
            border: '1px solid #7f1d1d',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>§1 字面 vs Tag</div>
          <div>
            §1：{queryHint.section1Status ?? '—'} · Tag：{queryHint.schemeStatus ?? '—'}
          </div>
          {queryHint.detail && <div style={{ color: '#fca5a5', marginTop: 4 }}>{queryHint.detail}</div>}
        </div>
      )}

      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--dsw-alias-label-secondary, #9ca3af)',
          marginBottom: 4,
        }}
      >
        邻接
      </div>
      {neighbors.length === 0 ? (
        <div style={{ color: 'var(--dsw-alias-label-tertiary, #6b7280)' }}>无</div>
      ) : (
        neighbors.map((n) => (
          <div
            key={n!.id}
            role={onSelectNeighbor ? 'button' : undefined}
            tabIndex={onSelectNeighbor ? 0 : undefined}
            onClick={() => onSelectNeighbor?.(n!.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelectNeighbor?.(n!.id);
            }}
            style={{
              padding: '4px 0',
              cursor: onSelectNeighbor ? 'pointer' : 'default',
              color: 'var(--dsw-alias-link, #679efe)',
            }}
          >
            {n!.title} · {n!.type}
          </div>
        ))
      )}

      {onOpenSource && (
        <button
          type="button"
          onClick={() => onOpenSource(node.path)}
          style={{
            marginTop: 12,
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid var(--dsw-alias-border-l2, #374151)',
            background: 'var(--dsw-alias-button-elevated-fill, #1f2937)',
            color: 'var(--dsw-alias-label-primary, #e5e7eb)',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          打开源文件
        </button>
      )}
    </div>
  );
}
