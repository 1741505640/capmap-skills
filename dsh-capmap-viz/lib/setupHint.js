/** CapMap 插件与 capmap-skills 强关联：缺 docs_root 时的安装/初始化指引。 */
export const DOCS_ROOT_MISSING_CODE = 'docs_root_missing';
/** 在业务仓根目录执行，安装全部 capmap-* skill 到 `.agents/skills/`。 */
export const CAPMAP_SKILL_INSTALL_CMD = "npx skills add 1741505640/capmap-skills --skill '*' -y";
/** 对 Agent 说的开干指令（触发 capmap-init）。 */
export const CAPMAP_INIT_PROMPT = '按 capmap-init 初始化文档目录';
export function formatDocsRootMissingMessage(projectRoot) {
    return [
        `未找到 docs_root：工作区「${projectRoot}」尚未配置 CapMap 文档体系。`,
        '',
        '本插件依赖 capmap-skills。请在该仓库根目录：',
        `1. 安装 Skill：${CAPMAP_SKILL_INSTALL_CMD}`,
        `2. 对 Agent 说：${CAPMAP_INIT_PROMPT}`,
        '',
        '完成后再打开本面板。',
    ].join('\n');
}
export function isDocsRootMissingCode(code) {
    return code === DOCS_ROOT_MISSING_CODE;
}
export function isDocsRootMissingMessage(message) {
    if (!message)
        return false;
    return (message.includes('未找到 docs_root') ||
        message.includes('docs_root_missing') ||
        /capmap\.parse:\s*未找到 docs_root/.test(message));
}
//# sourceMappingURL=setupHint.js.map