/**
 * CapMapParser：Cordis-free 纯函数。
 * 输入项目根 → 读 capmap.yaml 定位 docs_root → 遍历 md → 图 JSON + 切片 sidecar。
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import yaml from 'js-yaml';
import { formatDocsRootMissingMessage } from "../setupHint.js";
import { deriveQueries } from "./queries.js";
/** 工作区无 capmap.yaml / docs_root 时抛出；RPC 层用 code=internal，Client 用文案识别。 */
export class DocsRootMissingError extends Error {
    code = 'docs_root_missing';
    constructor(projectRoot) {
        super(formatDocsRootMissingMessage(projectRoot));
        this.name = 'DocsRootMissingError';
    }
}
const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+\.md)(?:#[^)]*)?\)/g;
const BLOCKED_BY_RE = /Blocked by[：:]\s*(.+)$/im;
function normalizeSlashes(p) {
    return p.replace(/\\/g, '/');
}
function listMdFiles(dir, out = []) {
    if (!existsSync(dir))
        return out;
    for (const name of readdirSync(dir)) {
        if (name === '.obsidian' || name === 'node_modules')
            continue;
        const abs = join(dir, name);
        const st = statSync(abs);
        if (st.isDirectory())
            listMdFiles(abs, out);
        else if (name.endsWith('.md'))
            out.push(abs);
    }
    return out;
}
function parseFrontmatter(raw) {
    if (!raw.startsWith('---')) {
        const m = raw.match(/^#\s+(.+)$/m);
        return { tags: [], body: raw, titleHint: m?.[1]?.trim() ?? null };
    }
    const end = raw.indexOf('\n---', 3);
    if (end < 0) {
        const m = raw.match(/^#\s+(.+)$/m);
        return { tags: [], body: raw, titleHint: m?.[1]?.trim() ?? null };
    }
    const fmText = raw.slice(3, end).trim();
    const body = raw.slice(end + 4);
    let tags = [];
    try {
        const fm = yaml.load(fmText);
        if (fm && Array.isArray(fm.tags)) {
            tags = fm.tags.map(String);
        }
    }
    catch {
        for (const line of fmText.split(/\r?\n/)) {
            const m = line.match(/^\s*-\s+(.+)\s*$/);
            if (m && fmText.includes('tags:'))
                tags.push(m[1].trim());
        }
    }
    const m = body.match(/^#\s+(.+)$/m);
    return { tags, body, titleHint: m?.[1]?.trim() ?? null };
}
function statusFromTags(tags) {
    for (const t of tags) {
        if (t.startsWith('状态/'))
            return t.slice('状态/'.length);
    }
    for (const t of tags) {
        if (t === '测试中' || t === '已验证' || t === '待开发' || t === '开发中' || t === '待验收' || t === '已验收') {
            return t;
        }
    }
    return null;
}
function isSliceDirPath(relPosix) {
    return relPosix.includes('/切片/');
}
/** 切片目录下的执行件：切片票 + 规格（均不入主图，进 sidecar）。 */
function isSliceSidecarDoc(relPosix, tags) {
    if (!isSliceDirPath(relPosix))
        return false;
    return (tags.includes('切片') ||
        tags.includes('规格') ||
        /\/[^/]+-00-规格\.md$/.test(relPosix));
}
function themeOf(relPosix) {
    const parts = relPosix.split('/');
    const iScheme = parts.indexOf('方案');
    if (iScheme >= 0 && parts[iScheme + 1] && parts[iScheme + 1] !== '切片') {
        const seg = parts[iScheme + 1];
        // `方案/方案索引.md` 是索引文件，不是主题文件夹
        if (seg.endsWith('.md'))
            return null;
        return seg;
    }
    const iTest = parts.indexOf('测试');
    if (iTest >= 0 && parts[iTest + 1]) {
        const seg = parts[iTest + 1];
        if (seg.endsWith('.md'))
            return null;
        return seg;
    }
    if (relPosix.startsWith('_archive/方案/')) {
        const p = relPosix.split('/');
        const i = p.indexOf('方案');
        if (i >= 0 && p[i + 1]) {
            const seg = p[i + 1];
            if (seg.endsWith('.md'))
                return null;
            return seg;
        }
    }
    return null;
}
/** `方案/<主题>/切片/<方案stem>/xxx.md` → 方案stem */
function schemeIdFromSlicePath(relPosix) {
    const parts = relPosix.split('/');
    const i = parts.indexOf('切片');
    if (i >= 0 && parts[i + 1])
        return parts[i + 1];
    return null;
}
function classify(relPosix, tags) {
    if (relPosix.startsWith('_archive/') || tags.includes('已归档') || tags.some((t) => t === '状态/已归档')) {
        // 归档目录里的索引仍是 index
        if (tags.includes('归档索引') ||
            tags.includes('方案索引') ||
            tags.includes('测试索引') ||
            tags.includes('规范索引') ||
            /索引\.md$/.test(relPosix)) {
            return 'index';
        }
        return 'archive';
    }
    if (tags.includes('能力底图') || /\/能力底图-/.test(`/${relPosix}`))
        return 'map';
    // 索引须先于「方案/」「测试/」路径启发，否则 方案索引/测试索引 会被当成方案/测试
    if (tags.includes('文档首页') ||
        tags.includes('归档索引') ||
        tags.includes('方案索引') ||
        tags.includes('测试索引') ||
        tags.includes('能力总览') ||
        tags.includes('运维索引') ||
        tags.includes('规范索引') ||
        /索引\.md$/.test(relPosix) ||
        relPosix === '文档首页.md') {
        return 'index';
    }
    // 规格在切片目录；若漏网到主图，不当成索引/方案
    if (tags.includes('规格') || /\/[^/]+-00-规格\.md$/.test(relPosix)) {
        return 'index';
    }
    if (tags.includes('方案') || (relPosix.startsWith('方案/') && !relPosix.includes('/切片/')))
        return 'scheme';
    if (tags.includes('测试') || relPosix.startsWith('测试/'))
        return 'test';
    if (tags.includes('规范') || relPosix.startsWith('规范/'))
        return 'norm';
    if (tags.includes('切片'))
        return 'scheme';
    return 'index';
}
function firstParagraphSummary(body) {
    const lines = body.split(/\r?\n/).map((l) => l.trim());
    for (const line of lines) {
        if (!line || line.startsWith('#') || line.startsWith('>') || line.startsWith('|') || line.startsWith('-')) {
            continue;
        }
        return line.slice(0, 120);
    }
    for (const line of lines) {
        if (line.startsWith('>')) {
            const t = line.replace(/^>\s*/, '').trim();
            if (t)
                return t.slice(0, 120);
        }
    }
    return null;
}
function resolveDocsRoot(projectRoot) {
    const base = projectRoot.replace(/[/\\]+$/, '');
    const candidates = [
        `${base}/.agents/skills/capmap-system/capmap.yaml`,
        `${base}/.claude/skills/capmap-system/capmap.yaml`,
        `${base}/skills/capmap-system/capmap.yaml`,
        `${base}/capmap.yaml`,
    ];
    for (const c of candidates) {
        if (!existsSync(c))
            continue;
        try {
            const doc = yaml.load(readFileSync(c, 'utf8'));
            const rel = doc?.docs_root?.replace(/^\.\//, '').replace(/\/$/, '');
            if (rel) {
                const abs = join(base, rel);
                if (existsSync(abs))
                    return abs;
            }
        }
        catch {
            /* try next */
        }
    }
    const fallback = join(base, 'docs');
    if (existsSync(fallback))
        return fallback;
    throw new DocsRootMissingError(projectRoot);
}
function parseCapabilities(mapId, theme, body) {
    const lines = body.split(/\r?\n/);
    let inSection = false;
    const out = [];
    for (const line of lines) {
        if (/^##\s+1[\.\s、]/.test(line) || line.includes('## 1. 能力清单')) {
            inSection = true;
            continue;
        }
        if (inSection && /^##\s+/.test(line))
            break;
        if (!inSection)
            continue;
        if (!line.trim().startsWith('|'))
            continue;
        const parts = line.split('|').slice(1, -1).map((c) => c.trim());
        if (parts.length < 2)
            continue;
        if (/^-{2,}$/.test(parts[0]) || parts[0] === '能力' || parts[0].includes('---'))
            continue;
        const nameCell = parts[0];
        const wm = nameCell.match(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/);
        out.push({
            name: nameCell,
            status: parts[1] || null,
            summary: parts[2] || null,
            mapId,
            theme,
            schemeWikilink: wm ? wm[1].trim() : null,
        });
    }
    return out;
}
function collectLinks(body) {
    const wikilinks = [];
    const mdLinks = [];
    for (const m of body.matchAll(WIKILINK_RE)) {
        wikilinks.push(m[1].trim().replace(/\\/g, '/'));
    }
    for (const m of body.matchAll(MD_LINK_RE)) {
        let target = m[2].trim().replace(/\\/g, '/');
        target = target.split('#')[0];
        mdLinks.push(target);
    }
    return { wikilinks, mdLinks };
}
function stemKey(name) {
    const base = basename(name.replace(/\\/g, '/'));
    return base.endsWith('.md') ? base.slice(0, -3) : base;
}
function parseBlockedBy(body) {
    const m = body.match(BLOCKED_BY_RE);
    if (!m)
        return [];
    const rest = m[1].trim();
    if (!rest || rest === '无' || rest.startsWith('无'))
        return [];
    const ids = [];
    for (const w of rest.matchAll(WIKILINK_RE)) {
        ids.push(stemKey(w[1].trim()));
    }
    return ids;
}
function toSlice(doc) {
    return {
        id: doc.stem,
        title: doc.title,
        status: statusFromTags(doc.tags),
        theme: themeOf(doc.relPath),
        schemeId: schemeIdFromSlicePath(doc.relPath),
        blockedBy: parseBlockedBy(doc.body),
        path: doc.relPath,
    };
}
/** 主入口：项目根 → docs_root → 图 JSON + sidecar。 */
export function parseGraph(projectRoot) {
    const docsRoot = resolveDocsRoot(projectRoot);
    const files = listMdFiles(docsRoot);
    const allDocs = [];
    for (const abs of files) {
        const rel = normalizeSlashes(relative(docsRoot, abs));
        const raw = readFileSync(abs, 'utf8');
        const { tags, body, titleHint } = parseFrontmatter(raw);
        allDocs.push({
            absPath: abs,
            relPath: rel,
            stem: stemKey(abs),
            title: titleHint ?? stemKey(abs),
            tags,
            body,
        });
    }
    // sidecar：切片/ 下的切片票与规格（含归档）
    const slices = allDocs
        .filter((d) => isSliceSidecarDoc(d.relPath, d.tags))
        .map(toSlice);
    // 主图：排除切片目录执行件（含规格）
    const kept = allDocs.filter((d) => !isSliceSidecarDoc(d.relPath, d.tags));
    const nodes = kept.map((d) => {
        const type = classify(d.relPath, d.tags);
        return {
            id: d.stem,
            title: d.title,
            type,
            status: statusFromTags(d.tags),
            path: d.relPath,
            theme: themeOf(d.relPath),
            summary: firstParagraphSummary(d.body),
            tags: d.tags,
        };
    });
    const byStem = new Map();
    const byRel = new Map();
    for (const n of nodes) {
        byStem.set(n.id, n);
        byRel.set(n.path, n);
        byRel.set(n.path.replace(/\.md$/, ''), n);
    }
    const edgeKey = new Set();
    const edges = [];
    const addEdge = (source, target, kind) => {
        if (!byStem.has(source) || !byStem.has(target))
            return;
        if (source === target)
            return;
        const k = `${kind}:${source}->${target}`;
        const k2 = `${kind}:${target}->${source}`;
        if (kind === 'wikilink') {
            if (edgeKey.has(k) || edgeKey.has(k2))
                return;
            edgeKey.add(k);
            edgeKey.add(k2);
        }
        else {
            if (edgeKey.has(k))
                return;
            edgeKey.add(k);
        }
        edges.push({ source, target, kind });
    };
    for (const d of kept) {
        const { wikilinks, mdLinks } = collectLinks(d.body);
        const seenMdStems = new Set();
        for (const md of mdLinks) {
            const relFromDoc = normalizeSlashes(join(dirname(d.relPath), md));
            const norm = relFromDoc.replace(/^\.\//, '');
            const target = byRel.get(norm) ||
                byRel.get(norm.replace(/^\.\.\//, '')) ||
                byStem.get(stemKey(md));
            if (target) {
                seenMdStems.add(target.id);
                addEdge(d.stem, target.id, 'wikilink');
            }
        }
        for (const w of wikilinks) {
            const stem = stemKey(w);
            if (seenMdStems.has(stem))
                continue;
            if (byStem.has(stem))
                addEdge(d.stem, stem, 'wikilink');
        }
    }
    for (const map of nodes.filter((n) => n.type === 'map')) {
        const theme = map.theme;
        if (!theme)
            continue;
        for (const n of nodes) {
            if (n.id === map.id)
                continue;
            if (n.theme === theme && (n.type === 'scheme' || n.type === 'test' || n.type === 'norm')) {
                addEdge(map.id, n.id, 'semantic');
            }
        }
    }
    const capabilities = [];
    for (const d of kept) {
        const node = byStem.get(d.stem);
        if (!node || node.type !== 'map')
            continue;
        capabilities.push(...parseCapabilities(node.id, node.theme, d.body));
    }
    const themes = new Set(nodes.map((n) => n.theme).filter(Boolean));
    const queries = deriveQueries(nodes, capabilities, slices, null);
    return {
        theme: themes.size === 1 ? [...themes][0] : themes.has('文档体系') ? '文档体系' : null,
        docsRoot,
        nodes,
        edges,
        capabilities,
        slices,
        queries,
    };
}
export { deriveQueries } from "./queries.js";
//# sourceMappingURL=parse.js.map