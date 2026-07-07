---
title: "AI 面试知识库 08：记忆、多 Agent、规划与反思"
date: 2026-07-07 16:00:00
author: Chao
tags:
  - Memory
  - Multi-Agent
  - Reflexion
  - Planning
categories:
  - AI Career
photos:
  - https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200
---

> **TL;DR** — 记忆解决连续性，多 Agent 解决专业分工，规划解决长任务，反思解决失败修正。但它们都会增加状态、成本和调试复杂度。

这一篇合并两个仓库里关于 Memory、多智能体、Agent Planning、Reflexion、LATS、ToT 的内容。

---

## 1. 记忆系统

| 类型 | 存什么 |
|:--|:--|
| 短期记忆 | 最近对话和工具结果 |
| 长期记忆 | 用户偏好、稳定事实、经验 |
| 摘要记忆 | 长对话压缩状态 |
| 情景记忆 | 某次任务过程 |
| 语义记忆 | 可复用知识 |

记忆检索要考虑：语义相关性、时间新鲜度、重要性、权限隔离。

---

## 2. 多 Agent

适合：

- 工具多；
- 角色复杂；
- 单个 Prompt 过长；
- 任务可并行；
- 需要专家分工。

典型结构：

```text
Supervisor -> RAG Agent / Tool Agent / Critic Agent / Summary Agent
```

风险：通信成本、状态不一致、冲突解决、trace 复杂。

---

## 3. 规划模式

ReAct 把规划和执行耦合。复杂任务可以用：

- Plan-and-Solve；
- REWOO；
- 动态重规划；
- Planner + Executor；
- Tree of Thoughts。

规划适合长任务，但计划必须可验证、可重写。

---

## 4. 反思模式

Reflexion、Generator-Evaluator、LATS 都强调“生成后评估，再修正”。

生产难点：

- 评估器是否可靠；
- 何时触发反思；
- 如何防反思死循环；
- 反思记忆如何存；
- 成本如何控制。

---

## 面试速答

> 我不会默认上多 Agent 或反思。先看任务复杂度和失败模式：如果工具多、角色清晰、需要并行，再拆 Agent；如果有可验证失败信号，比如测试失败、工具报错、低置信度，再触发反思。

---

## 参考资料

- [bcefghj/ai-agent-interview-guide](https://github.com/bcefghj/ai-agent-interview-guide)
- [guocong-bincai/ai-interview-guide](https://github.com/guocong-bincai/ai-interview-guide)

