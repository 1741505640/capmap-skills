/** 节点类型：内部英文码 ↔ 中文展示。 */
export const TYPE_LABELS: Record<string, string> = {
  map: '底图',
  scheme: '方案',
  test: '测试',
  norm: '规范',
  index: '索引',
  archive: '归档',
  slice: '切片',
};

export const TYPE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: '全部', label: '全部' },
  { value: 'map', label: '底图' },
  { value: 'scheme', label: '方案' },
  { value: 'test', label: '测试' },
  { value: 'norm', label: '规范' },
  { value: 'index', label: '索引' },
  { value: 'archive', label: '归档' },
];

export function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}
