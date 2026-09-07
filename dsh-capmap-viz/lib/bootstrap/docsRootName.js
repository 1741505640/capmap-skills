/** 从工作区名推导默认 docs_root：`<名称>-docs`。 */
export function defaultDocsRootName(workspaceName, projectRoot) {
    const fromName = workspaceName?.trim();
    const fromPath = projectRoot
        ?.replace(/[/\\]+$/, '')
        .split(/[/\\]/)
        .filter(Boolean)
        .pop();
    const raw = (fromName || fromPath || 'project').trim();
    const safe = raw
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    const base = safe || 'project';
    return base.toLowerCase().endsWith('-docs') ? base : `${base}-docs`;
}
//# sourceMappingURL=docsRootName.js.map