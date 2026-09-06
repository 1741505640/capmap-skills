// CapMapParser：纯函数、无 Cordis 依赖，可独立单测。
// 输入 = 一组 { path, content }（相对 docs_root 的 md 文本），输出 = 图 JSON。
import type { CapMapGraph, CapMapNode, CapMapEdge, Capability, NodeType } from './types.ts';

/** 解析输入：一个 md 文件的相对路径 + 文本。 */
export interface FileInput {
  /** 相对 docs_root 的路径（可含反斜杠，内部归一化）。 */
  path: string;
  content: string;
}

/** 去掉围栏与行内代码，避免示例里的 `[[..]]` / 表格误入。 */
export function stripCode(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ');
}

/** 极简 YAML 子集：解析 `tags:` 块列表/行内列表及其它标量键。 */
export function parseFrontMatter(text: string): { data: Record<string, unknown>; body: string } {
  const m = /^\uFEFF?---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(text);
  if (!m) return { data: {}, body: text };
  return { data: parseYamlSubset(m[1]), body: text.slice(m[0].length) };
}

function parseYamlSubset(raw: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const lines = raw.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const keyMatch = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
    if (!keyMatch) {
      i += 1;
      continue;
    }
    const key = keyMatch[1];
    const rest = keyMatch[2].trim();
    if (rest === '') {
      const items: string[] = [];
      let j = i + 1;
      while (j < lines.length) {
        const it = /^\s+-\s+(.*)$/.exec(lines[j]);
        if (!it) break;
        items.push(it[1].trim());
        j += 1;
      }
      if (items.length) {
        out[key] = items;
        i = j;
      } else {
        i += 1;
      }
      continue;
    }
    if (rest.startsWith('[') && rest.endsWith(']')) {
      out[key] = rest
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/^['"]|['"]$/g, ''));
    } else {
      out[key] = rest.replace(/^['"]|['"]$/g, '');
    }
    i += 1;
  }
  return out;
}

export function tagsOf(data: Record<string, unknown>): string[] {
  const t = data['tags'];
  if (Array.isArray(t)) return t.map((x) => String(x));
  if (typeof t === 'string') return t.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}

/** 提取 `[[..]]` 目标 stem（去别名、去路径、去 .md）。 */
export function parseWikilinks(text: string): string[] {
  const clean = stripCode(text);
  const out: string[] = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    let inner = m[1].trim();
    if (inner.includes('|')) inner = inner.slice(0, inner.indexOf('|')).trim();
    inner = inner.replace(/\\/g, '/').replace(/\/+$/, '');
    const name = inner.split('/').pop() ?? '';
    const stem = name.endsWith('.md') ? name.slice(0, -3) : name;
    if (stem) out.push(stem);
  }
  return out;
}

const INDEX_NAMES = new Set(['文档首页.md', '能力总览.md', '交付说明.md', '运维说明.md', 'Obsidian使用说明.md']);

/** 节点分型；返回 null 表示不建节点（活跃区切片/规格执行票）。 */
export function classifyNode(path: string): NodeType | null {
  const p = path.replace(/\\/g, '/');
  const name = p.split('/').pop() ?? '';
  if (p.startsWith('_archive/')) return 'archive';
  if (/^方案\/[^/]+\/切片\//.test(p)) return null; // 活跃切片/规格：执行票，不入主图
  if (name.startsWith('能力底图-')) return 'map';
  if (p.startsWith('测试/')) return 'test';
  if (p.startsWith('规范/')) return 'norm';
  if (name.endsWith('索引.md') || INDEX_NAMES.has(name)) return 'index';
  if (p.startsWith('方案/')) return 'scheme';
  return 'index';
}

export function themeOf(path: string): string | null {
  const p = path.replace(/\\/g, '/');
  const m = /^(?:_archive\/)?(?:方案|测试)\/([^/]+)\//.exec(p);
  return m ? m[1] : null;
}

export function statusOf(tags: string[]): string | null {
  for (const t of tags) if (t.startsWith('状态/')) return t.slice('状态/'.length);
  return null;
}

export function volumeOf(tags: string[]): '小' | '大' | null {
  for (const t of tags) {
    if (t === '体量/小') return '小';
    if (t === '体量/大') return '大';
  }
  return null;
}

export function extractTitle(body: string): string {
  const m = /^#\s+(.+)$/m.exec(body);
  return m ? m[1].trim() : '';
}

export function extractSummary(body: string): string | null {
  const clean = stripCode(body);
  for (const raw of clean.split(/\r?\n/)) {
    const t = raw.trim();
    if (!t || t.startsWith('#') || t.startsWith('>') || t.startsWith('|') || t === '---') continue;
    if (t.length < 200) return t;
  }
  return null;
}

/** 能力底图 §1 能力清单表 → capabilities。 */
export function parseCapabilities(body: string): Capability[] {
  const m = /^##\s*1\.\s*[^\n]*\n/m.exec(body);
  if (!m) return [];
  const rest = body.slice(m.index! + m[0].length);
  const nxt = /^##\s+\d+/m.exec(rest);
  const block = nxt ? rest.slice(0, nxt.index) : rest;
  const out: Capability[] = [];
  for (const line of block.split(/\r?\n/)) {
    const t = line.trim();
    if (!t.startsWith('|')) continue;
    const cells = t.split('|').map((c) => c.trim());
    if (cells.length < 4) continue;
    const name = cells[1];
    const status = cells[2];
    if (!name || name.includes('---')) continue;
    out.push({ name, status, summary: cells.slice(3).join(' ') });
  }
  return out;
}

/** 主入口：一组文件 → 图 JSON。 */
export function parseGraph(files: FileInput[]): CapMapGraph {
  const nodes: CapMapNode[] = [];
  const byStem = new Map<string, CapMapNode>();
  const capabilities: Capability[] = [];
  const themes = new Set<string>();

  for (const f of files) {
    const rel = f.path.replace(/\\/g, '/');
    const stem = rel.split('/').pop()!.replace(/\.md$/, '');
    const type = classifyNode(rel);
    if (type === null) continue;
    const { data, body } = parseFrontMatter(f.content);
    const tags = tagsOf(data);
    const theme = themeOf(rel);
    if (theme) themes.add(theme);
    const node: CapMapNode = {
      id: stem,
      title: extractTitle(body) || stem,
      path: rel,
      type,
      status: statusOf(tags),
      volume: volumeOf(tags),
      theme,
      summary: extractSummary(body),
    };
    nodes.push(node);
    byStem.set(stem, node);
    if (type === 'map') capabilities.push(...parseCapabilities(body));
  }

  const edges: CapMapEdge[] = [];
  const edgeKey = new Set<string>();
  const addEdge = (source: string, target: string, kind: CapMapEdge['kind']) => {
    if (source === target) return;
    if (!byStem.has(target)) return; // 只建到已知节点的边
    const k = `${kind}:${source}>${target}`;
    if (edgeKey.has(k)) return;
    edgeKey.add(k);
    edges.push({ source, target, kind });
  };

  for (const f of files) {
    const rel = f.path.replace(/\\/g, '/');
    const stem = rel.split('/').pop()!.replace(/\.md$/, '');
    if (!byStem.has(stem)) continue; // 切片/规格等非节点文件不产出 wikilink 源边
    for (const target of parseWikilinks(f.content)) addEdge(stem, target, 'wikilink');
  }

  // 语义边（默认隐藏）：能力底图 → 同主题方案/测试（目录契约推导）。
  for (const node of nodes) {
    if (node.type !== 'map' || !node.theme) continue;
    for (const other of nodes) {
      if (other.theme !== node.theme) continue;
      if (other.type !== 'scheme' && other.type !== 'test') continue;
      if (other.path.includes('/切片/')) continue;
      addEdge(node.id, other.id, 'semantic');
    }
  }

  return { themes: [...themes].sort(), nodes, edges, capabilities };
}
