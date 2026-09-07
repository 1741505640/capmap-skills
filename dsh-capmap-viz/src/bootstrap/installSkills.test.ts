import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { skillsAlreadyPresent } from './installSkills.ts';

test('skillsAlreadyPresent：仅有 capmap.yaml 不算已安装', () => {
  const root = mkdtempSync(join(tmpdir(), 'capmap-skill-detect-'));
  try {
    const dir = join(root, '.agents', 'skills', 'capmap-system');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'capmap.yaml'), 'docs_root: docs\n', 'utf8');
    assert.equal(skillsAlreadyPresent(root), false);

    writeFileSync(join(dir, 'SKILL.md'), '# capmap-system\n', 'utf8');
    assert.equal(skillsAlreadyPresent(root), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
