export interface ScaffoldOptions {
    /** 相对仓库根的 docs_root 名，默认 docs */
    docsRoot?: string;
    /** 默认主题 id */
    themeId?: string;
    /** 是否写 Obsidian graph.json，默认 true */
    obsidian?: boolean;
}
export interface ScaffoldResult {
    docsRoot: string;
    created: string[];
    skipped: string[];
}
/**
 * 在仓库根写入 capmap.yaml + docs 骨架（等价 capmap-init 新建，默认 docs_root=docs）。
 * 已有文件不覆盖。
 */
export declare function scaffoldCapmapVault(projectRoot: string, opts?: ScaffoldOptions): ScaffoldResult;
//# sourceMappingURL=scaffold.d.ts.map