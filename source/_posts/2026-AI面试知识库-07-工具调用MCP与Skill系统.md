---
title: "AI 面试知识库 07：工具调用、MCP 与 Skill 系统"
date: 2026-07-07 15:00:00
author: Chao
tags:
  - Tool Calling
  - MCP
  - Skill
  - AI Agent
categories:
  - AI Career
photos:
  - https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200
---

> **TL;DR** — 工具调用让模型连接外部世界，MCP 让工具能力标准化，Skill 把提示词、流程和工具封装成可复用能力。面试重点是契约、安全、权限、审计。

Agent 的行动能力来自工具。工具设计不好，Agent 就会从“智能”变成“危险”。

---

## 1. Tool Calling 完整流程

```text
工具注册 -> 模型决策 -> 参数校验 -> 权限检查 -> 执行工具 -> 结果回写 -> 生成答案
```

必须考虑：

- schema；
- 参数类型；
- 超时；
- 重试；
- 幂等；
- 权限；
- 审计；
- 输出截断。

---

## 2. Function Calling vs MCP

| 能力 | Function Calling | MCP |
|:--|:--|:--|
| 范围 | 应用内工具 | 跨应用工具协议 |
| 接入 | 快 | 标准化 |
| 复用 | 弱 | 强 |
| 适合 | 简单业务工具 | 文件、数据库、IDE、企业系统 |

面试话术：

> 简单工具我会用 Function Calling 快速接入；需要跨团队复用、独立部署、权限隔离时，会考虑 MCP。

---

## 3. Skill 系统

Skill 可以理解为“能力包”：

- Prompt 模板；
- 工具说明；
- 执行流程；
- 输入输出约束；
- 示例；
- 安全规则。

它适合把复杂任务沉淀成可复用能力，比如“文档分析”“代码修改”“报表生成”。

---

## 4. 安全治理

工具安全三层：

1. Prompt 层：说明工具规则；
2. Runtime 层：校验参数、权限、幂等；
3. Governance 层：审计、限流、人工确认、回滚。

危险工具必须二次确认，比如删库、发消息、转账、执行 shell。

---

## 参考资料

- [bcefghj/ai-agent-interview-guide](https://github.com/bcefghj/ai-agent-interview-guide)
- [guocong-bincai/ai-interview-guide](https://github.com/guocong-bincai/ai-interview-guide)

