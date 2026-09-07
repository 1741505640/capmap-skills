import { defaultDocsRootName } from './docsRootName.ts';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ScaffoldOptions {
  /** 相对仓库根的 docs_root 名，默认 docs */
  docsRoot?: string;
  /** 默认主题 id */
  themeId?: string;
  /** 是否写 Obsidian graph.json，默认 true */
  obsidian?: boolean;
}

export interface ScaffoldResult {
  docsRoot: string;
  created: string[];
  skipped: string[];
}

function packageRoot(): string {
  // lib/bootstrap/scaffold.js → 包根
  return join(dirname(fileURLToPath(import.meta.url)), '../..');
}

function writeNew(abs: string, content: string, created: string[], skipped: string[], rel: string) {
  if (existsSync(abs)) {
    skipped.push(rel);
    return;
  }
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, 'utf8');
  created.push(rel);
}

function ensureDir(abs: string, created: string[], skipped: string[], rel: string) {
  if (existsSync(abs)) {
    skipped.push(`${rel}/`);
    return;
  }
  mkdirSync(abs, { recursive: true });
  created.push(`${rel}/`);
}

/**
 * 在仓库根写入 capmap.yaml + docs 骨架（等价 capmap-init 新建，默认 docs_root=docs）。
 * 已有文件不覆盖。
 */
export function scaffoldCapmapVault(projectRoot: string, opts: ScaffoldOptions = {}): ScaffoldResult {
  const root = projectRoot.replace(/[/\\]+$/, '');
  const docsRoot = (opts.docsRoot ?? defaultDocsRootName(null, root))
    .replace(/^\.\//, '')
    .replace(/\/$/, '');
  if (!docsRoot || docsRoot.includes('..') || /^[a-zA-Z]:/.test(docsRoot)) {
    throw new Error('capmap.bootstrap: docsRoot 非法');
  }
  const themeId = opts.themeId ?? '默认';
  const mapFile = `能力底图-${themeId}.md`;
  const obsidian = opts.obsidian !== false;
  const created: string[] = [];
  const skipped: string[] = [];

  const yamlRel = '.agents/skills/capmap-system/capmap.yaml';
  const yamlAbs = join(root, yamlRel);
  writeNew(
    yamlAbs,
    [
      '# 由 dsh-capmap-viz 一键初始化生成（对齐 capmap-init）',
      `# 相对仓库根；不要前导 ./ ；不要尾部 /`,
      `docs_root: ${docsRoot}`,
      '',
      'main_branch: main',
      'curator_mode: true',
      'obsidian: true',
      'archive_policy: no_stub',
      '',
      'themes:',
      `  - id: ${themeId}`,
      `    map: ${mapFile}`,
      '',
    ].join('\n'),
    created,
    skipped,
    yamlRel,
  );

  const dr = join(root, docsRoot);
  const dirs = [
    `${docsRoot}/方案/${themeId}`,
    `${docsRoot}/测试/${themeId}`,
    `${docsRoot}/规范`,
    `${docsRoot}/交付`,
    `${docsRoot}/运维`,
    `${docsRoot}/_archive/方案`,
  ];
  for (const d of dirs) ensureDir(join(root, d), created, skipped, d);

  const repoName = root.split(/[/\\]/).filter(Boolean).pop() || '项目';

  writeNew(
    join(dr, '文档首页.md'),
    `---
tags:
  - 文档首页
---
# ${repoName} 文档首页

> Vault = 本仓 \`${docsRoot}/\`

## 导航

- [[能力总览]]
- [[方案索引]]
- [[测试索引]]
- [[规范索引]]
- [[归档索引|归档]]

## Inbox · 未立项

只收能写成开干指令的念头。无 \`状态/*\`，不进底图 §1。
说「先记下」才写入；点名某行则当场执行该指令再删行。丢掉不留痕。
新对话默认不倒表。写不出开干指令不入库。

| 碎片 | 开干指令 | 出口 | 记下日期 | 来源 |
|------|----------|------|----------|------|

## 闭环

scheme →（大：spec / slice / gate）→ dev → test → norm → archive
`,
    created,
    skipped,
    `${docsRoot}/文档首页.md`,
  );

  writeNew(
    join(dr, '能力总览.md'),
    `---
tags:
  - 能力总览
---
# 能力总览

| 主题 | 能力底图 |
|------|----------|
| [[能力底图-${themeId}|${themeId}]] | [md](./方案/${themeId}/${mapFile}) |
`,
    created,
    skipped,
    `${docsRoot}/能力总览.md`,
  );

  writeNew(
    join(dr, '方案', '方案索引.md'),
    `---
tags:
  - 方案索引
---
# 方案索引

| 主题 | 能力底图 | 进行中方案 |
|------|----------|------------|
| ${themeId} | [[能力底图-${themeId}]] | （无） |

归档：[[归档索引]]
`,
    created,
    skipped,
    `${docsRoot}/方案/方案索引.md`,
  );

  writeNew(
    join(dr, '测试', '测试索引.md'),
    `---
tags:
  - 测试索引
---
# 测试索引

| 主题 | 测试文档 |
|------|----------|
| ${themeId} | （无） |
`,
    created,
    skipped,
    `${docsRoot}/测试/测试索引.md`,
  );

  writeNew(
    join(dr, '规范', '规范索引.md'),
    `---
tags:
  - 规范索引
---
# 规范索引

| 主题 | 规范 |
|------|------|
| — | （无） |
`,
    created,
    skipped,
    `${docsRoot}/规范/规范索引.md`,
  );

  writeNew(
    join(dr, '_archive', '归档索引.md'),
    `---
tags:
  - 归档索引
---
# 归档索引

| 文档 | 主题 | 归档日期 |
|------|------|----------|
`,
    created,
    skipped,
    `${docsRoot}/_archive/归档索引.md`,
  );

  writeNew(
    join(dr, '方案', themeId, mapFile),
    `---
tags:
  - 能力底图
---

# 能力底图：${themeId}

> **维护**：体系迭代时更新本底图。  
> 导航：[[文档首页]] · [[归档索引|归档]] · [[能力总览]]

---

## 0. 进行中方案

| 方案 | 状态 |
|------|------|

---

## 1. 能力清单

| 能力 | 状态 | 一句话 |
|------|------|--------|

---

## 2. 关键代码 / 配置

| 模块 | 路径 | 职责 |
|------|------|------|

---

## 3. 对外契约

| 项 | 约定 |
|----|------|

---

## 4. 变更轨迹

| 能力 | 日期 | commit | 说明 |
|------|------|--------|------|

---

## 5. 已知坑

| 现象 | 原因/处理 |
|------|-----------|

---

## 6. 考古（已归档全文）

| 文档（Obsidian） | GitHub |
|------------------|--------|

---

## 7. 验证与测试

| 文档 | 说明 |
|------|------|
`,
    created,
    skipped,
    `${docsRoot}/方案/${themeId}/${mapFile}`,
  );

  if (obsidian) {
    const obsidianDir = join(dr, '.obsidian');
    ensureDir(obsidianDir, created, skipped, `${docsRoot}/.obsidian`);
    const graphDest = join(obsidianDir, 'graph.json');
    const graphSrc = join(packageRoot(), 'assets', 'obsidian', 'graph.json');
    if (!existsSync(graphDest)) {
      mkdirSync(obsidianDir, { recursive: true });
      if (existsSync(graphSrc)) {
        copyFileSync(graphSrc, graphDest);
      } else {
        writeFileSync(graphDest, '{\n  "colorGroups\": []\n}\n', 'utf8');
      }
      created.push(`${docsRoot}/.obsidian/graph.json`);
    } else {
      skipped.push(`${docsRoot}/.obsidian/graph.json`);
    }
    writeNew(
      join(dr, 'Obsidian使用说明.md'),
      `# Obsidian 使用说明

Vault = 本仓 \`${docsRoot}/\`（不是仓库根）。

- 图谱靠唯一文件名 wikilink；GitHub/Cursor 旁路用相对 md 链。
- 进度 Tag 只挂方案/测试，不要打在能力底图上。
- \`graph.json\` 已预置状态颜色组（来自 capmap-init 模板）。
`,
      created,
      skipped,
      `${docsRoot}/Obsidian使用说明.md`,
    );
  }

  // 轻量 gitignore：若仓库根无忽略条目则追加提示行（不覆盖整文件）
  const gi = join(root, '.gitignore');
  const giLine = `# capmap: keep ${docsRoot}/ tracked knowledge docs\n`;
  if (!existsSync(gi)) {
    writeFileSync(gi, giLine, 'utf8');
    created.push('.gitignore');
  } else {
    const cur = readFileSync(gi, 'utf8');
    if (!cur.includes(`keep ${docsRoot}/`)) {
      writeFileSync(gi, cur.endsWith('\n') ? cur + giLine : `${cur}\n${giLine}`, 'utf8');
      created.push('.gitignore(+)');
    } else {
      skipped.push('.gitignore');
    }
  }

  return { docsRoot, created, skipped };
}
