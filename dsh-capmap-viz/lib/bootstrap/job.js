import { randomUUID } from 'node:crypto';
import { bootstrapCapmap } from "./bootstrap.js";
const jobs = new Map();
const MAX_LOGS = 200;
function pushLog(job, line) {
    const text = line.replace(/\r/g, '').trimEnd();
    if (!text)
        return;
    for (const part of text.split('\n')) {
        const p = part.trimEnd();
        if (!p)
            continue;
        job.logs.push(p);
        if (job.logs.length > MAX_LOGS)
            job.logs.splice(0, job.logs.length - MAX_LOGS);
    }
    job.updatedAt = Date.now();
}
function setPhase(job, phase) {
    job.phase = phase;
    job.updatedAt = Date.now();
    pushLog(job, `→ ${phase}`);
}
/** 立即返回 jobId，后台跑安装+骨架；Client 轮询 bootstrapStatus。 */
export function startBootstrapJob(projectRoot, opts = {}) {
    const jobId = randomUUID();
    const job = {
        jobId,
        state: 'running',
        phase: '排队中',
        logs: [],
        startedAt: Date.now(),
        updatedAt: Date.now(),
    };
    jobs.set(jobId, job);
    pushLog(job, `任务已创建 jobId=${jobId}`);
    pushLog(job, `工作区: ${projectRoot}`);
    pushLog(job, `docs_root: ${opts.docsRoot ?? '(默认)'}; installSkills=${opts.installSkills !== false}`);
    void (async () => {
        try {
            setPhase(job, opts.installSkills === false ? '写入文档骨架…' : '开始安装 Skill…');
            const result = await bootstrapCapmap(projectRoot, {
                ...opts,
                onProgress: (phase, line) => {
                    if (phase)
                        setPhase(job, phase);
                    if (line)
                        pushLog(job, line);
                },
            });
            job.result = result;
            if (opts.installSkills !== false && !result.skills.ok) {
                job.state = 'error';
                job.error = result.skills.detail;
                setPhase(job, 'Skill 安装失败（骨架可能已写入）');
                pushLog(job, result.skills.detail);
                return;
            }
            job.state = 'done';
            setPhase(job, '完成');
            pushLog(job, `骨架: 新建 ${result.scaffold.created.length}，跳过 ${result.scaffold.skipped.length}`);
            pushLog(job, `Skill: ${result.skills.detail}`);
        }
        catch (err) {
            job.state = 'error';
            job.error = err instanceof Error ? err.message : String(err);
            setPhase(job, '失败');
            pushLog(job, job.error);
        }
    })();
    return { jobId };
}
export function getBootstrapJob(jobId) {
    const job = jobs.get(jobId);
    if (!job)
        return null;
    return {
        jobId: job.jobId,
        state: job.state,
        phase: job.phase,
        logs: [...job.logs],
        startedAt: job.startedAt,
        updatedAt: job.updatedAt,
        result: job.result,
        error: job.error,
    };
}
/** 防止无限堆积：超过 1h 的已结束任务清掉。 */
export function pruneBootstrapJobs(maxAgeMs = 3_600_000) {
    const now = Date.now();
    for (const [id, job] of jobs) {
        if (job.state === 'running')
            continue;
        if (now - job.updatedAt > maxAgeMs)
            jobs.delete(id);
    }
}
//# sourceMappingURL=job.js.map