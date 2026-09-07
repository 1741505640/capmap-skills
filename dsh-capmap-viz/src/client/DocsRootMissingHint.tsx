import { useEffect, useMemo, useRef, useState } from 'react';
import { defaultDocsRootName } from '../bootstrap/docsRootName.ts';
import {
  CAPMAP_INIT_PROMPT,
  CAPMAP_SKILL_INSTALL_CMD,
} from '../setupHint.ts';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CmdRow({ label, cmd }: { label: string; cmd: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          color: 'var(--dsw-alias-label-secondary, #9ca3af)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
        <code
          style={{
            flex: 1,
            display: 'block',
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid var(--dsw-alias-border-l2, #374151)',
            background: 'var(--dsw-specific-input-major, #1a1a1c)',
            fontSize: 12,
            lineHeight: 1.45,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            color: 'var(--dsw-alias-label-primary, #e5e7eb)',
          }}
        >
          {cmd}
        </code>
        <button
          type="button"
          onClick={() => {
            void copyText(cmd).then((ok) => {
              if (!ok) return;
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            });
          }}
          style={{
            flex: 'none',
            padding: '0 12px',
            borderRadius: 6,
            border: '1px solid var(--dsw-alias-border-l2, #374151)',
            background: 'var(--dsw-alias-button-elevated-fill, #1f2937)',
            color: 'var(--dsw-alias-label-primary, #e5e7eb)',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
    </div>
  );
}

export interface DocsRootMissingHintProps {
  projectRoot?: string | null;
  workspaceName?: string | null;
  onBootstrap?: (
    opts: { docsRoot: string; installSkills: boolean },
    onProgress?: (s: { phase: string; logs: string[] }) => void,
  ) => Promise<void>;
}

/** 缺 docs_root / 未装 capmap-skills 时的引导面板。 */
export function DocsRootMissingHint({
  projectRoot,
  workspaceName,
  onBootstrap,
}: DocsRootMissingHintProps) {
  const suggested = useMemo(
    () => defaultDocsRootName(workspaceName, projectRoot),
    [workspaceName, projectRoot],
  );
  const [docsRoot, setDocsRoot] = useState(suggested);
  const [installSkills, setInstallSkills] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [phase, setPhase] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    setDocsRoot(suggested);
  }, [suggested]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  const canBootstrap = Boolean(onBootstrap && projectRoot?.trim());

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: 24,
        maxWidth: 640,
      }}
    >
      <h2 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600 }}>未找到文档体系（docs_root）</h2>
      <p
        style={{
          margin: '0 0 16px',
          fontSize: 13,
          lineHeight: 1.55,
          color: 'var(--dsw-alias-label-secondary, #9ca3af)',
        }}
      >
        本插件依赖 <b style={{ color: 'var(--dsw-alias-label-primary, #e5e7eb)' }}>capmap-skills</b>
        。当前工作区
        {projectRoot ? (
          <>
            （
            <span style={{ wordBreak: 'break-all' }}>{projectRoot}</span>）
          </>
        ) : null}{' '}
        没有可用的 <code>capmap.yaml</code> / <code>docs_root</code>。
      </p>

      {canBootstrap && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            border: '1px solid var(--dsw-alias-border-l2, #374151)',
            background: 'var(--dsw-alias-bg-layer-1, #232325)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>一键初始化</div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            <span style={{ width: 72, color: 'var(--dsw-alias-label-secondary, #9ca3af)' }}>docs_root</span>
            <input
              value={docsRoot}
              onChange={(e) => setDocsRoot(e.target.value.trim() || suggested)}
              disabled={busy}
              placeholder={suggested}
              style={{
                flex: 1,
                height: 28,
                padding: '0 8px',
                borderRadius: 6,
                border: '1px solid var(--dsw-alias-border-l2, #374151)',
                background: 'var(--dsw-specific-input-major, #1a1a1c)',
                color: 'inherit',
                fontSize: 12,
              }}
            />
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              marginBottom: 12,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={installSkills}
              disabled={busy}
              onChange={(e) => setInstallSkills(e.target.checked)}
            />
            同时安装 Skill（后台任务，可看下方日志；约 1–3 分钟）
          </label>
          <button
            type="button"
            disabled={busy || !docsRoot}
            onClick={() => {
              if (!onBootstrap) return;
              setBusy(true);
              setErr(null);
              setPhase('启动任务…');
              setLogs([]);
              void onBootstrap({ docsRoot, installSkills }, ({ phase: p, logs: ls }) => {
                setPhase(p);
                setLogs(ls);
              })
                .then(() => {
                  setPhase('完成，正在加载图谱…');
                })
                .catch((e) => {
                  setErr(String(e));
                })
                .finally(() => setBusy(false));
            }}
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 6,
              border: 0,
              background: 'var(--dsw-alias-button-info-fill, #3b82f6)',
              color: '#fff',
              cursor: busy ? 'wait' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? '进行中…' : '一键安装 Skill 并初始化'}
          </button>

          {(busy || phase || logs.length > 0) && (
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  fontSize: 12,
                  marginBottom: 6,
                  color: 'var(--dsw-alias-label-primary, #e5e7eb)',
                }}
              >
                {busy ? '⏳ ' : ''}
                {phase || '…'}
              </div>
              <pre
                ref={logRef}
                style={{
                  margin: 0,
                  maxHeight: 220,
                  overflow: 'auto',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--dsw-alias-border-l2, #374151)',
                  background: '#0d0d0e',
                  fontSize: 11,
                  lineHeight: 1.45,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: 'var(--dsw-alias-label-secondary, #9ca3af)',
                }}
              >
                {logs.length ? logs.join('\n') : '等待日志…'}
              </pre>
            </div>
          )}

          {err && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#fca5a5', whiteSpace: 'pre-wrap' }}>{err}</div>
          )}
        </div>
      )}

      <details style={{ marginBottom: 8 }}>
        <summary
          style={{
            fontSize: 12,
            color: 'var(--dsw-alias-label-secondary, #9ca3af)',
            cursor: 'pointer',
          }}
        >
          手动命令（备用）
        </summary>
        <div style={{ marginTop: 10 }}>
          <CmdRow label="① 在仓库根目录安装 Skill" cmd={CAPMAP_SKILL_INSTALL_CMD} />
          <CmdRow label="② 对 Agent 说（触发 capmap-init）" cmd={CAPMAP_INIT_PROMPT} />
        </div>
      </details>
    </div>
  );
}
