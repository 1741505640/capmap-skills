// 把 esbuild 产出的 CommonJS 客户端 bundle 包成 DSH 客户端模块加载器格式：
//   window.__ModuleLoader__.load({ id, factory: (require) => { ...; return module.exports; } })
// factory 的 `require` 解析宿主模块表（react / @deepseek-ai/* 等 peer），
// 与 @deepseek-ai/dsh-client-ui-* 各包 client.js 的产物形态一致。
import { readFileSync, writeFileSync } from 'node:fs';

const PACKAGE_ID = '@deepseek-ai/dsh-capmap-viz';
const IN = 'client/client.js';

const code = readFileSync(IN, 'utf8');

const wrapped = [
  `window.__ModuleLoader__.load({`,
  `  id: ${JSON.stringify(PACKAGE_ID)},`,
  `  factory: (require) => {`,
  `    var module = { exports: {} };`,
  `    var exports = module.exports;`,
  `    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });`,
  code.trim(),
  `    return module.exports;`,
  `  }`,
  `});`,
  ``,
].join('\n');

writeFileSync(IN, wrapped);
console.log(`[capmap-viz] wrapped ${IN} as ${PACKAGE_ID}`);
