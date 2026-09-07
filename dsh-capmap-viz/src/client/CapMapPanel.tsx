// CapMap Viz：中栏面板 — 图谱铺满 + 轻推抽屉（V3）。
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { CapMapGraph, CapMapQueryRow } from '../parser/types.ts'
import type { CapMapPanelController } from './panel-controller.ts'
import { GraphCanvas, type GraphCanvasHandle } from './graph/GraphCanvas.tsx'
import { LiveBoard, ThemeTreePanel } from './panel/CapabilityPanel.tsx'
import { NodeDetail } from './detail/NodeDetail.tsx'
import { MarkdownPreview } from './detail/MarkdownPreview.tsx'
import { readStoredWorkspace, writeStoredWorkspace } from './workspace-memory.ts'
import { TYPE_FILTER_OPTIONS } from './labels.ts'
import { DocsRootMissingHint } from './DocsRootMissingHint.tsx'
import { isDocsRootMissingCode, isDocsRootMissingMessage } from '../setupHint.ts'

export interface CapMapRpcResult {
  ok: boolean
  value?: unknown
  error?: { code?: string; message?: string }
}

export interface WorkspaceItem {
  workspaceId: string
  title: string
  path: string
}

interface WorkspaceListLike {
  getSnapshot(): { items: readonly WorkspaceItem[] }
  subscribe(listener: () => void): () => void
}

export interface CapMapPanelProps {
  controller: CapMapPanelController
  call: (endpoint: string, payload: unknown) => Promise<CapMapRpcResult>
  workspaces?: {
    list: WorkspaceListLike
    openPath?: (path: string) => Promise<void>
  }
  useWorkspaces?: <S>(selector: (state: { items: readonly WorkspaceItem[] }) => S) => S
}

const selectStyle: import('react').CSSProperties = {
  height: 28,
  padding: '0 8px',
  borderRadius: 6,
  border: '1px solid var(--dsw-alias-border-l2, #374151)',
  background: 'var(--dsw-specific-input-major, #232325)',
  color: 'var(--dsw-alias-label-primary, #e5e7eb)',
  fontSize: 12,
}

const btnGhost: import('react').CSSProperties = {
  height: 28,
  padding: '0 10px',
  borderRadius: 6,
  border: 0,
  background: 'transparent',
  color: 'var(--dsw-alias-label-secondary, #9ca3af)',
  cursor: 'pointer',
  fontSize: 12,
}

const btnSec: import('react').CSSProperties = {
  height: 28,
  padding: '0 10px',
  borderRadius: 6,
  border: '1px solid var(--dsw-alias-border-l2, #374151)',
  background: 'var(--dsw-alias-button-elevated-fill, #1f2937)',
  color: 'var(--dsw-alias-label-primary, #e5e7eb)',
  cursor: 'pointer',
  fontSize: 12,
}

function useWorkspaceItems(props: CapMapPanelProps): readonly WorkspaceItem[] {
  const fromHook = props.useWorkspaces?.((s) => s.items)
  const list = props.workspaces?.list
  const fromStore = useSyncExternalStore(
    (cb) => (list ? list.subscribe(cb) : () => {}),
    () => list?.getSnapshot().items ?? [],
    () => [],
  )
  return fromHook ?? fromStore
}

function usePanelOpen(controller: CapMapPanelController): boolean {
  return useSyncExternalStore(
    (cb) => controller.subscribe(cb),
    () => controller.isOpen(),
    () => false,
  )
}

function normalizeRpc(res: CapMapRpcResult): CapMapRpcResult {
  if (!res || typeof res !== 'object') {
    return { ok: false, error: { message: '空 RPC 响应' } }
  }
  const inner = res.value as CapMapRpcResult | undefined
  if (
    res.ok &&
    inner &&
    typeof inner === 'object' &&
    'ok' in inner &&
    (Object.prototype.hasOwnProperty.call(inner, 'value') ||
      Object.prototype.hasOwnProperty.call(inner, 'error'))
  ) {
    return inner
  }
  return res
}

function asGraph(value: unknown): CapMapGraph | null {
  if (!value || typeof value !== 'object') return null
  const g = value as CapMapGraph
  if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) return null
  return {
    ...g,
    capabilities: Array.isArray(g.capabilities) ? g.capabilities : [],
    slices: Array.isArray(g.slices) ? g.slices : [],
    queries: g.queries ?? {
      frontier: [],
      validationGate: [],
      section1Fight: [],
    },
  }
}

type LeftDrawer = null | 'board' | 'tree'

export function CapMapPanel({ controller, call, workspaces, useWorkspaces }: CapMapPanelProps) {
  const items = useWorkspaceItems({ controller, call, workspaces, useWorkspaces })
  const panelOpen = usePanelOpen(controller)

  const [picking, setPicking] = useState(true)
  const [workspace, setWorkspace] = useState<WorkspaceItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [graph, setGraph] = useState<CapMapGraph | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [queryHint, setQueryHint] = useState<CapMapQueryRow | null>(null)
  const [advancedRoot, setAdvancedRoot] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [themeFilter, setThemeFilter] = useState('全部')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [statusFilter, setStatusFilter] = useState('全部')
  const [search, setSearch] = useState('')
  const [clusterThemes, setClusterThemes] = useState(true)
  const [watchRoot, setWatchRoot] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)
  const [leftDrawer, setLeftDrawer] = useState<LeftDrawer>(null)
  const [wide, setWide] = useState(true)
  const [preview, setPreview] = useState<{ path: string; text: string } | null>(null)
  const [previewErr, setPreviewErr] = useState<string | null>(null)

  const graphCanvasRef = useRef<GraphCanvasHandle>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const deeplinkDone = useRef(false)
  const deeplinkFocused = useRef(false)
  const revisionRef = useRef(0)
  const restoredRef = useRef(false)

  useEffect(() => {
    const el = shellRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setWide(el.clientWidth >= 900)
    })
    ro.observe(el)
    setWide(el.clientWidth >= 900)
    return () => ro.disconnect()
  }, [picking])

  const applyDeeplink = useCallback((g: CapMapGraph) => {
    if (deeplinkDone.current) return
    try {
      const node = new URLSearchParams(window.location.search).get('node')
      if (!node) return
      const stem = node.replace(/\.md$/i, '')
      const hit = g.nodes.find(
        (n) =>
          n.id === stem ||
          n.id === node ||
          n.path.endsWith(`/${stem}.md`) ||
          n.path.endsWith(`\\${stem}.md`),
      )
      if (hit) {
        setSelected(hit.id)
        deeplinkDone.current = true
        deeplinkFocused.current = false
      }
    } catch {
      /* ignore */
    }
  }, [])

  const loadRoot = useCallback(
    async (root: string, ws: WorkspaceItem | null) => {
      if (!root.trim()) return
      setLoading(true)
      setError(null)
      setErrorCode(null)
      setPicking(false)
      setWorkspace(ws)
      try {
        const res = normalizeRpc(await call('parse', { root: root.trim() }))
        if (res.ok) {
          const g = asGraph(res.value)
          if (!g) {
            setGraph(null)
            setError('解析结果缺少 nodes/edges')
            return
          }
          setGraph(g)
          setSelected(null)
          setQueryHint(null)
          setThemeFilter('全部')
          setTypeFilter('全部')
          setStatusFilter('全部')
          setSearch('')
          setWatchRoot(root.trim())
          setPreview(null)
          deeplinkDone.current = false
          deeplinkFocused.current = false
          applyDeeplink(g)
          if (ws) {
            writeStoredWorkspace({
              workspaceId: ws.workspaceId,
              path: ws.path,
              title: ws.title,
            })
          }
          try {
            const wr = normalizeRpc(await call('watch', { root: root.trim(), action: 'start' }))
            if (wr.ok) {
              const v = wr.value as { revision?: number }
              revisionRef.current = v.revision ?? 1
              setRevision(revisionRef.current)
            }
          } catch {
            /* watch 失败不阻断图谱 */
          }
        } else {
          setGraph(null)
          setError(res.error?.message ?? '解析失败')
          setErrorCode(res.error?.code ?? null)
        }
      } catch (err) {
        setGraph(null)
        setError(String(err))
        setErrorCode(null)
      } finally {
        setLoading(false)
      }
    },
    [call, applyDeeplink],
  )

  const pickWorkspace = useCallback(
    (ws: WorkspaceItem) => {
      const root = (ws.path ?? '').trim()
      if (!root) {
        setError('该工作区没有可用路径')
        setPicking(false)
        return
      }
      void loadRoot(root, ws)
    },
    [loadRoot],
  )

  const runBootstrap = useCallback(
    async (
      opts: { docsRoot: string; installSkills: boolean },
      onProgress?: (s: { phase: string; logs: string[] }) => void,
    ) => {
      const root = (watchRoot || workspace?.path || advancedRoot || '').trim()
      if (!root) throw new Error('没有可用的工作区路径')
      const startRes = normalizeRpc(
        await call('bootstrap', {
          root,
          docsRoot: opts.docsRoot,
          installSkills: opts.installSkills,
        }),
      )
      if (!startRes.ok) {
        throw new Error(startRes.error?.message ?? '无法启动初始化任务')
      }
      const jobId = (startRes.value as { jobId?: string })?.jobId
      if (!jobId) throw new Error('未返回 jobId')

      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
      for (;;) {
        await sleep(800)
        const stRes = normalizeRpc(await call('bootstrapStatus', { jobId }))
        if (!stRes.ok) {
          throw new Error(stRes.error?.message ?? '查询进度失败')
        }
        const snap = stRes.value as {
          state: 'running' | 'done' | 'error'
          phase: string
          logs: string[]
          error?: string
          result?: { skills?: { ok?: boolean; detail?: string } }
        }
        onProgress?.({ phase: snap.phase, logs: snap.logs ?? [] })
        if (snap.state === 'running') continue
        if (snap.state === 'error') {
          try {
            await loadRoot(root, workspace)
          } catch {
            /* ignore */
          }
          throw new Error(snap.error || snap.result?.skills?.detail || '初始化失败')
        }
        // done
        if (opts.installSkills && snap.result?.skills?.ok === false) {
          try {
            await loadRoot(root, workspace)
          } catch {
            /* ignore */
          }
          throw new Error(snap.result.skills.detail ?? 'Skill 未安装成功')
        }
        await loadRoot(root, workspace)
        return
      }
    },
    [advancedRoot, call, loadRoot, watchRoot, workspace],
  )

  useEffect(() => {
    if (!panelOpen || graph || !picking || restoredRef.current) return
    restoredRef.current = true
    const stored = readStoredWorkspace()
    if (!stored) return
    const match = items.find(
      (ws) => ws.workspaceId === stored.workspaceId || ws.path === stored.path,
    )
    if (match) {
      void loadRoot(match.path, match)
      return
    }
    if (stored.path) {
      void loadRoot(stored.path, {
        workspaceId: stored.workspaceId,
        path: stored.path,
        title: stored.title || stored.path,
      })
    }
  }, [panelOpen, graph, picking, items, loadRoot])

  const themeOptions = useMemo(() => {
    const s = new Set<string>()
    for (const n of graph?.nodes ?? []) if (n.theme) s.add(n.theme)
    return ['全部', ...[...s].sort()]
  }, [graph])

  const statusOptions = useMemo(() => {
    const s = new Set<string>()
    for (const n of graph?.nodes ?? []) if (n.status) s.add(n.status)
    return ['全部', ...[...s].sort()]
  }, [graph])

  const visibleGraph = useMemo((): CapMapGraph | null => {
    if (!graph) return null
    const q = search.trim().toLowerCase()
    const nodes = graph.nodes.filter((n) => {
      if (themeFilter !== '全部' && n.theme !== themeFilter) return false
      if (typeFilter !== '全部' && n.type !== typeFilter) return false
      if (statusFilter !== '全部' && n.status !== statusFilter) return false
      if (
        q &&
        !n.id.toLowerCase().includes(q) &&
        !n.title.toLowerCase().includes(q) &&
        !n.path.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
    const ids = new Set(nodes.map((n) => n.id))
    const edges = graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target))
    return { ...graph, nodes, edges }
  }, [graph, themeFilter, typeFilter, statusFilter, search])

  const onSelectNode = useCallback((id: string | null) => {
    setSelected(id)
    setQueryHint(null)
  }, [])

  const onSelectQuery = useCallback((row: CapMapQueryRow) => {
    setQueryHint(row)
    if (row.schemeId) setSelected(row.schemeId)
  }, [])

  const toggleLeft = (mode: 'board' | 'tree') => {
    if (wide) {
      // 宽屏：另一侧可同时开；同侧点一次关
      setLeftDrawer((cur) => {
        if (cur === mode) return null
        if (cur === null) return mode
        // 已开另一侧时，切到本侧（仍互斥一个左抽屉，避免挤图）
        return mode
      })
      return
    }
    setLeftDrawer((cur) => (cur === mode ? null : mode))
  }

  const openPreview = useCallback(
    async (relPath: string) => {
      if (!watchRoot) return
      setPreviewErr(null)
      try {
        const res = normalizeRpc(await call('read', { root: watchRoot, path: relPath }))
        if (!res.ok) {
          setPreviewErr(res.error?.message ?? '读取失败')
          return
        }
        const v = res.value as { path?: string; text?: string }
        setPreview({ path: v.path ?? relPath, text: v.text ?? '' })
      } catch (err) {
        setPreviewErr(String(err))
      }
    },
    [call, watchRoot],
  )

  useEffect(() => {
    if (!deeplinkDone.current || deeplinkFocused.current || !selected || picking || !panelOpen) return
    const t = window.setTimeout(() => {
      graphCanvasRef.current?.focusNode(selected)
      deeplinkFocused.current = true
    }, 700)
    return () => window.clearTimeout(t)
  }, [graph, selected, picking, panelOpen])

  useEffect(() => {
    if (!panelOpen || picking || !watchRoot) return
    let cancelled = false
    const tick = async () => {
      try {
        const res = normalizeRpc(await call('revision', { root: watchRoot }))
        if (cancelled || !res.ok) return
        const next = (res.value as { revision?: number }).revision ?? 0
        if (next > 0 && next !== revisionRef.current) {
          revisionRef.current = next
          setRevision(next)
          const parsed = normalizeRpc(await call('parse', { root: watchRoot }))
          if (parsed.ok && !cancelled) {
            const g = asGraph(parsed.value)
            if (g) setGraph(g)
          }
        }
      } catch {
        /* ignore */
      }
    }
    const id = window.setInterval(() => {
      void tick()
    }, 1500)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [panelOpen, picking, watchRoot, call])

  useEffect(() => {
    if (panelOpen && !picking) return
    if (!watchRoot) return
    void call('watch', { root: watchRoot, action: 'stop' })
  }, [panelOpen, picking, watchRoot, call])

  const startChangeWorkspace = () => {
    restoredRef.current = true
    setPicking(true)
    setGraph(null)
    setError(null)
    setErrorCode(null)
    setWatchRoot(null)
    setPreview(null)
    setLeftDrawer(null)
  }

  void revision

  const docsRootMissing =
    isDocsRootMissingCode(errorCode) || isDocsRootMissingMessage(error)
  const projectRootHint = watchRoot || workspace?.path || advancedRoot || null

  const showDetail = Boolean(selected && graph)
  // 窄屏：详情开时收左抽屉
  useEffect(() => {
    if (!wide && showDetail && leftDrawer) setLeftDrawer(null)
  }, [wide, showDetail]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={shellRef}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--dsw-alias-bg-base, #151517)',
        color: 'var(--dsw-alias-label-primary, #e5e7eb)',
      }}
    >
      <div
        style={{
          height: 40,
          flex: 'none',
          display: 'flex',
          gap: 8,
          padding: '0 10px',
          alignItems: 'center',
          borderBottom: '1px solid var(--dsw-alias-border-l2, #1f2937)',
          background: 'var(--dsw-alias-bg-layer-1, #232325)',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 13 }}>能力底图</span>
        {!picking && workspace && (
          <button
            type="button"
            title={workspace.path}
            onClick={startChangeWorkspace}
            style={{
              maxWidth: 148,
              height: 24,
              padding: '0 8px',
              border: '1px solid var(--dsw-alias-border-l2, #374151)',
              borderRadius: 6,
              background: 'var(--dsw-specific-input-major, #232325)',
              color: 'var(--dsw-alias-label-primary, #e5e7eb)',
              fontSize: 11,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {workspace.title}
          </button>
        )}
        {!picking && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索标题 / 文件名"
            style={{ ...selectStyle, width: 168 }}
          />
        )}
        <div style={{ flex: 1, minWidth: 8 }} />
        {!picking && (
          <>
            <button
              type="button"
              style={{ ...btnSec, ...(showFilters ? { background: 'var(--dsw-alias-interactive-bg-active, rgba(255,255,255,0.14))' } : {}) }}
              onClick={() => setShowFilters((v) => !v)}
            >
              筛选
            </button>
            <button type="button" style={btnGhost} onClick={() => setShowMore((v) => !v)}>
              更多
            </button>
          </>
        )}
        <button type="button" onClick={() => controller.closePanel()} style={btnGhost}>
          关闭
        </button>
      </div>

      {!picking && showFilters && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            padding: '6px 10px',
            borderBottom: '1px solid var(--dsw-alias-border-l2, #1f2937)',
            background: 'var(--dsw-alias-bg-layer-1, #232325)',
          }}
        >
          <select value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)} style={selectStyle}>
            {themeOptions.map((t) => (
              <option key={t} value={t}>
                主题:{t}
              </option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
            {TYPE_FILTER_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                类型:{t.label}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            {statusOptions.map((t) => (
              <option key={t} value={t}>
                状态:{t}
              </option>
            ))}
          </select>
        </div>
      )}

      {!picking && showMore && (
        <div
          style={{
            position: 'absolute',
            top: 44,
            right: 48,
            zIndex: 15,
            minWidth: 160,
            padding: 6,
            background: 'var(--dsw-specific-menu, #353638)',
            border: '1px solid var(--dsw-alias-border-l2, #374151)',
            borderRadius: 8,
          }}
        >
          <MoreItem
            label={clusterThemes ? '分簇：开' : '分簇：关'}
            onClick={() => setClusterThemes((v) => !v)}
          />
          <MoreItem
            label="导出 PNG"
            onClick={() => {
              graphCanvasRef.current?.exportPng('capmap-graph.png')
              setShowMore(false)
            }}
          />
          <MoreItem
            label="更换工作区"
            onClick={() => {
              startChangeWorkspace()
              setShowMore(false)
            }}
          />
          <MoreItem
            label={showAdvanced ? '收起高级' : '高级：手输路径'}
            onClick={() => setShowAdvanced((v) => !v)}
          />
        </div>
      )}

      {picking ? (
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          <h2 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600 }}>选择工作区</h2>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--dsw-alias-label-secondary, #9ca3af)' }}>
            打开能力底图。上次使用的工作区会自动恢复。
          </p>
          {items.length === 0 ? (
            <div style={{ fontSize: 13, color: '#fbbf24' }}>暂无工作区。请先在侧栏「添加工作区」。</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
              {items.map((ws) => (
                <button
                  key={ws.workspaceId}
                  type="button"
                  onClick={() => pickWorkspace(ws)}
                  disabled={loading}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    border: '1px solid var(--dsw-alias-border-l2, #374151)',
                    borderRadius: 8,
                    background: 'var(--dsw-alias-bg-layer-1, #232325)',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <b style={{ display: 'block', fontSize: 13 }}>{ws.title || ws.path}</b>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 4,
                      fontSize: 11,
                      color: 'var(--dsw-alias-label-secondary, #9ca3af)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {ws.path}
                  </span>
                </button>
              ))}
            </div>
          )}
          <div style={{ marginTop: 16 }}>
            <button type="button" onClick={() => setShowAdvanced((v) => !v)} style={btnSec}>
              {showAdvanced ? '收起高级' : '高级：手输路径'}
            </button>
          </div>
          {showAdvanced && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, maxWidth: 560, alignItems: 'center' }}>
              <input
                value={advancedRoot}
                onChange={(e) => setAdvancedRoot(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void loadRoot(advancedRoot, null)}
                placeholder="逃生舱：手输项目根绝对路径"
                style={{ ...selectStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => void loadRoot(advancedRoot, null)}
                disabled={loading || !advancedRoot.trim()}
                style={btnSec}
              >
                {loading ? '加载中…' : '加载'}
              </button>
            </div>
          )}
          {error &&
            (docsRootMissing ? (
              <div style={{ marginTop: 16 }}>
                <DocsRootMissingHint
                  projectRoot={projectRootHint}
                  workspaceName={workspace?.title}
                  onBootstrap={runBootstrap}
                />
              </div>
            ) : (
              <div style={{ marginTop: 12, color: '#fca5a5', fontSize: 13 }}>{error}</div>
            ))}
        </div>
      ) : (
        <>
          {showAdvanced && (
            <div style={{ display: 'flex', gap: 8, padding: '8px 10px', alignItems: 'center' }}>
              <input
                value={advancedRoot}
                onChange={(e) => setAdvancedRoot(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void loadRoot(advancedRoot, null)}
                placeholder="逃生舱：手输项目根绝对路径"
                style={{ ...selectStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={() => void loadRoot(advancedRoot, null)}
                disabled={loading || !advancedRoot.trim()}
                style={btnSec}
              >
                {loading ? '加载中…' : '加载'}
              </button>
            </div>
          )}
          {error && !docsRootMissing && (
            <div style={{ padding: '8px 16px', color: '#fca5a5', fontSize: 13 }}>{error}</div>
          )}
          {previewErr && (
            <div style={{ padding: '8px 16px', color: '#fca5a5', fontSize: 13 }}>{previewErr}</div>
          )}

          <div style={{ flex: 1, minHeight: 0, display: 'flex', position: 'relative' }}>
            {loading && !graph ? (
              <div style={{ flex: 1, padding: 40, color: 'var(--dsw-alias-label-secondary, #9ca3af)' }}>
                正在解析能力底图…
              </div>
            ) : docsRootMissing && !graph ? (
              <DocsRootMissingHint
                projectRoot={projectRootHint}
                workspaceName={workspace?.title}
                onBootstrap={runBootstrap}
              />
            ) : graph && visibleGraph ? (
              <>
                <div
                  style={{
                    width: 36,
                    flex: 'none',
                    borderRight: '1px solid var(--dsw-alias-border-l2, #1f2937)',
                    background: 'var(--dsw-alias-bg-layer-1, #232325)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: 8,
                    gap: 6,
                  }}
                >
                  <RailBtn
                    label="看"
                    title="活看板"
                    on={leftDrawer === 'board'}
                    onClick={() => toggleLeft('board')}
                  />
                  <RailBtn
                    label="树"
                    title="目录"
                    on={leftDrawer === 'tree'}
                    onClick={() => toggleLeft('tree')}
                  />
                </div>
                {leftDrawer === 'board' && (
                  <div style={{ width: 240, flex: 'none', minHeight: 0 }}>
                    <LiveBoard
                      graph={graph}
                      themeFilter={themeFilter}
                      selected={selected}
                      onSelectQuery={onSelectQuery}
                    />
                  </div>
                )}
                {leftDrawer === 'tree' && (
                  <div style={{ width: 268, flex: 'none', minHeight: 0 }}>
                    <ThemeTreePanel
                      graph={graph}
                      themeFilter={themeFilter}
                      statusFilter={statusFilter}
                      selected={selected}
                      onSelect={onSelectNode}
                      onStatusFilter={setStatusFilter}
                    />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, minHeight: 0, position: 'relative' }}>
                  <GraphCanvas
                    ref={graphCanvasRef}
                    graph={visibleGraph}
                    selected={selected}
                    onSelect={onSelectNode}
                    clusterThemes={clusterThemes}
                  />
                </div>
                {showDetail && (
                  <div style={{ width: 260, flex: 'none', minHeight: 0 }}>
                    <NodeDetail
                      graph={graph}
                      selected={selected}
                      queryHint={queryHint}
                      onClose={() => onSelectNode(null)}
                      onSelectNeighbor={onSelectNode}
                      onOpenSource={(p) => void openPreview(p)}
                    />
                  </div>
                )}
                {preview && (
                  <MarkdownPreview
                    filename={preview.path.split('/').pop() ?? preview.path}
                    text={preview.text}
                    onClose={() => setPreview(null)}
                  />
                )}
              </>
            ) : (
              <div style={{ flex: 1, padding: 40, color: 'var(--dsw-alias-label-tertiary, #6b7280)' }}>
                选择工作区后加载图谱。
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function RailBtn({
  label,
  title,
  on,
  onClick,
}: {
  label: string
  title: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: '1px solid var(--dsw-alias-border-l2, #374151)',
        background: on
          ? 'var(--dsw-specific-sidebar-nav-item-active, #43454a)'
          : 'var(--dsw-alias-button-elevated-fill, #1f2937)',
        color: on
          ? 'var(--dsw-alias-label-primary, #e5e7eb)'
          : 'var(--dsw-alias-label-secondary, #9ca3af)',
        fontSize: 11,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function MoreItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        border: 0,
        background: 'transparent',
        color: 'var(--dsw-alias-label-primary, #e5e7eb)',
        padding: '7px 8px',
        borderRadius: 6,
        fontSize: 12,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

export default CapMapPanel
