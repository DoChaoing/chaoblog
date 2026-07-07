---
title: "AI 面试知识库 13：Coding Agent 与 AI 编程工具"
date: 2026-07-07 21:00:00
author: Chao
tags:
  - Coding Agent
  - AI Coding
  - Claude Code
  - Cursor
categories:
  - AI Career
photos:
  - https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200
---

> **TL;DR** — AI 编程工具面试不是问“你用哪个”，而是问补全、编辑、Agent 模式、代码库理解、工具执行、测试验证和 SWE-bench。

这部分主要来自 `ai-interview-guide`，但也能和 Agent 项目里的工具系统、权限、MCP 结合起来。

---

## 1. 三层能力

| 层 | 能力 |
|:--|:--|
| 补全 | Tab、FIM、局部生成 |
| 编辑 | 多文件修改、上下文编辑 |
| Agent | 读仓库、计划、改代码、跑测试、修复 |

---

## 2. Coding Agent 架构

```text
任务 -> 仓库索引 -> 计划 -> 文件读写 -> 命令执行 -> 测试 -> 反思修复 -> patch
```

核心能力：

- repo map；
- 代码检索；
- shell 工具；
- 测试运行；
- diff 生成；
- 权限控制；
- 回滚。

---

## 3. 评测

SWE-bench 更接近真实开发任务，因为它要求理解 issue、修改仓库并通过测试。

指标：

- issue 解决率；
- 测试通过率；
- 修改范围；
- 回归风险；
- review 成本。

---

## 4. 企业落地

落地 AI 编程工具要关注：

- 私有代码安全；
- 权限边界；
- 生成代码质量；
- 许可证风险；
- review 流程；
- 团队规范。

---

## 参考资料

- [guocong-bincai/ai-interview-guide](https://github.com/guocong-bincai/ai-interview-guide)

