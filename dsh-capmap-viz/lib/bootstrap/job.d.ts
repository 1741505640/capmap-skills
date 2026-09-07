import type { BootstrapOptions, BootstrapResult } from './bootstrap.ts';
export type BootstrapJobState = 'running' | 'done' | 'error';
export interface BootstrapJobSnapshot {
    jobId: string;
    state: BootstrapJobState;
    phase: string;
    logs: string[];
    startedAt: number;
    updatedAt: number;
    result?: BootstrapResult;
    error?: string;
}
/** 立即返回 jobId，后台跑安装+骨架；Client 轮询 bootstrapStatus。 */
export declare function startBootstrapJob(projectRoot: string, opts?: BootstrapOptions): {
    jobId: string;
};
export declare function getBootstrapJob(jobId: string): BootstrapJobSnapshot | null;
/** 防止无限堆积：超过 1h 的已结束任务清掉。 */
export declare function pruneBootstrapJobs(maxAgeMs?: number): void;
//# sourceMappingURL=job.d.ts.map