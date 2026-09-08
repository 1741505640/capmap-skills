/** 节点主色 = 类型（切片 03）。 */
export const TYPE_FILL: Record<string, string> = {
  map: '#3b82f6',
  scheme: '#22c55e',
  test: '#eab308',
  norm: '#a855f7',
  index: '#9ca3af',
  archive: '#6b7280',
  overview: '#f97316',
};

/**
 * 描边 = 生命周期状态。
 * 相邻阶段刻意拉开色相：灰(构思) → 紫(规格) → 橙(开发中) → 青(已开发) → 黄(验证) → 绿(落地)。
 */
export const STATUS_STROKE: Record<string, string> = {
  方案中: '#e2e8f0',
  已确认: '#94a3b8',
  规格中: '#818cf8',
  已拆分: '#c084fc',
  开发中: '#f97316',
  已开发: '#22d3ee',
  验证中: '#eab308',
  已验证: '#4ade80',
  落地中: '#2dd4bf',
  已落地: '#34d399',
  已归档: '#6b7280',
  测试中: '#fbbf24',
};

export const DEFAULT_FILL = '#9ca3af';
export const DEFAULT_STROKE = '#111827';

export function typeFill(type: string): string {
  return TYPE_FILL[type] ?? DEFAULT_FILL;
}

export function statusStroke(status: string | null): string {
  if (!status) return DEFAULT_STROKE;
  return STATUS_STROKE[status] ?? DEFAULT_STROKE;
}

/** Canvas `setLineDash` 段长；无虚线时返回 null。 */
export function statusDashed(status: string | null): number[] | null {
  return status === '已归档' ? [4, 3] : null;
}
