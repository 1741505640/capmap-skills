import { useMemo, useState, type Dispatch, type SetStateAction, type ReactNode } from 'react';
import type { CapMapGraph, CapMapQueryRow } from '../../parser/types.ts';
import { deriveQueries } from '../../parser/queries.ts';
import { statusStroke } from '../graph/colors.ts';
import { buildThemeTree, lifecycleCounts, listIndexNodes, type ThemeSchemeGroup, type ThemeTreeLeaf } from './themeTree.ts';

const sectionTitle: import('react').CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--dsw-alias-label-secondary, #9ca3af)',
  padding: '8px 10px 4px',
};

const rowBtn = (active: boolean): import('react').CSSProperties => ({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '6px 10px',
  border: 'none',
  borderRadius: 4,
  background: active ? 'var(--dsw-alias-interactive-bg-active, rgba(255,255,255,0.14))' : 'transparent',
  color: 'var(--dsw-alias-label-primary, #e5e7eb)',
  cursor: 'pointer',
  fontSize: 12,
});

const panelShell: import('react').CSSProperties = {
  height: '100%',
  overflow: 'auto',
  background: 'var(--dsw-alias-bg-layer-1, #0b1220)',
};

export interface LiveBoardProps {
  graph: CapMapGraph;
  themeFilter: string;
  selected: string | null;
  onSelectQuery: (row: CapMapQueryRow) => void;
}

/** 活看板：三条查询。 */
export function LiveBoard({ graph, themeFilter, selected, onSelectQuery }: LiveBoardProps) {
  const queries = useMemo(
    () =>
      deriveQueries(
        graph.nodes ?? [],
        graph.capabilities ?? [],
        graph.slices ?? [],
        themeFilter === '全部' ? null : themeFilter,
      ),
    [graph, themeFilter],
  );

  return (
    <div style={panelShell}>
      <div style={sectionTitle}>活看板</div>
      <QueryBlock
        title={`frontier 可开（${queries.frontier.length}）`}
        emptyLabel="可开 0"
        rows={queries.frontier}
        selected={selected}
        onSelectQuery={onSelectQuery}
      />
      <QueryBlock
        title={`验证门卡住（${queries.validationGate.length}）`}
        emptyLabel="无卡住项"
        rows={queries.validationGate}
        selected={selected}
        onSelectQuery={onSelectQuery}
      />
      <QueryBlock
        title={`§1 与 Tag 打架（${queries.section1Fight.length}）`}
        emptyLabel="无打架"
        rows={queries.section1Fight}
        selected={selected}
        onSelectQuery={onSelectQuery}
      />
    </div>
  );
}

export interface ThemeTreePanelProps {
  graph: CapMapGraph;
  themeFilter: string;
  statusFilter: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onStatusFilter: (status: string) => void;
}

/** 目录：索引（上）+ 主题（下）+ 底部生命周期。 */
export function ThemeTreePanel({
  graph,
  themeFilter,
  statusFilter,
  selected,
  onSelect,
  onStatusFilter,
}: ThemeTreePanelProps) {
  const indexes = useMemo(() => listIndexNodes(graph.nodes), [graph.nodes]);
  const buckets = useMemo(() => buildThemeTree(graph, themeFilter), [graph, themeFilter]);
  const life = useMemo(() => lifecycleCounts(graph.nodes, themeFilter), [graph.nodes, themeFilter]);
  const maxLife = Math.max(1, ...life.map((x) => x.count));
  const [indexOpen, setIndexOpen] = useState(true);
  const [openThemes, setOpenThemes] = useState<Record<string, boolean>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const themeOpen = (t: string) => openThemes[t] ?? true;
  const groupOpen = (key: string) => openGroups[key] ?? false;

  return (
    <div style={{ ...panelShell, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ ...sectionTitle, flex: 'none' }}>目录</div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', paddingBottom: 8 }}>
        {indexes.length > 0 && (
          <div>
            <button
              type="button"
              style={{
                ...rowBtn(false),
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onClick={() => setIndexOpen((v) => !v)}
            >
              <span style={{ opacity: 0.7 }}>{indexOpen ? '▾' : '▸'}</span>
              <span style={{ flex: 1 }}>索引</span>
              <span style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #6b7280)' }}>
                {indexes.length}
              </span>
            </button>
            {indexOpen && (
              <div style={{ paddingLeft: 8 }}>
                {indexes.map((n) => (
                  <LeafRow key={n.id} leaf={n} selected={selected} onSelect={(id) => onSelect(id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {(buckets.length > 0 || indexes.length > 0) && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--dsw-alias-label-tertiary, #6b7280)',
              padding: '10px 10px 2px',
              letterSpacing: '0.04em',
            }}
          >
            主题
          </div>
        )}

        {buckets.length === 0 && (
          <div style={{ padding: '4px 12px', fontSize: 12, color: 'var(--dsw-alias-label-tertiary, #6b7280)' }}>
            无主题
          </div>
        )}
        {buckets.map((b) => (
          <div key={b.theme}>
            <button
              type="button"
              style={{
                ...rowBtn(false),
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onClick={() => setOpenThemes((m) => ({ ...m, [b.theme]: !themeOpen(b.theme) }))}
            >
              <span style={{ opacity: 0.7 }}>{themeOpen(b.theme) ? '▾' : '▸'}</span>
              <span style={{ flex: 1 }}>{b.theme}</span>
              <span style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #6b7280)' }}>
                进行中 {b.active.length}
              </span>
            </button>
            {themeOpen(b.theme) && (
              <div style={{ paddingLeft: 8 }}>
                {b.maps.map((n) => (
                  <LeafRow key={n.id} leaf={n} selected={selected} onSelect={(id) => onSelect(id)} />
                ))}
                {b.active.map((g) => (
                  <SchemeGroupBlock
                    key={g.schemeId}
                    group={g}
                    open={groupOpen(`a:${g.schemeId}`)}
                    onToggle={() =>
                      setOpenGroups((m) => ({ ...m, [`a:${g.schemeId}`]: !groupOpen(`a:${g.schemeId}`) }))
                    }
                    selected={selected}
                    onSelect={(id) => onSelect(id)}
                  />
                ))}
                {b.ungrouped.length > 0 && (
                  <>
                    <div style={{ ...sectionTitle, paddingLeft: 10 }}>未归组</div>
                    {b.ungrouped.map((n) => (
                      <LeafRow key={n.id} leaf={n} selected={selected} onSelect={(id) => onSelect(id)} />
                    ))}
                  </>
                )}
                {b.archived.length > 0 && (
                  <SchemeGroupBlock
                    key="archive-root"
                    group={{
                      schemeId: `__archive__:${b.theme}`,
                      title: '落地归档',
                      status: null,
                      archived: true,
                      scheme: null,
                      slices: [],
                      tests: [],
                      norms: [],
                    }}
                    open={groupOpen(`ar:${b.theme}`)}
                    onToggle={() => setOpenGroups((m) => ({ ...m, [`ar:${b.theme}`]: !groupOpen(`ar:${b.theme}`) }))}
                    selected={selected}
                    onSelect={onSelect}
                    nested={b.archived}
                    nestedOpen={openGroups}
                    setNestedOpen={setOpenGroups}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          flex: 'none',
          borderTop: '1px solid var(--dsw-alias-border-l2, #1f2937)',
          padding: '4px 0 8px',
        }}
      >
        <div style={sectionTitle}>生命周期</div>
        {life.length === 0 ? (
          <div style={{ padding: '4px 12px', fontSize: 12, color: 'var(--dsw-alias-label-tertiary, #6b7280)' }}>
            无状态
          </div>
        ) : (
          life.map(({ status, count }) => {
            const on = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => onStatusFilter(on ? '全部' : status)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  border: 0,
                  background: on
                    ? 'var(--dsw-alias-interactive-bg-active, rgba(255,255,255,0.14))'
                    : 'transparent',
                  color: 'var(--dsw-alias-label-primary, #e5e7eb)',
                  padding: '5px 10px',
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 99,
                    flex: 'none',
                    background: statusStroke(status),
                  }}
                />
                <span style={{ width: 48, flex: 'none', fontSize: 11 }}>{status}</span>
                <span
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 99,
                    background: 'var(--dsw-alias-interactive-bg-hover, rgba(255,255,255,0.08))',
                    overflow: 'hidden',
                  }}
                >
                  <i
                    style={{
                      display: 'block',
                      height: '100%',
                      width: `${Math.round((count / maxLife) * 100)}%`,
                      background: statusStroke(status),
                      borderRadius: 99,
                    }}
                  />
                </span>
                <span
                  style={{
                    width: 18,
                    textAlign: 'right',
                    fontSize: 11,
                    color: 'var(--dsw-alias-label-tertiary, #6b7280)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function LeafRow({
  leaf,
  selected,
  onSelect,
}: {
  leaf: ThemeTreeLeaf;
  selected: string | null;
  onSelect: (id: string, leafType?: ThemeTreeLeaf['type']) => void;
}) {
  const isIndex = leaf.type === 'index';
  const dot =
    leaf.type === 'map'
      ? 'var(--dsw-static-deepseek-400, #679efe)'
      : leaf.type === 'scheme' || leaf.type === 'archive'
        ? 'var(--dsw-static-green-500, #22c55e)'
        : leaf.type === 'test' || leaf.type === 'slice'
          ? 'var(--dsw-static-amber-500, #f59e0b)'
          : isIndex
            ? 'var(--dsw-alias-label-tertiary, #6b7280)'
            : 'var(--dsw-static-deepseek-300, #b7c8fe)';
  return (
    <button
      type="button"
      style={{
        ...rowBtn(selected === leaf.id),
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 8px',
      }}
      onClick={() => onSelect(leaf.id, leaf.type)}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: isIndex ? 2 : 99,
          background: dot,
          flex: 'none',
        }}
      />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {leaf.title}
      </span>
      {leaf.status && (
        <span style={{ flex: 'none', fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #6b7280)' }}>
          {leaf.status}
        </span>
      )}
    </button>
  );
}

function SchemeGroupBlock({
  group,
  open,
  onToggle,
  selected,
  onSelect,
  nested,
  nestedOpen,
  setNestedOpen,
}: {
  group: ThemeSchemeGroup;
  open: boolean;
  onToggle: () => void;
  selected: string | null;
  onSelect: (id: string, leafType?: ThemeTreeLeaf['type']) => void;
  nested?: ThemeSchemeGroup[];
  nestedOpen?: Record<string, boolean>;
  setNestedOpen?: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const isArchiveRoot = group.schemeId.startsWith('__archive__:');
  const selectLeaf = (id: string, leafType?: ThemeTreeLeaf['type']) => {
    if (leafType === 'slice') onSelect(group.schemeId);
    else onSelect(id, leafType);
  };
  return (
    <div>
      <button
        type="button"
        style={{
          ...rowBtn(false),
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
        onClick={onToggle}
      >
        <span style={{ opacity: 0.7 }}>{open ? '▾' : '▸'}</span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {group.title}
        </span>
        <span style={{ fontSize: 10, color: 'var(--dsw-alias-label-tertiary, #6b7280)' }}>
          {isArchiveRoot ? String(nested?.length ?? 0) : (group.status ?? '')}
        </span>
      </button>
      {open && !isArchiveRoot && (
        <div style={{ paddingLeft: 10 }}>
          {(group.scheme || group.slices.length > 0) && (
            <>
              <KindLabel>{group.slices.length > 0 ? '方案 / 切片' : '方案'}</KindLabel>
              {group.scheme && <LeafRow leaf={group.scheme} selected={selected} onSelect={selectLeaf} />}
              {group.slices.map((s) => (
                <LeafRow key={s.id} leaf={s} selected={selected} onSelect={selectLeaf} />
              ))}
            </>
          )}
          {group.tests.length > 0 && (
            <>
              <KindLabel>测试</KindLabel>
              {group.tests.map((t) => (
                <LeafRow key={t.id} leaf={t} selected={selected} onSelect={selectLeaf} />
              ))}
            </>
          )}
          {group.norms.length > 0 && (
            <>
              <KindLabel>规范</KindLabel>
              {group.norms.map((n) => (
                <LeafRow key={`${group.schemeId}:${n.id}`} leaf={n} selected={selected} onSelect={selectLeaf} />
              ))}
            </>
          )}
        </div>
      )}
      {open && isArchiveRoot && nested && setNestedOpen && nestedOpen && (
        <div style={{ paddingLeft: 10 }}>
          {nested.map((g) => (
            <SchemeGroupBlock
              key={g.schemeId}
              group={g}
              open={nestedOpen[`n:${g.schemeId}`] ?? false}
              onToggle={() =>
                setNestedOpen((m) => ({ ...m, [`n:${g.schemeId}`]: !(m[`n:${g.schemeId}`] ?? false) }))
              }
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function KindLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--dsw-alias-label-tertiary, #6b7280)',
        padding: '6px 8px 2px',
        letterSpacing: '0.04em',
      }}
    >
      {children}
    </div>
  );
}

function QueryBlock({
  title,
  emptyLabel,
  rows,
  selected,
  onSelectQuery,
}: {
  title: string;
  emptyLabel: string;
  rows: CapMapQueryRow[];
  selected: string | null;
  onSelectQuery: (row: CapMapQueryRow) => void;
}) {
  return (
    <div>
      <div style={sectionTitle}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ padding: '4px 10px 8px', fontSize: 12, color: 'var(--dsw-alias-label-tertiary, #6b7280)' }}>
          {emptyLabel}
        </div>
      ) : (
        rows.map((r) => (
          <button
            key={r.id}
            type="button"
            style={rowBtn(selected === r.schemeId)}
            onClick={() => onSelectQuery(r)}
          >
            <div>{r.label}</div>
            {r.detail && (
              <div style={{ fontSize: 10, color: 'var(--dsw-alias-label-secondary, #9ca3af)' }}>{r.detail}</div>
            )}
          </button>
        ))
      )}
    </div>
  );
}

/** @deprecated 用 LiveBoard / ThemeTreePanel；保留兼容旧 import */
export function CapabilityPanel(props: LiveBoardProps) {
  return <LiveBoard {...props} />;
}
