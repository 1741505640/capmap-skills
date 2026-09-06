/** 图谱纯函数（Cordis-free），供 canvas 与单测共用。 */

export interface GraphEdge {
  source: string;
  target: string;
  kind: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Camera {
  x: number;
  y: number;
  k: number;
}

export const NODE_RADIUS = 10;
export const NODE_RADIUS_SELECTED = 13;

/** 当前可见边种类上的 1-hop（含自身）。 */
export function oneHop(
  id: string,
  edges: readonly GraphEdge[],
  kinds?: ReadonlySet<string>,
): Set<string> {
  const out = new Set<string>([id]);
  for (const e of edges) {
    if (kinds && !kinds.has(e.kind)) continue;
    if (e.source === id) out.add(e.target);
    else if (e.target === id) out.add(e.source);
  }
  return out;
}

/** 度数：与 id 相连的可见边条数（自环不计）。 */
export function degree(
  id: string,
  edges: readonly GraphEdge[],
  kinds?: ReadonlySet<string>,
): number {
  let n = 0;
  for (const e of edges) {
    if (kinds && !kinds.has(e.kind)) continue;
    if (e.source === e.target) continue;
    if (e.source === id || e.target === id) n += 1;
  }
  return n;
}

export function worldToScreen(cam: Camera, x: number, y: number): Point {
  return { x: x * cam.k + cam.x, y: y * cam.k + cam.y };
}

export function screenToWorld(cam: Camera, x: number, y: number): Point {
  return { x: (x - cam.x) / cam.k, y: (y - cam.y) / cam.k };
}

export function hitNode(
  nodes: ReadonlyArray<{ id: string }>,
  positions: Readonly<Record<string, Point>>,
  worldX: number,
  worldY: number,
  radius: number,
): string | null {
  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const id = nodes[i].id;
    const p = positions[id];
    if (!p) continue;
    const dx = p.x - worldX;
    const dy = p.y - worldY;
    if (dx * dx + dy * dy <= radius * radius) return id;
  }
  return null;
}

/** 把节点包围盒映射进视口（保留 padding）。无节点时回退单位相机。 */
export function fitTransform(
  points: readonly Point[],
  viewW: number,
  viewH: number,
  padding = 48,
): Camera {
  if (points.length === 0 || viewW <= 0 || viewH <= 0) {
    return { x: 0, y: 0, k: 1 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const bw = Math.max(maxX - minX, 40);
  const bh = Math.max(maxY - minY, 40);
  const innerW = Math.max(viewW - padding * 2, 1);
  const innerH = Math.max(viewH - padding * 2, 1);
  const k = Math.min(innerW / bw, innerH / bh, 8);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return { k, x: viewW / 2 - cx * k, y: viewH / 2 - cy * k };
}

export function clampZoom(k: number): number {
  return Math.min(8, Math.max(0.2, k));
}

/** 绕屏幕点缩放：保持该点下的世界坐标不变。 */
export function zoomAt(cam: Camera, screenX: number, screenY: number, nextK: number): Camera {
  const k = clampZoom(nextK);
  const w = screenToWorld(cam, screenX, screenY);
  return { k, x: screenX - w.x * k, y: screenY - w.y * k };
}
