// Wrap esbuild CJS output in DSH browser ModuleLoader envelope.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const target = join(root, 'client', 'client.js');
const body = readFileSync(target, 'utf8');

if (body.includes('window.__ModuleLoader__')) {
  process.exit(0);
}

const indented = body
  .replace(/\r\n/g, '\n')
  .split('\n')
  .map((line) => (line.length ? `\t\t${line}` : ''))
  .join('\n');

const wrapped = `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(pkg.name)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${indented}
\t\treturn module.exports;
\t}
});
`;

writeFileSync(target, wrapped);
console.log('normalized', target);
