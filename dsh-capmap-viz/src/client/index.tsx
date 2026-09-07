import type { Context } from '@deepseek-ai/cordis'
import { CapMapPanelController } from './panel-controller.ts'
import { mountPanel } from './panel-mount.tsx'
import { mountSidebarEntry } from './sidebar-entry.ts'
import { ensureCapMapStyles } from './styles.ts'

/** 与 Host 半对齐的泛用 RPC 通道。 */
export const CAPMAP_RPC_CHANNEL = '/capmap'

export const inject = ['connection', 'workspaces']

let claimed = false

export function apply(ctx: Context): void {
  // 重复 inject 时只挂一次（HMR / 双加载防护）
  if (claimed) return
  claimed = true

  try {
    ensureCapMapStyles()
  } catch (error) {
    console.error('[dsh-capmap-viz] styles failed', error)
  }

  const controller = new CapMapPanelController()
  const call = (endpoint: string, payload: unknown) =>
    ctx.connection.rpc.call(CAPMAP_RPC_CHANNEL, endpoint, payload)

  const disposers: Array<() => void> = []
  try {
    disposers.push(mountSidebarEntry(controller))
    disposers.push(
      mountPanel(controller, {
        call,
        workspaces: ctx.workspaces,
      }),
    )
  } catch (error) {
    console.error('[dsh-capmap-viz] mount failed', error)
  }

  ctx.effect(() => {
    return () => {
      for (const dispose of disposers.splice(0)) dispose()
      claimed = false
    }
  }, 'capmap-viz: mount')
}
