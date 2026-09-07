import { useEffect } from 'react';

export interface MarkdownPreviewProps {
  filename: string;
  text: string;
  onClose: () => void;
}

/** 面板内只读 Markdown 预览（轻量渲染，不写回）。 */
export function MarkdownPreview({ filename, text, onClose }: MarkdownPreviewProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const html = renderMarkdownLite(text);

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        background: 'var(--dsw-alias-bg-mask-1, rgba(0,0,0,0.62))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: 'min(680px, 100%)',
          maxHeight: '86%',
          overflow: 'auto',
          background: 'var(--dsw-alias-bg-layer-2, #232325)',
          border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12))',
          borderRadius: 10,
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 14px',
            background: 'var(--dsw-alias-bg-layer-2, #232325)',
            borderBottom: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12))',
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>{filename}</span>
          <span
            style={{
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 999,
              background: 'var(--dsw-alias-markdown-tag, #2c2c2e)',
              color: 'var(--dsw-alias-label-secondary, #9ca3af)',
            }}
          >
            只读
          </span>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 0,
              background: 'transparent',
              color: 'var(--dsw-alias-label-secondary, #9ca3af)',
              cursor: 'pointer',
              fontSize: 12,
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            关闭
          </button>
        </div>
        <article
          style={{
            padding: '18px 22px 28px',
            fontSize: 13,
            lineHeight: 1.7,
            color: 'var(--dsw-alias-label-primary, #e5e7eb)',
          }}
          // 只读预览：内容来自本仓 docs，Host 已校验路径在 docs_root 内
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 极简 Markdown → HTML（标题/段落/列表/代码/表格/引用/粗斜体）。 */
export function renderMarkdownLite(src: string): string {
  // 去掉 frontmatter
  let body = src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  let inCode = false;
  let codeBuf: string[] = [];
  let inUl = false;
  let inTable = false;
  let tableRows: string[][] = [];

  const closeUl = () => {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
  };
  const flushTable = () => {
    if (!inTable) return;
    if (tableRows.length > 0) {
      out.push('<table style="width:100%;border-collapse:collapse;font-size:12px;margin:8px 0 14px">');
      tableRows.forEach((cells, ri) => {
        const tag = ri === 0 ? 'th' : 'td';
        out.push('<tr>');
        for (const c of cells) {
          out.push(
            `<${tag} style="border:1px solid rgba(255,255,255,0.16);padding:6px 8px;text-align:left">${inline(
              c,
            )}</${tag}>`,
          );
        }
        out.push('</tr>');
      });
      out.push('</table>');
    }
    inTable = false;
    tableRows = [];
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('```')) {
      closeUl();
      flushTable();
      if (!inCode) {
        inCode = true;
        codeBuf = [];
      } else {
        out.push(
          `<pre style="background:rgba(0,0,0,0.35);padding:10px 12px;border-radius:6px;overflow:auto;font-size:12px"><code>${escapeHtml(
            codeBuf.join('\n'),
          )}</code></pre>`,
        );
        inCode = false;
      }
      i++;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }
    if (/^\|(.+)\|$/.test(line.trim()) && !/^\|\s*-+/.test(line.trim())) {
      closeUl();
      if (!inTable) inTable = true;
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      i++;
      continue;
    }
    if (/^\|\s*-+/.test(line.trim())) {
      i++;
      continue;
    }
    flushTable();

    if (/^#{1,3}\s+/.test(line)) {
      closeUl();
      const m = line.match(/^(#{1,3})\s+(.+)$/);
      if (m) {
        const level = m[1].length;
        const size = level === 1 ? 20 : level === 2 ? 14 : 13;
        out.push(
          `<h${level} style="margin:${level === 1 ? '0 0 8px' : '22px 0 8px'};font-size:${size}px;font-weight:650">${inline(
            m[2],
          )}</h${level}>`,
        );
      }
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      closeUl();
      out.push(
        `<blockquote style="margin:0 0 12px;padding:8px 12px;border-left:3px solid #679efe;background:rgb(52,65,91)">${inline(
          line.replace(/^>\s?/, ''),
        )}</blockquote>`,
      );
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inUl) {
        out.push('<ul style="margin:0 0 12px;padding-left:18px">');
        inUl = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
      i++;
      continue;
    }
    if (line.trim() === '') {
      closeUl();
      i++;
      continue;
    }
    closeUl();
    out.push(`<p style="margin:0 0 10px">${inline(line)}</p>`);
    i++;
  }
  closeUl();
  flushTable();
  if (inCode) {
    out.push(
      `<pre style="background:rgba(0,0,0,0.35);padding:10px 12px;border-radius:6px;overflow:auto;font-size:12px"><code>${escapeHtml(
        codeBuf.join('\n'),
      )}</code></pre>`,
    );
  }
  return out.join('\n');
}

function inline(s: string): string {
  let t = escapeHtml(s);
  t = t.replace(/`([^`]+)`/g, '<code style="font-family:ui-monospace,Consolas,monospace;font-size:12px;background:#292929;padding:1px 5px;border-radius:4px">$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g, (_m, a, b) => `<span style="color:#679efe">${b || a}</span>`);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#679efe">$1</a>');
  return t;
}
