---
title: "AI 系统学习路线 05：Agent、工具调用与 MCP"
date: 2026-07-07 23:58:55
author: Chao
tags:
  - AI Learning
  - AI Agent
  - Tool Calling
  - MCP
categories:
  - AI Learning
photos:
  - https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200
---

> **一句话**：Agent 是让模型从“回答问题”变成“观察环境、选择工具、执行动作、根据结果继续决策”。

<!-- more -->

## 1. Agent 和普通聊天的区别

普通聊天：

```text
用户问题 -> 模型回答
```

Agent：

```text
用户目标
  -> 规划
  -> 选择工具
  -> 执行
  -> 观察结果
  -> 更新状态
  -> 继续或结束
```

所以 Agent 的核心不是“更长 Prompt”，而是闭环。

## 2. ReAct 是基本功

ReAct 可以理解为：

```text
Thought -> Action -> Observation -> Thought -> ...
```

面试要讲清：

- Thought：判断下一步；
- Action：调用工具；
- Observation：读取工具结果；
- Stop：满足目标或达到限制。

工程上要加限制：

- 最大轮数；
- 工具白名单；
- 参数校验；
- 超时控制；
- 循环检测；
- 人工确认。

## 3. 工具调用

工具调用要分成两层：

| 层 | 负责什么 |
|:--|:--|
| 模型层 | 选择工具、生成参数 |
| 工程层 | 校验参数、执行权限、记录审计、处理失败 |

不要把安全责任交给模型。

一个工具定义至少包含：

- name；
- description；
- input schema；
- permission；
- timeout；
- error handling；
- result schema。

## 4. MCP 的价值

MCP 可以理解成“让模型工具标准化接入”的协议。它的价值是：

- 工具提供方和 Agent 主体解耦；
- 工具能力可以被发现；
- 上下文资源、工具、Prompt 可以统一暴露；
- 多客户端可以复用同一套工具服务。

面试可以这样说：

> Function Calling 解决单个模型如何调用函数，MCP 更像工具生态协议，解决工具如何被不同 Agent 客户端发现、描述、调用和复用。

## 5. 记忆与状态

Agent 记忆不要只理解成“把聊天记录塞回 Prompt”。

| 类型 | 用途 |
|:--|:--|
| 短期记忆 | 当前任务上下文 |
| 长期记忆 | 用户偏好、历史事实 |
| 语义记忆 | 可检索知识 |
| 情景记忆 | 过去任务经验 |
| 工作状态 | 当前计划、工具结果、失败次数 |

复杂 Agent 应该维护结构化状态，而不是只靠自然语言历史。

## 6. 多 Agent 什么时候需要

不要为了炫技上多 Agent。它适合：

- 任务天然分角色；
- 需要专家协作；
- 需要评审和反思；
- 单 Agent 上下文太乱；
- 工作流可拆成多个阶段。

常见模式：

| 模式 | 示例 |
|:--|:--|
| Supervisor | 主管 Agent 分配任务 |
| Debate | 多个 Agent 给方案再裁决 |
| Pipeline | 规划、执行、评审分阶段 |
| Critic | 一个 Agent 生成，一个 Agent 审查 |

## 7. 本章产出

实现一个最小 Agent：

- 支持 calculator/search/database 三个工具；
- 有 ReAct 循环；
- 有最大轮数和超时；
- 工具参数用 schema 校验；
- 每一步有 trace 日志；
- 失败时能给出原因。

