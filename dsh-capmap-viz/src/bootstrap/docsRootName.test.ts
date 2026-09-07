import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultDocsRootName } from './docsRootName.ts';

test('defaultDocsRootName：工作区名 + -docs', () => {
  assert.equal(defaultDocsRootName('capmap-skills'), 'capmap-skills-docs');
  assert.equal(defaultDocsRootName('My App'), 'My-App-docs');
  assert.equal(defaultDocsRootName('foo-docs'), 'foo-docs');
  assert.equal(defaultDocsRootName(null, 'D:/work/bar'), 'bar-docs');
  assert.equal(defaultDocsRootName(null, null), 'project-docs');
});
