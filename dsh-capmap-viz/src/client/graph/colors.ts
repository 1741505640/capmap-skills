/** 节点主色 = 类型（切片 03）。 */
export const TYPE_FILL: Record<string, string> = {
  map: '#3b82f6',
  scheme: '#22c55e',
  test: '#eab308',
  norm: '#a855f7',
  index: '#9ca3af',
  archive: '#6b7280',
};

/** 描边 = 生命周期状态。无状态时用深色描边。 */
export const STATUS_STROKE: Record<string, string> = {
  方案中: '#9ca3af',
  已确认: '#94a3b8',
  规格中: '#818cf8',
  已拆分: '#a78bfa',
  开发中: '#3b82f6',
  已开发: '#0ea5e9',
  验证中: '#f59e0b',
  已验证: '#22c55e',
  落地中: '#14b8a6',
  已落地: '#10b981',
  已归档: '#6b7280',
  测试中: '#f59e0b',
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

export function statusDashed(status: string | null): boolean {
  return status === '已归档';
}
