---
title: "AI 系统学习路线 00：资料来源与章节映射"
date: 2026-07-07 23:59:00
author: Chao
tags:
  - AI Learning
  - AI Interview
  - Study Guide
categories:
  - AI Learning
photos:
  - https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200
---

> **一句话**：这篇不是主线必读文档，而是资料索引。它说明 `ai-interview-guide` 的原始章节，分别被整理到了学习路线的哪些部分。

<!-- more -->

## 1. 这篇文档解决什么

`ai-interview-guide` 原始项目覆盖了 LLM、Prompt、RAG、Agent、MCP、微调、推理、安全、多模态、系统设计和面试技巧，内容足够全，但如果直接按章节读，会遇到三个问题：

| 问题 | 影响 | 调整方式 |
|:--|:--|:--|
| 主题跨度大 | 新手不知道先后顺序 | 按能力层重新排序 |
| 题库密度高 | 容易背答案，不会落地 | 每阶段加工程产出 |
| 章节有交叉 | 同一个概念多处出现 | 合并成主线，保留补充阅读 |

所以这套博客文档不做逐字搬运，而是把资料重新组织成学习路线。真正的学习主线是 01 到 07，这篇 00 只负责解释资料来源和章节映射。

## 2. 最推荐的学习顺序

```text
LLM 基础
  -> Prompt 与结构化输出
  -> RAG 知识库工程
  -> Agent 与工具调用
  -> 训练、推理、部署、评估
  -> 项目实战与面试表达
```

这个顺序的好处是每一步都能接到下一步：

- LLM 基础让你知道模型能力边界；
- Prompt 让你能稳定控制输出；
- RAG 解决私有知识、实时知识和引用来源；
- Agent 让模型能使用工具、记忆和规划；
- 工程化让系统能上线、能评估、能排障；
- 项目表达让学习结果能被面试官听懂。

## 3. 原始章节如何归类

| 能力层 | 应先读 | 后续补充 |
|:--|:--|:--|
| 基础层 | `01-basic-concepts`、`04-transformer-architecture` | Token、上下文、采样、注意力、KV Cache |
| 控制层 | `02-prompt-engineering` | Few-shot、结构化输出、Prompt 注入防护 |
| 知识层 | `03-rag-system`、`06-vector-index-optimization`、`20-rag-advanced-optimization` | 混合检索、Rerank、GraphRAG、HyDE、语义分块 |
| 行动层 | `05-ai-agent-basics`、`13-multi-agent-systems`、`14-mcp-skill-systems` | ReAct、工具调用、MCP、多 Agent、Skill 系统 |
| 反思层 | `22-agent-planning-reflection`、`23-agent-observability` | Reflexion、LATS、trace、评测、线上监控 |
| 模型层 | `07-model-training`、`08-inference-optimization`、`19-inference-frameworks` | SFT、LoRA、vLLM、SGLang、TensorRT-LLM |
| 应用层 | `09-ai-safety-evaluation`、`10-production-deployment`、`24-python-engineering`、`25-system-design-ai` | 安全、部署、LLM Gateway、系统设计、Python 工程 |
| 扩展层 | `11-multimodal-ai`、`21-multimodal-agents`、`17-ai-coding-tools` | 多模态、Coding Agent、AI 编程工具 |
| 求职层 | `04-project-experience`、`16-resume-interview-tips`、`18-big-tech-interview-questions` | 项目复盘、简历、STAR、大厂真题 |

## 4. 用一个项目串起全部知识

不要把每章学成孤立概念。建议围绕一个“企业知识库 RAG + Agent”项目持续升级：

| 版本 | 加什么能力 | 对应知识 |
|:--|:--|:--|
| V1 | 文档上传、分块、Embedding、向量检索 | RAG 基础 |
| V2 | BM25 + Vector + RRF + Rerank | 检索优化 |
| V3 | 输出 JSON、引用来源、失败策略 | Prompt 与结构化输出 |
| V4 | 查询数据库、调用搜索、执行计算 | Agent 工具调用 |
| V5 | 任务规划、反思、最大轮数、trace | Agent 生产化 |
| V6 | LLM Gateway、模型路由、限流、成本统计 | 部署与推理优化 |
| V7 | bad case 集、自动评测、安全检查 | 评估与安全 |

这样到面试时，你讲的不是“我看过 RAG 和 Agent”，而是“我把一个知识库系统从 baseline 做到了可评测、可观测、可上线”。

## 5. 每阶段验收标准

| 阶段 | 你应该能回答 | 你应该能做出 |
|:--|:--|:--|
| LLM 基础 | Token、上下文、温度、幻觉、KV Cache 是什么 | 一张模型调用参数速记卡 |
| Prompt | 如何让模型稳定输出 JSON，如何防 Prompt 注入 | 3 套可复用 Prompt 模板 |
| RAG | 从文档到答案的链路是什么，如何评估召回 | 一个带引用的 RAG Demo |
| Agent | ReAct 怎么跑，工具调用怎么做权限校验 | 一个有工具、状态和 trace 的 Agent |
| 工程化 | 如何控制成本、延迟、失败率和安全风险 | 一套日志、评测和部署方案 |
| 项目面试 | 如何讲背景、方案、指标、难点和复盘 | 简历 bullet + 3 分钟讲稿 |

## 6. 读题库的正确姿势

题库不是第一入口，而是查漏工具。

1. 先读系统学习路线 01-07，知道知识在哪一层；
2. 再回到扩展题库，补充每个主题的问答细节；
3. 每学完一个阶段，都把知识写进同一个项目复盘；
4. 面试前再看大厂真题和 STAR 文档，训练表达。

如果只背题，很容易答成零散概念；如果先做主线，再回题库，答案会更像一个做过项目的人。

## 7. 最终学习产物

完成这套路线后，建议至少沉淀 6 个材料：

- AI 应用工程知识地图；
- RAG 项目架构图；
- Agent 工具调用流程图；
- Prompt 模板库；
- bad case 评测清单；
- 简历项目描述和面试口述稿。

这 6 个材料比“我熟悉 LangChain / RAG / Agent”更有说服力。
