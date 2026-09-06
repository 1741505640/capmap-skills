// 包级 invariant 伴生插件：向 `ctx.invariants` 注册本包的运行时不变式检查。
// 形态对齐 @deepseek-ai/dsh-host-directory-picker/invariant。
import type { Context } from '@deepseek-ai/cordis';
// 侧效 import：把 ctx.invariants 的 Context 增补拉进本包 tsc。
import '@deepseek-ai/dsh-invariants';

const PACKAGE_NAME = '@deepseek-ai/dsh-capmap-viz';

export const name = 'capmap-viz-invariant';
export const inject: string[] = ['invariants'];

/**
 * 无跨服务运行时不变式：parser 是纯函数（已被单测覆盖），
 * Host 半的 `capmap.parse` 契约由 RPC 消费方保证。
 * 预留 fail 通道以便后续加入「图 JSON 形状自检」。
 */
const install = (_ctx: Context, _fail: (message: string) => never) => {};

export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));

export default { name, inject, apply };
