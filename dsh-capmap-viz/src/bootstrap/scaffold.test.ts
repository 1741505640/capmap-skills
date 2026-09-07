import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scaffoldCapmapVault } from './scaffold.ts';
import { parseGraph } from '../parser/parse.ts';

test('scaffoldCapmapVault 写入 yaml + docs 后可 parseGraph', () => {
  const root = mkdtempSync(join(tmpdir(), 'capmap-boot-'));
  try {
    const r = scaffoldCapmapVault(root, { docsRoot: 'docs', themeId: '默认' });
    assert.equal(r.docsRoot, 'docs');
    assert.ok(existsSync(join(root, '.agents/skills/capmap-system/capmap.yaml')));
    assert.ok(existsSync(join(root, 'docs/文档首页.md')));
    assert.ok(existsSync(join(root, 'docs/方案/默认/能力底图-默认.md')));
    const yaml = readFileSync(join(root, '.agents/skills/capmap-system/capmap.yaml'), 'utf8');
    assert.match(yaml, /docs_root:\s*docs/);
    const g = parseGraph(root);
    assert.ok(g.nodes.length >= 1);
    assert.ok(g.docsRoot.replace(/\\/g, '/').endsWith('/docs'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
