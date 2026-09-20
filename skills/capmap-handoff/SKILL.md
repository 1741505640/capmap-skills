---
name: capmap-handoff
description: >-
  窗口/会话交接：上下文过长需换窗时，将进行中工作落成冷启动交接文；新窗按开干指令接棒。
  落点 <docs_root>/_handoff/；不进方案状态机、不改切片 Tag。
  适用于交接窗口、换窗续、交棒、接棒、上下文太长、续跑上一窗。可独立使用；可与进行中切片/debug 并存。
  进行中工作禁止写入 Inbox（Inbox 仅未立项）。
---

# capmap-handoff — 窗口交接

原则：[capmap-system](../capmap-system/SKILL.md) · 目录：[directory-contract](../capmap-system/reference/directory-contract.md) · 模板：[templates](../capmap-system/reference/templates.md#窗口交接-_handoff)

**正交于** scheme→dev→archive：**不**读写方案/切片/测试的 `状态/*`。  
**不等于** Inbox：Inbox = 未立项碎片；本 skill = **进行中**工作换窗。

## 何时进入

| 动词 | 触发 |
|------|------|
| **交棒** | 「交接窗口」「换窗」「交棒」「上下文太长要换会话」；或 Agent **建议**交棒且用户点头 |
| **接棒** | 新窗「接棒」「续跑交接」「按 _handoff 继续」；或用户点名某份活跃交接文 |

Agent 可在明显膨胀时**建议**交棒；**点头才写**。禁止静默落盘。

## 落盘契约

```text
<docs_root>/_handoff/<scope>-YYYYMMDD-HHmm.md     # 活跃
<docs_root>/_handoff/_consumed/                   # 接棒后移入；保留最近 5 份，更早删除
```

| 规则 | 说明 |
|------|------|
| **scope** | 方案 stem、或 `<方案stem>-NN`（切片）、或 `misc-<短题>`；文件名全局唯一 |
| **同 scope 活跃上限** | **1 份**；交棒前若已有同 scope 活跃文 → 先问：覆盖 / 先接棒旧份 / 改 scope |
| **无 `状态/*`** | 交接文不是方案；不进底图 §1 |
| **lint** | 不强制校验缺目录/缺节（与 Inbox 同级宽松） |

## 交棒（旧窗）

1. 读 `capmap.yaml` → `docs_root`；确保 `_handoff/` 存在  
2. 判定 scope；检查同 scope 是否已有活跃交接  
3. **先建议**全文（或关键节）+ 开干指令；用户点头再写入  
4. 写入后在回复给出：**路径** + **可复制的开干指令**（给新窗当首条 user prompt）  
5. **停住**：旧窗不再继续大改（用户明确「旧窗再改一点」除外）

### 交接文必填（缺一不得落盘）

见 [templates](../capmap-system/reference/templates.md#窗口交接-_handoff)。摘要：

```text
锚点：方案/切片/测试路径 + 应加载的 capmap-*
已决：勿再问（含 grilling 已拍板）
未决/阻塞：仅仍开着的
本窗进度：已做 / 做到一半（精确到路径）/ 未做
工作区事实：分支、dirty 摘要、关键改动意图（可核验，禁臆测）
开干指令：一行，可直接当新窗 user prompt
接棒禁止：重开已决、倒全套 lifecycle、擅自改 Tag、扩 scope
```

写不出开干指令 → **不许落盘**。

### 开干指令模板（推荐照抄结构）

```text
接棒 [[<交接文件名>]]：读该文全部必填块 → 按「必须先读」顺序打开锚点 → 加载 <skill> → 从「做到一半」续做；禁止重开已决、禁止改状态 Tag。
```

## 接棒（新窗）

1. 读 `capmap.yaml` → `docs_root`  
2. 定位活跃交接：用户点名路径/文件名；未点名则列出 `_handoff/` 下非 `_consumed` 的 md，请用户点名（**不要**默认倒 Inbox）  
3. 按文内「必须先读」顺序读锚点；加载指定 skill  
4. 执行开干指令；回复首段用 3～5 行复述：锚点 / 进度续点 / 本窗下一步  
5. **作废**：将该文件移入 `_handoff/_consumed/`；若 consumed 内同 scope 或全局超过 **5** 份，删最旧  
6. 之后按对应阶段 skill 继续；**不**把交接文当长期方案保留在活跃区

## 硬规则

1. **不改**方案/切片/测试的 `状态/*`  
2. **进行中换窗禁止写 Inbox**；未立项念头仍走 [capmap-scheme](../capmap-scheme/SKILL.md) Inbox  
3. 交棒须含可执行开干指令；接棒成功必须作废活跃文  
4. 与 [capmap-gate](../capmap-gate/SKILL.md) 并存：不自动开下一张切片；不自评验收  
5. 与 [capmap-debug](../capmap-debug/SKILL.md) 并存：交接文须带上复现/假设/计数 `n/3`；接棒后仍走 debug 契约  
6. 禁止把交接文写成第二套方案正文或变更台账  

## 与其它 skill

| 场景 | 走谁 |
|------|------|
| 进行中换窗 / 上下文太长 | **本 skill** |
| 未立项念头下轮再干 | Inbox（scheme） |
| 贴报错修锅 | [capmap-debug](../capmap-debug/SKILL.md)（可先 debug 再交棒） |
| 切片点名 / 交票 | [capmap-gate](../capmap-gate/SKILL.md) |

## Checklist

```
交棒：
- [ ] 1. 确认进行中（非 Inbox 场景）；用户点头
- [ ] 2. scope 无第二份活跃（或已处理冲突）
- [ ] 3. 必填块齐全 + 开干指令可执行
- [ ] 4. 写入 _handoff/；回复给路径与开干指令；停住

接棒：
- [ ] 1. 点名活跃交接文；按序读锚点
- [ ] 2. 复述续点；加载指定 skill 续做
- [ ] 3. 移入 _consumed/；修剪至最近 5 份
- [ ] 4. 不改状态 Tag；不倒全套 lifecycle
```

## 不做

- 不引入交接专用 `状态/*`  
- 不替代 capmap-slice / gate 的拆分与验收  
- 不把 `_consumed` 当归档方案库  
- 不在每个新对话默认扫描并倒出全部交接文（仅接棒意图或用户点名时）
