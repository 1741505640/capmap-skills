---
name: capmap-test
description: >-
  功能测试文档：测试范围、改动影响面与回归点、测试是否通过的记录；位于
  <docs_root>/测试/<主题>/。适用于「写测试点」「回归范围」「记一下测过了」时使用。
  可独立使用。
---

# capmap-test — 测试计划与记录

原则：[lifecycle](../capmap-system/reference/lifecycle.md) · 模板：[templates](../capmap-system/reference/templates.md) · Tag：[status-tags](../capmap-system/reference/status-tags.md)

## 启动

1. 读 `.agents/skills/capmap-system/capmap.yaml` → `docs_root`
2. 确认主题、能力名、相关方案/底图

## 路径与命名

```text
<docs_root>/测试/<主题>/测试-<功能可读名>.md
```

例：`测试/权限-abac/测试-三级目录权限.md`  
图谱靠文件名区分，禁止 `README.md`。

## 文档必备节

1. **背景**：对应能力 / 方案 / 底图链接  
2. **测试范围**：要测什么（功能点列表）  
3. **影响面与回归**：改动可能波及哪里、建议回归哪些路径  
4. **用例与记录**：步骤 / 期望 / 结果（通过/失败/阻塞）/ 日期 / 执行人（可自填）  
5. **结论**：是否可发布；遗留问题  

## Checklist

```
- [ ] 1. 解析 docs_root；创建或更新 测试-<功能>.md
- [ ] 2. 测试文：`测试` + `状态/测试中`；对应方案可标 `验证中`
- [ ] 3. 写清范围 + 影响面/回归；记录结果
- [ ] 4. 通过：测试文 → `已验证`；方案 → `已验证`；底图 §1 可写已验证（无 Tag）  
  **未通过前禁止**把方案标成 `落地中` / `已落地`
- [ ] 5. 失败：测试文保持 `测试中`；方案可保持 `验证中`
```

## 与开发的关系

- 宜在 [capmap-dev](../capmap-dev/SKILL.md) 之后  
- 用户说「免测/仅冒烟」→ **必须**在测试文档结论写明免测范围与日期，测试文标 `已验证` 后，方案才可 `已验证`；**禁止**无测试文直接已落地  

## 硬约束

- 测试文仍为 `测试中` ⇒ 方案不得 `落地中`/`已落地`（见 [status-tags](../capmap-system/reference/status-tags.md)）

## 不做

- 不代替自动化测试框架配置  
- 不把长期调用手册写进测试文档 → [capmap-norm](../capmap-norm/SKILL.md)  
