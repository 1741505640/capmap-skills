import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DocsRootMissingError, parseGraph } from './parser/parse.ts';
import {
  CAPMAP_INIT_PROMPT,
  CAPMAP_SKILL_INSTALL_CMD,
  DOCS_ROOT_MISSING_CODE,
  isDocsRootMissingMessage,
} from './setupHint.ts';

test('缺 docs_root 时抛 DocsRootMissingError 并含安装命令', () => {
  const root = mkdtempSync(join(tmpdir(), 'capmap-nodocs-'));
  try {
    assert.throws(() => parseGraph(root), (err: unknown) => {
      assert.ok(err instanceof DocsRootMissingError);
      assert.equal(err.code, DOCS_ROOT_MISSING_CODE);
      assert.ok(err.message.includes(CAPMAP_SKILL_INSTALL_CMD));
      assert.ok(err.message.includes(CAPMAP_INIT_PROMPT));
      assert.ok(isDocsRootMissingMessage(err.message));
      return true;
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
