import { type ProgressFn } from './installSkills.ts';
import { type ScaffoldOptions } from './scaffold.ts';
export interface BootstrapOptions extends ScaffoldOptions {
    /** 是否执行 npx skills add，默认 true */
    installSkills?: boolean;
    /** 已有 skill 时仍强制重装，默认 false */
    forceSkills?: boolean;
    onProgress?: ProgressFn;
}
export interface BootstrapResult {
    docsRoot: string;
    skills: {
        skipped: boolean;
        ok: boolean;
        command: string;
        detail: string;
    };
    scaffold: {
        created: string[];
        skipped: string[];
    };
}
/** 安装 capmap-skills（可选）+ 初始化 docs_root 骨架。 */
export declare function bootstrapCapmap(projectRoot: string, opts?: BootstrapOptions): Promise<BootstrapResult>;
//# sourceMappingURL=bootstrap.d.ts.map