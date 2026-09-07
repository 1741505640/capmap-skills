import { installCapmapSkills, skillsAlreadyPresent } from "./installSkills.js";
import { scaffoldCapmapVault } from "./scaffold.js";
/** 安装 capmap-skills（可选）+ 初始化 docs_root 骨架。 */
export async function bootstrapCapmap(projectRoot, opts = {}) {
    const root = projectRoot.replace(/[/\\]+$/, '');
    const doInstall = opts.installSkills !== false;
    const onProgress = opts.onProgress;
    let skills;
    if (doInstall) {
        const r = await installCapmapSkills(root, {
            force: opts.forceSkills,
            onProgress,
        });
        skills = {
            skipped: r.skipped,
            ok: r.ok,
            command: r.command,
            detail: r.ok
                ? r.skipped
                    ? r.stdout
                    : `Skill 安装完成（${r.method ?? 'ok'}）`
                : `Skill 安装失败 (code=${r.code}): ${r.stderr || r.stdout}`.slice(0, 4000),
        };
    }
    else {
        onProgress?.('跳过 Skill 安装');
        skills = {
            skipped: true,
            ok: true,
            command: '',
            detail: '未请求安装 Skill',
        };
    }
    onProgress?.('写入文档骨架（capmap.yaml + docs_root）…');
    const scaffold = scaffoldCapmapVault(root, {
        docsRoot: opts.docsRoot,
        themeId: opts.themeId,
        obsidian: opts.obsidian,
    });
    onProgress?.(null, `骨架完成：新建 ${scaffold.created.length}，跳过 ${scaffold.skipped.length}`);
    if (doInstall && !skillsAlreadyPresent(root)) {
        skills = {
            ...skills,
            ok: false,
            detail: [
                skills.detail,
                '文档骨架已写入，但未检测到 .agents/skills/capmap-system/SKILL.md。',
                '请检查网络/git/npx，或手动执行安装命令后重试。',
            ]
                .filter(Boolean)
                .join('\n'),
        };
    }
    return {
        docsRoot: scaffold.docsRoot,
        skills,
        scaffold: { created: scaffold.created, skipped: scaffold.skipped },
    };
}
//# sourceMappingURL=bootstrap.js.map