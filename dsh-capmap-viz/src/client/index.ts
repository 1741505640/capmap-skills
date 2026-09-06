// Client 插件体：挂 `shell.overlay` 全屏浮层（CapMap Viz 入口）。
// 形态对齐 @deepseek-ai/dsh-client-ui-* 的 `apply(ctx: ClientContext)` 约定。
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';

export const name = 'capmap-viz-client';

// TODO(capmap): 填真实服务注入键（slots / host / workspace / directory-picker 契约，待 cordis_inspect 确认）。
export const inject: string[] = ['slots'];

export function apply(ctx: ClientContext): void {
  // TODO(capmap): 1) 在 sidebar/命令注册「CapMap Viz」动作；
  // 2) ctx.slots.inject('shell.overlay', ...) 挂全屏浮层（list slot，additive）；
  // 3) 项目选择复用 directory-picker + dsh-workspace 当前根；
  // 4) host.call('capmap.parse', { root }) 取图，先渲染「0 节点」桩。
  // 具体 SlotMap 键 / register 签名 / host.call 契约待 DSH 开发环境 cordis_inspect 确认（见方案 §1）。
  void ctx;
}

export default { name, inject, apply };
