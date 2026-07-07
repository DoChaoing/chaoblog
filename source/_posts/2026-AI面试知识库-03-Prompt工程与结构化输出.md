---
title: "AI 面试知识库 03：Prompt 工程与结构化输出"
date: 2026-07-07 11:00:00
author: Chao
tags:
  - Prompt Engineering
  - Function Calling
  - Structured Output
  - AI Safety
categories:
  - AI Career
photos:
  - https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200
---

> **TL;DR** — Prompt 工程不是“写提示词”，而是把模型输入输出设计成协议：角色、任务、上下文、约束、输出格式、工具规则和失败策略。

Prompt 是 AI 应用的第一层控制面。它连接用户、上下文、工具和模型，是最容易被低估的工程环节。

---

## 1. 好 Prompt 的结构

一个稳定 Prompt 至少包含：

```text
角色 -> 任务 -> 输入 -> 约束 -> 输出格式 -> 示例 -> 错误处理
```

System Prompt 要说明：

- 能做什么；
- 不能做什么；
- 什么时候调用工具；
- 什么时候追问；
- 什么时候拒答；
- 输出必须是什么 schema。

---

## 2. CoT、Few-shot、Self-Consistency、ToT

| 技术 | 作用 | 工程风险 |
|:--|:--|:--|
| CoT | 引导复杂推理 | 成本上升，不一定展示给用户 |
| Few-shot | 稳定格式和行为 | 示例偏差 |
| Self-Consistency | 多次生成投票 | 延迟和费用上升 |
| ToT | 多路径搜索 | 适合复杂规划，不适合低延迟 |
| Auto-CoT | 自动构造推理样例 | 需要筛选质量 |

生产里不要迷信“让我们一步步思考”。更重要的是输出可控、可校验、可回归。

---

## 3. JSON Mode、Structured Output 和 Function Calling

| 能力 | 适合场景 |
|:--|:--|
| JSON Mode | 只需要合法 JSON |
| Structured Output | 需要严格 schema |
| Function Calling | 模型选择工具并输出参数 |
| MCP | 工具能力跨应用复用 |

面试回答：

> 如果只是抽取或分类，我优先用结构化输出；如果需要调用业务系统，我用 Function Calling，并在系统侧校验参数、权限和审计。

---

## 4. Prompt 注入与泄露

风险包括：

- 用户诱导模型泄露系统 Prompt；
- 检索文档中包含恶意指令；
- 模型被诱导调用危险工具；
- 输出绕过安全策略。

防御：

- system/user/context 分层；
- 外部文档标记为不可信；
- 工具调用前做权限校验；
- 不把密钥放进 Prompt；
- 输出审核和审计日志；
- 红队测试。

Prompt 安全不能只靠 Prompt，必须靠运行时权限和工具治理。

---

## 面试速答

> 我把 Prompt 当成模型和系统之间的接口协议。它定义输入、输出、工具规则和失败处理。复杂场景会结合 Structured Output、Function Calling、版本管理、评测集和安全过滤来保证稳定性。

---

## 参考资料

- [guocong-bincai/ai-interview-guide](https://github.com/guocong-bincai/ai-interview-guide)
- [bcefghj/ai-agent-interview-guide](https://github.com/bcefghj/ai-agent-interview-guide)

