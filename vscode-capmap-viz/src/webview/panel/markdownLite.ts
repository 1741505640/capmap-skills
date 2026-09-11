/** 极简 Markdown → HTML（标题/段落/列表/代码/表格/引用/粗斜体）。 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(s: string): string {
  let t = escapeHtml(s);
  t = t.replace(
    /`([^`]+)`/g,
    '<code style="font-family:ui-monospace,Consolas,monospace;font-size:12px;background:rgba(127,127,127,.2);padding:1px 5px;border-radius:4px">$1</code>',
  );
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(
    /\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g,
    (_m, a, b) => `<span style="color:var(--vscode-textLink-foreground,#679efe)">${b || a}</span>`,
  );
  t = t.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" style="color:var(--vscode-textLink-foreground,#679efe)">$1</a>',
  );
  return t;
}

export function renderMarkdownLite(src: string): string {
  const body = src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
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
      out.push('<table class="md-table">');
      tableRows.forEach((cells, ri) => {
        const tag = ri === 0 ? 'th' : 'td';
        out.push('<tr>');
        for (const c of cells) out.push(`<${tag}>${inline(c)}</${tag}>`);
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
        out.push(`<pre class="md-pre"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
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
      tableRows.push(
        line
          .trim()
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim()),
      );
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
      if (m) out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      closeUl();
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`);
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inUl) {
        out.push('<ul>');
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
    out.push(`<p>${inline(line)}</p>`);
    i++;
  }
  closeUl();
  flushTable();
  if (inCode) out.push(`<pre class="md-pre"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
  return out.join('\n');
}
