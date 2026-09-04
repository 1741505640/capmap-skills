---
name: capmap-norm
description: >-
  将稳定的使用/配置/调用约定写入 <docs_root>/规范/，并挂到能力底图 §3。
  适用于权限配置规范、AG-UI 入参约定、对接手册、对照表等长期文档。可独立使用。
---

# capmap-norm — 使用与配置规范

原则：[lifecycle](../capmap-system/reference/lifecycle.md)

## 启动

1. 读 `.agents/skills/capmap-system/capmap.yaml` → `docs_root`
2. 确认主题能力、是否已有规范可增补

## 何时写规范（进 `规范/`）

| 写 | 不写（留在方案里即可） |
|----|------------------------|
| 对外/对前端的稳定契约 | 一次性权衡、已否决方案 |
| 权限/策略如何配置 | 纯实现细节且易变 |
| 协议入参、错误码约定 | 仅开发自测清单 |
| 对照表、接入手册 | |

示例（本仓已有方向）：

- ABAC：权限动作对照、租户侧策略配置、外部系统接入手册  
- AG-UI：入参 / `forwardedProps` / 全局变量约定  

## 路径

```text
<docs_root>/规范/<规范标题>.md
```

更新 `规范/规范索引.md`；底图 **§3 对外契约** 增加链接（wikilink + md）。

## Checklist

```
- [ ] 1. 解析 docs_root；判断新建 vs 增补已有规范
- [ ] 2. 写清：适用对象、前提、步骤/字段表、禁忌
- [ ] 3. 更新规范索引
- [ ] 4. 底图 §3 挂链（底图不加状态 Tag）；方案 Tag：`落地中` → 齐备后 `已落地`  
  **前置硬约束**：方案须已是 **`已验证`**（测试通过或测试文明示免测）；测试文不得仍为 `测试中`
- [ ] 5. 方案中重复的大段契约可改为「详见规范」，避免双源
```

## 硬约束

- 未验证不得落地。详见 [status-tags](../capmap-system/reference/status-tags.md)「禁止跳步」。

## 不做

- 不把规范当变更台账  
- 不替代测试记录 → [capmap-test](../capmap-test/SKILL.md)  
- 方案全文归档 → [capmap-archive](../capmap-archive/SKILL.md)  
