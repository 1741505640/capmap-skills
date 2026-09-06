// Client 半：把 CapMap Viz 全屏浮层挂进 `shell.overlay`（additive list slot）。
// 形态对齐 dshmarket / dsh-client-ui-directory-picker-browse 的 `apply(ctx)` 约定。
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { CapMapOverlay } from './CapMapOverlay.tsx';

export const name = 'capmap-viz-client';
export const inject: string[] = ['slots', 'connection'];

/** RPC 通道名（与 Host 半 `src/index.ts` 保持一致）。 */
export const CAPMAP_RPC_CHANNEL = '/capmap';

export function apply(ctx: ClientContext): void {
  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      {
        name: 'shell.overlay',
        id: 'capmap-viz-overlay',
        label: () => 'CapMap Viz',
        inject: () => ({
          call: (endpoint: string, payload: unknown) =>
            ctx.connection.rpc.call(CAPMAP_RPC_CHANNEL, endpoint, payload),
        }),
      },
      CapMapOverlay,
    ),
  );
}

export default { name, inject, apply };
