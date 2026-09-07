/**
 * Host 编译期 Context 增补。勿在 Host 入口 side-effect import
 * `@deepseek-ai/dsh-client-connection`：其主入口会拉 apiproxy 等 peer，
 * 在 vendor 插件独立 node_modules 下会 ERR_MODULE_NOT_FOUND。
 */
declare module '@deepseek-ai/cordis' {
  interface Context {
    connection: {
      rpc: {
        handle(
          channel: string,
          handler: (endpoint: string, payload: unknown, signal: AbortSignal) => Promise<unknown>,
          options: { authority: 'trusted-host' | 'loopback' },
        ): () => Promise<void>;
      };
    };
    invariants: {
      register(
        packageName: string,
        check: (child: unknown, fail: (message: string) => void) => void,
      ): void;
    };
  }
}

export {};
