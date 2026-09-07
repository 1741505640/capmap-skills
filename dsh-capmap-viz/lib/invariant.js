// ctx.invariants / connection 类型见 ./shims-dsh-host.d.ts
/** 包级 invariant 伴生（web profile 通常不挂；保留给带 invariants 的环境）。 */
export function apply(ctx) {
    ctx.invariants.register('@chenjh12/dsh-capmap-viz', (_child, fail) => {
        if (!ctx.connection)
            fail('capmap-viz requires ctx.connection');
    });
}
export const inject = ['invariants', 'connection'];
//# sourceMappingURL=invariant.js.map