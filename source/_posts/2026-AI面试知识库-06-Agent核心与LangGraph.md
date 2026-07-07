---
title: "AI 面试知识库 06：Agent 核心与 LangGraph"
date: 2026-07-07 14:00:00
author: Chao
tags:
  - AI Agent
  - ReAct
  - LangGraph
  - Interview
categories:
  - AI Career
photos:
  - https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200
---

> **TL;DR** — Agent 不只是会聊天，而是能围绕目标多步行动。面试要讲清目标、状态、工具、观察、终止条件和 trace。

两个仓库都把 Agent 作为核心模块。合并来看，Agent 面试会从概念、框架、工程治理三个层次追问。

---

## 1. Agent 定义

> AI Agent 是以大模型为决策核心，结合规划、记忆、工具调用和反馈机制，围绕目标进行多步执行的系统。

和普通 ChatBot 区别：

- ChatBot 主要回答；
- Agent 会计划、调用工具、观察结果、调整策略。

---

## 2. ReAct

```text
Thought -> Action -> Observation -> Thought -> ...
```

优势：

- 适合交互式任务；
- 能根据工具结果动态调整；
- 和 Function Calling 天然匹配。

风险：

- 串行慢；
- 容易死循环；
- 上下文膨胀；
- 工具误用。

治理：

- max iterations；
- timeout；
- 工具结果结构化；
- 重复动作检测；
- trace。

---

## 3. Plan-and-Execute 与 ReAct

| 维度 | ReAct | Plan-and-Execute |
|:--|:--|:--|
| 决策 | 每步动态 | 先计划再执行 |
| 适合 | 不确定任务 | 步骤清晰任务 |
| 风险 | 死循环 | 计划过时 |
| 优化 | 终止条件 | 重规划 |

生产里常用混合方案：先粗计划，再让每步 ReAct 执行。

---

## 4. LangGraph

LangGraph 的价值是把 Agent 变成状态机：

- State；
- Node；
- Edge；
- Conditional Edge；
- Checkpoint；
- Error Path。

面试回答：

> LangChain 更像组件库，LangGraph 更强调状态、节点和边。复杂 Agent 需要可恢复、可观察、可控制，所以图结构更适合生产流程。

---

## 5. Agent 类型

常见类型：

- RAG Agent；
- Tool Agent；
- Workflow Agent；
- Coding Agent；
- Multi-modal Agent；
- Reflection Agent。

讲项目时要说清你做的是哪种 Agent，别笼统说“智能体平台”。

---

## 参考资料

- [bcefghj/ai-agent-interview-guide](https://github.com/bcefghj/ai-agent-interview-guide)
- [guocong-bincai/ai-interview-guide](https://github.com/guocong-bincai/ai-interview-guide)

