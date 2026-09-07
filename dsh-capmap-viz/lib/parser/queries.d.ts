/**
 * 活看板三条查询（纯函数）：frontier / 验证门 / §1 vs Tag。
 * 切片不入主图；结果只读 frontmatter + §1 + Blocked by。
 */
import type { CapMapCapability, CapMapNode, CapMapQueries, CapMapQueryRow, CapMapSlice } from './types.ts';
export declare function stripStatusPrefix(raw: string | null | undefined): string | null;
/** 将能力名对齐到唯一方案；失败返回 null（无法对齐）。 */
export declare function alignCapabilityToScheme(cap: CapMapCapability, schemes: readonly CapMapNode[]): CapMapNode | null;
export declare function deriveFrontier(slices: readonly CapMapSlice[], themeFilter?: string | null): CapMapQueryRow[];
/**
 * 验证门真卡住：
 * - 方案 已开发/验证中 且无 已验证 测试文
 * - 方案 已验证 而关联测试仍 测试中
 * - 方案 落地中/已落地 跳步：仅展示（无已验证测试也报）
 * - 方案 开发中 + 无测试 = 未到点，不报
 */
export declare function deriveValidationGate(nodes: readonly CapMapNode[], themeFilter?: string | null): CapMapQueryRow[];
export declare function deriveSection1Fight(capabilities: readonly CapMapCapability[], nodes: readonly CapMapNode[], themeFilter?: string | null): CapMapQueryRow[];
export declare function deriveQueries(nodes: readonly CapMapNode[], capabilities: readonly CapMapCapability[], slices: readonly CapMapSlice[], themeFilter?: string | null): CapMapQueries;
//# sourceMappingURL=queries.d.ts.map