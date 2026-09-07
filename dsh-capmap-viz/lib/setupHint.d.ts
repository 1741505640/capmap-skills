/** CapMap 插件与 capmap-skills 强关联：缺 docs_root 时的安装/初始化指引。 */
export declare const DOCS_ROOT_MISSING_CODE = "docs_root_missing";
/** 在业务仓根目录执行，安装全部 capmap-* skill 到 `.agents/skills/`。 */
export declare const CAPMAP_SKILL_INSTALL_CMD = "npx skills add 1741505640/capmap-skills --skill '*' -y";
/** 对 Agent 说的开干指令（触发 capmap-init）。 */
export declare const CAPMAP_INIT_PROMPT = "\u6309 capmap-init \u521D\u59CB\u5316\u6587\u6863\u76EE\u5F55";
export declare function formatDocsRootMissingMessage(projectRoot: string): string;
export declare function isDocsRootMissingCode(code: string | undefined | null): boolean;
export declare function isDocsRootMissingMessage(message: string | undefined | null): boolean;
//# sourceMappingURL=setupHint.d.ts.map