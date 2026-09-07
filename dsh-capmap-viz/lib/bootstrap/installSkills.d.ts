export type ProgressFn = (phase: string | null, line?: string) => void;
/** 真正装好 skill：目录里有 SKILL.md（仅有 capmap.yaml 不算）。 */
export declare function skillsAlreadyPresent(projectRoot: string): boolean;
export interface InstallSkillsResult {
    skipped: boolean;
    ok: boolean;
    command: string;
    stdout: string;
    stderr: string;
    code: number | null;
    method?: 'npx-skills' | 'git-sparse' | 'skipped';
}
/**
 * 安装 capmap-* skills 到 `.agents/skills/`。
 * 1) 已有 SKILL.md → 跳过
 * 2) 先试 npx skills add
 * 3) 失败则 git sparse clone 回退
 */
export declare function installCapmapSkills(projectRoot: string, opts?: {
    force?: boolean;
    timeoutMs?: number;
    onProgress?: ProgressFn;
}): Promise<InstallSkillsResult>;
//# sourceMappingURL=installSkills.d.ts.map