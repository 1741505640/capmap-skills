import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CAPMAP_SKILL_INSTALL_CMD } from "../setupHint.js";
const GITHUB_REPO = 'https://github.com/1741505640/capmap-skills.git';
/** 真正装好 skill：目录里有 SKILL.md（仅有 capmap.yaml 不算）。 */
export function skillsAlreadyPresent(projectRoot) {
    const base = projectRoot.replace(/[/\\]+$/, '');
    const candidates = [
        join(base, '.agents', 'skills', 'capmap-system', 'SKILL.md'),
        join(base, '.claude', 'skills', 'capmap-system', 'SKILL.md'),
    ];
    return candidates.some((p) => existsSync(p));
}
function escapeWinArg(s) {
    if (!/[\s"]/g.test(s))
        return s;
    return `"${s.replace(/"/g, '\\"')}"`;
}
/**
 * 跑子进程并捕获输出。
 * Windows：`npx.cmd` + shell:false 会 spawn EINVAL；改用 cmd.exe /c 整行命令。
 */
function runCapture(command, args, cwd, timeoutMs, onChunk) {
    return new Promise((resolve) => {
        const isWin = process.platform === 'win32';
        const child = isWin
            ? spawn(`${escapeWinArg(command)} ${args.map(escapeWinArg).join(' ')}`, {
                cwd,
                shell: true,
                env: { ...process.env, npm_config_yes: 'true', CI: '1' },
                windowsHide: true,
            })
            : spawn(command, args, {
                cwd,
                shell: false,
                env: { ...process.env, npm_config_yes: 'true', CI: '1' },
                windowsHide: true,
            });
        let stdout = '';
        let stderr = '';
        let outBuf = '';
        let errBuf = '';
        const flushLines = (kind, chunk) => {
            const buf = kind === 'out' ? (outBuf += chunk) : (errBuf += chunk);
            const parts = buf.split(/\r?\n/);
            if (kind === 'out')
                outBuf = parts.pop() ?? '';
            else
                errBuf = parts.pop() ?? '';
            for (const line of parts) {
                if (line.trim())
                    onChunk?.(kind, line);
            }
        };
        const timer = setTimeout(() => {
            child.kill();
            resolve({
                code: null,
                stdout,
                stderr: `${stderr}\n[timeout ${timeoutMs}ms]`.trim(),
            });
        }, timeoutMs);
        child.stdout?.on('data', (buf) => {
            const t = buf.toString('utf8');
            stdout += t;
            flushLines('out', t);
        });
        child.stderr?.on('data', (buf) => {
            const t = buf.toString('utf8');
            stderr += t;
            flushLines('err', t);
        });
        child.on('error', (err) => {
            clearTimeout(timer);
            resolve({ code: null, stdout, stderr: String(err) });
        });
        child.on('close', (code) => {
            clearTimeout(timer);
            if (outBuf.trim())
                onChunk?.('out', outBuf);
            if (errBuf.trim())
                onChunk?.('err', errBuf);
            resolve({ code, stdout, stderr });
        });
    });
}
async function installByGitSparse(projectRoot, timeoutMs, onProgress) {
    const cwd = projectRoot.replace(/[/\\]+$/, '');
    const tmp = mkdtempSync(join(tmpdir(), 'capmap-skills-'));
    const log = [];
    const note = (line) => {
        log.push(line);
        onProgress?.(null, line);
    };
    try {
        onProgress?.('git clone capmap-skills（sparse）…');
        note(`git clone ${GITHUB_REPO}`);
        const clone = await runCapture('git', ['clone', '--depth', '1', '--filter=blob:none', '--sparse', GITHUB_REPO, tmp], cwd, timeoutMs, (_s, line) => onProgress?.(null, `[git] ${line}`));
        note(`git clone → code=${clone.code}`);
        if (clone.code !== 0) {
            return {
                skipped: false,
                ok: false,
                command: `git clone ${GITHUB_REPO}`,
                stdout: log.join('\n'),
                stderr: clone.stderr || clone.stdout,
                code: clone.code,
                method: 'git-sparse',
            };
        }
        onProgress?.('git sparse-checkout set skills…');
        const sparse = await runCapture('git', ['sparse-checkout', 'set', 'skills'], tmp, timeoutMs, (_s, line) => onProgress?.(null, `[git] ${line}`));
        note(`sparse-checkout → code=${sparse.code}`);
        if (sparse.code !== 0) {
            return {
                skipped: false,
                ok: false,
                command: 'git sparse-checkout set skills',
                stdout: log.join('\n'),
                stderr: sparse.stderr || sparse.stdout,
                code: sparse.code,
                method: 'git-sparse',
            };
        }
        const skillsSrc = join(tmp, 'skills');
        if (!existsSync(skillsSrc)) {
            return {
                skipped: false,
                ok: false,
                command: 'git sparse-checkout',
                stdout: log.join('\n'),
                stderr: 'clone 后未找到 skills/ 目录',
                code: 1,
                method: 'git-sparse',
            };
        }
        onProgress?.('复制 skills/capmap-* → .agents/skills/…');
        const dest = join(cwd, '.agents', 'skills');
        mkdirSync(dest, { recursive: true });
        let copied = 0;
        for (const name of readdirSync(skillsSrc)) {
            if (!name.startsWith('capmap-'))
                continue;
            const from = join(skillsSrc, name);
            const to = join(dest, name);
            cpSync(from, to, { recursive: true });
            copied += 1;
            note(`copied ${name}`);
        }
        const ok = skillsAlreadyPresent(cwd) && copied > 0;
        return {
            skipped: false,
            ok,
            command: `git sparse clone → .agents/skills (${copied} dirs)`,
            stdout: log.join('\n'),
            stderr: ok ? '' : '复制后仍未检测到 capmap-system/SKILL.md',
            code: ok ? 0 : 1,
            method: 'git-sparse',
        };
    }
    finally {
        try {
            rmSync(tmp, { recursive: true, force: true });
        }
        catch {
            /* ignore */
        }
    }
}
async function installByNpxSkills(projectRoot, timeoutMs, onProgress) {
    const cwd = projectRoot.replace(/[/\\]+$/, '');
    const args = [
        '--yes',
        'skills',
        'add',
        '1741505640/capmap-skills',
        '--skill',
        '*',
        '-y',
    ];
    onProgress?.('npx skills add …（可能较慢）');
    onProgress?.(null, CAPMAP_SKILL_INSTALL_CMD);
    const r = await runCapture('npx', args, cwd, timeoutMs, (_s, line) => onProgress?.(null, `[npx] ${line}`));
    const ok = r.code === 0 && skillsAlreadyPresent(cwd);
    return {
        skipped: false,
        ok,
        command: CAPMAP_SKILL_INSTALL_CMD,
        stdout: r.stdout,
        stderr: ok
            ? r.stderr
            : `${r.stderr}\n(npx 退出码 ${r.code}；SKILL.md 检测=${skillsAlreadyPresent(cwd)})`.trim(),
        code: r.code,
        method: 'npx-skills',
    };
}
/**
 * 安装 capmap-* skills 到 `.agents/skills/`。
 * 1) 已有 SKILL.md → 跳过
 * 2) 先试 npx skills add
 * 3) 失败则 git sparse clone 回退
 */
export async function installCapmapSkills(projectRoot, opts) {
    const cwd = projectRoot.replace(/[/\\]+$/, '');
    const timeoutMs = opts?.timeoutMs ?? 300_000;
    const onProgress = opts?.onProgress;
    if (!opts?.force && skillsAlreadyPresent(cwd)) {
        onProgress?.('已检测到 Skill，跳过安装');
        return {
            skipped: true,
            ok: true,
            command: CAPMAP_SKILL_INSTALL_CMD,
            stdout: '已检测到 .agents/skills/capmap-system/SKILL.md，跳过安装',
            stderr: '',
            code: 0,
            method: 'skipped',
        };
    }
    const viaNpx = await installByNpxSkills(cwd, timeoutMs, onProgress);
    if (viaNpx.ok) {
        onProgress?.('npx 安装成功');
        return viaNpx;
    }
    onProgress?.(null, 'npx 未成功，尝试 git 回退…');
    onProgress?.(null, viaNpx.stderr.slice(0, 500));
    const viaGit = await installByGitSparse(cwd, timeoutMs, onProgress);
    if (viaGit.ok) {
        onProgress?.('git 回退安装成功');
        return {
            ...viaGit,
            stdout: `npx 未成功，已用 git 回退：\n${viaNpx.stderr}\n---\n${viaGit.stdout}`,
        };
    }
    return {
        skipped: false,
        ok: false,
        command: `${viaNpx.command} || git sparse`,
        stdout: [viaNpx.stdout, viaGit.stdout].filter(Boolean).join('\n---\n'),
        stderr: [
            'Skill 安装失败（npx 与 git 均未成功）。',
            `npx: ${viaNpx.stderr}`,
            `git: ${viaGit.stderr}`,
            '请确认本机有 Node/npx 与 git，网络可访问 GitHub。',
        ].join('\n'),
        code: viaGit.code ?? viaNpx.code,
        method: 'git-sparse',
    };
}
//# sourceMappingURL=installSkills.js.map