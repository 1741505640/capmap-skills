// 侧效 import：把 ctx.invariants 的 Context 增补拉进本包 tsc。
import '@deepseek-ai/dsh-invariants';
const PACKAGE_NAME = '@deepseek-ai/dsh-capmap-viz';
export const name = 'capmap-viz-invariant';
export const inject = ['invariants'];
/**
 * 无跨服务运行时不变式：parser 是纯函数（已被单测覆盖），
 * Host 半的 `capmap.parse` 契约由 RPC 消费方保证。
 * 预留 fail 通道以便后续加入「图 JSON 形状自检」。
 */
const install = (_ctx, _fail) => { };
export const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
export default { name, inject, apply };
