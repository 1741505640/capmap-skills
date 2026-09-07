import { Context, Service } from '@deepseek-ai/cordis';
/** 泛用 Connection RPC 通道（单段名）。 */
export declare const CAPMAP_RPC_CHANNEL = "/capmap";
/**
 * Host 半：CapMapService。
 * Client：parse | watch | revision | read | bootstrap | bootstrapStatus
 */
export declare class CapMapService extends Service {
    static inject: string[];
    private readonly watches;
    constructor(ctx: Context);
    parse(projectRoot: string): Promise<import("./parser/types.ts").CapMapGraph>;
    /**
     * 启动后台初始化（立即返回 jobId）。
     * 勿在单次 RPC 里同步跑完 npx——会拖死连接导致 Failed to fetch。
     */
    bootstrapStart(projectRoot: string, opts?: {
        docsRoot?: string;
        themeId?: string;
        installSkills?: boolean;
        forceSkills?: boolean;
        obsidian?: boolean;
    }): {
        jobId: string;
    };
    bootstrapStatus(jobId: string): import("./bootstrap/job.ts").BootstrapJobSnapshot;
    watchStart(projectRoot: string): {
        revision: number;
        docsRoot: string;
    };
    watchStop(projectRoot: string): {
        stopped: false;
    } | {
        stopped: true;
    };
    revision(projectRoot: string): {
        revision: number;
    };
    read(projectRoot: string, relPath: string): {
        path: string;
        text: string;
    };
    private handleRpc;
}
export declare const name = "capmap-viz";
export default CapMapService;
//# sourceMappingURL=index.d.ts.map