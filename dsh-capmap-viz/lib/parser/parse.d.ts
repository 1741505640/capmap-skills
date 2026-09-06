import type { CapMapGraph, Capability, NodeType } from './types.ts';
/** 解析输入：一个 md 文件的相对路径 + 文本。 */
export interface FileInput {
    /** 相对 docs_root 的路径（可含反斜杠，内部归一化）。 */
    path: string;
    content: string;
}
/** 去掉围栏与行内代码，避免示例里的 `[[..]]` / 表格误入。 */
export declare function stripCode(text: string): string;
/** 极简 YAML 子集：解析 `tags:` 块列表/行内列表及其它标量键。 */
export declare function parseFrontMatter(text: string): {
    data: Record<string, unknown>;
    body: string;
};
export declare function tagsOf(data: Record<string, unknown>): string[];
/** 提取 `[[..]]` 目标 stem（去别名、去路径、去 .md）。 */
export declare function parseWikilinks(text: string): string[];
/** 节点分型；返回 null 表示不建节点（活跃区切片/规格执行票）。 */
export declare function classifyNode(path: string): NodeType | null;
export declare function themeOf(path: string): string | null;
export declare function statusOf(tags: string[]): string | null;
export declare function volumeOf(tags: string[]): '小' | '大' | null;
export declare function extractTitle(body: string): string;
export declare function extractSummary(body: string): string | null;
/** 能力底图 §1 能力清单表 → capabilities。 */
export declare function parseCapabilities(body: string): Capability[];
/** 主入口：一组文件 → 图 JSON。 */
export declare function parseGraph(files: FileInput[]): CapMapGraph;
//# sourceMappingURL=parse.d.ts.map