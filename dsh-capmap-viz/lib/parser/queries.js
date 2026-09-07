export function stripStatusPrefix(raw) {
    if (raw == null || raw === '')
        return null;
    const t = raw.trim();
    return t.startsWith('状态/') ? t.slice('状态/'.length) : t;
}
function themeMatch(theme, filter) {
    if (!filter || filter === '全部')
        return true;
    return theme === filter;
}
/** 将能力名对齐到唯一方案；失败返回 null（无法对齐）。 */
export function alignCapabilityToScheme(cap, schemes) {
    const inTheme = schemes.filter((s) => themeMatch(s.theme, cap.theme));
    if (cap.schemeWikilink) {
        const stem = cap.schemeWikilink.replace(/\.md$/i, '');
        const hit = inTheme.find((s) => s.id === stem) ?? schemes.find((s) => s.id === stem);
        return hit ?? null;
    }
    const name = cap.name.replace(/\[\[|\]\]/g, '').trim();
    const norm = (s) => s.replace(/[（）()【】\[\]\s·\-—_/]/g, '').toLowerCase();
    const nameN = norm(name);
    const pool = inTheme.length ? inTheme : schemes;
    const exact = pool.filter((s) => s.title === name || s.id === name || norm(s.title) === nameN);
    if (exact.length === 1)
        return exact[0];
    if (exact.length > 1)
        return null;
    const contains = pool.filter((s) => {
        const t = norm(s.title);
        const id = norm(s.id);
        return (t.includes(nameN) ||
            nameN.includes(t) ||
            id.includes(nameN) ||
            nameN.includes(id) ||
            s.title.includes(name) ||
            name.includes(s.title));
    });
    if (contains.length === 1)
        return contains[0];
    return null;
}
export function deriveFrontier(slices, themeFilter = null) {
    const byId = new Map(slices.map((s) => [s.id, s]));
    const out = [];
    for (const s of slices) {
        if (!themeMatch(s.theme, themeFilter))
            continue;
        if (stripStatusPrefix(s.status) !== '待开发')
            continue;
        const depsOk = (s.blockedBy ?? []).every((dep) => {
            const d = byId.get(dep);
            return d != null && stripStatusPrefix(d.status) === '已验收';
        });
        if (!depsOk)
            continue;
        out.push({
            kind: 'frontier',
            id: `frontier:${s.id}`,
            label: s.title,
            schemeId: s.schemeId,
            detail: (s.blockedBy ?? []).length ? `Blocked by: ${s.blockedBy.join(', ')}` : '无依赖',
        });
    }
    return out;
}
/**
 * 验证门真卡住：
 * - 方案 已开发/验证中 且无 已验证 测试文
 * - 方案 已验证 而关联测试仍 测试中
 * - 方案 落地中/已落地 跳步：仅展示（无已验证测试也报）
 * - 方案 开发中 + 无测试 = 未到点，不报
 */
export function deriveValidationGate(nodes, themeFilter = null) {
    const schemes = nodes.filter((n) => n.type === 'scheme' && themeMatch(n.theme, themeFilter));
    const tests = nodes.filter((n) => n.type === 'test');
    const out = [];
    for (const scheme of schemes) {
        const st = stripStatusPrefix(scheme.status);
        if (!st)
            continue;
        if (st === '开发中' || st === '方案中' || st === '已确认' || st === '规格中' || st === '已拆分') {
            continue; // 未到验证点
        }
        const linked = tests.filter((t) => {
            if (!themeMatch(t.theme, themeFilter === '全部' ? null : themeFilter ?? scheme.theme)) {
                // 同主题回退
            }
            // 优先：测试摘要/标题含方案 id，或同主题
            const sameTheme = t.theme && scheme.theme && t.theme === scheme.theme;
            const mentions = (t.summary && t.summary.includes(scheme.id)) ||
                t.title.includes(scheme.title) ||
                t.id.includes(scheme.id);
            return Boolean(sameTheme || mentions);
        });
        const verified = linked.filter((t) => stripStatusPrefix(t.status) === '已验证');
        const testing = linked.filter((t) => stripStatusPrefix(t.status) === '测试中');
        if (st === '已开发' || st === '验证中') {
            if (verified.length === 0) {
                out.push({
                    kind: 'validation_gate',
                    id: `gate:${scheme.id}:no-verified`,
                    label: scheme.title,
                    schemeId: scheme.id,
                    detail: linked.length
                        ? `状态 ${st}，关联测试无「已验证」`
                        : `状态 ${st}，无关联测试文`,
                    schemeStatus: st,
                });
            }
        }
        else if (st === '已验证') {
            if (testing.length > 0 && verified.length === 0) {
                out.push({
                    kind: 'validation_gate',
                    id: `gate:${scheme.id}:test-lag`,
                    label: scheme.title,
                    schemeId: scheme.id,
                    detail: `方案已验证，测试文仍「测试中」`,
                    schemeStatus: st,
                });
            }
        }
        else if (st === '落地中' || st === '已落地') {
            if (verified.length === 0) {
                out.push({
                    kind: 'validation_gate',
                    id: `gate:${scheme.id}:skip`,
                    label: scheme.title,
                    schemeId: scheme.id,
                    detail: `跳步至 ${st}（无已验证测试，仅展示）`,
                    schemeStatus: st,
                });
            }
        }
    }
    return out;
}
export function deriveSection1Fight(capabilities, nodes, themeFilter = null) {
    const schemes = nodes.filter((n) => n.type === 'scheme');
    const out = [];
    for (const cap of capabilities) {
        if (!themeMatch(cap.theme, themeFilter))
            continue;
        const scheme = alignCapabilityToScheme(cap, schemes);
        if (!scheme)
            continue; // 无法对齐：不进打架、不单列
        if (!themeMatch(scheme.theme, themeFilter))
            continue;
        const left = stripStatusPrefix(cap.status);
        const right = stripStatusPrefix(scheme.status);
        if (left == null || right == null)
            continue;
        if (left === right)
            continue;
        out.push({
            kind: 'section1_fight',
            id: `fight:${cap.mapId ?? 'map'}:${cap.name}:${scheme.id}`,
            label: cap.name.replace(/\[\[([^\]]+)\]\]/g, '$1'),
            schemeId: scheme.id,
            mapId: cap.mapId,
            detail: `§1「${left}」vs Tag「${right}」`,
            section1Status: left,
            schemeStatus: right,
        });
    }
    return out;
}
export function deriveQueries(nodes, capabilities, slices, themeFilter = null) {
    return {
        frontier: deriveFrontier(slices, themeFilter),
        validationGate: deriveValidationGate(nodes, themeFilter),
        section1Fight: deriveSection1Fight(capabilities, nodes, themeFilter),
    };
}
//# sourceMappingURL=queries.js.map