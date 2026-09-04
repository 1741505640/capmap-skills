---
name: capmap-dev
description: >-
  开发落地后的文档收尾：更新能力底图 §1/§2（代码路径），并将对应方案主状态标为
  已开发（编码中则为开发中）。底图不打状态 Tag。适用于「功能开发完了」「标记已开发」。
---

# capmap-dev — 开发完成标识

原则：[lifecycle](../capmap-system/reference/lifecycle.md) · Tag：[status-tags](../capmap-system/reference/status-tags.md)

## 做什么

1. 打开对应 `能力底图-*.md`：§1 状态列 → **已开发**；§2 补路径；§4 一行轨迹  
2. 底图 YAML：**仅** `能力底图`，去掉任何 `状态/*`  
3. 对应**方案**文主状态 → **`状态/已开发`**（若仍在编码则为 `开发中`）  
4. 提醒 `capmap-test`（方案可改 `验证中`）→ 通过后再 `capmap-norm` → `capmap-archive`  
5. **硬约束**：本阶段最多标到 `已开发`；**禁止**标 `落地中` / `已落地`（须先测试 `已验证`）

## Checklist

```
- [ ] 1. 底图 §1/§2/§4 已更新
- [ ] 2. 底图无 状态/* Tag
- [ ] 3. 方案 Tag = 开发中 或 已开发（禁止已落地）
- [ ] 4. 提示测试 / 规范 / 归档
- [ ] 5. 未跳过验证门
```

## 不做

- 不写测试正文 → [capmap-test](../capmap-test/SKILL.md)  
- 不写规范 → [capmap-norm](../capmap-norm/SKILL.md)  
- 不归档 → [capmap-archive](../capmap-archive/SKILL.md)  
