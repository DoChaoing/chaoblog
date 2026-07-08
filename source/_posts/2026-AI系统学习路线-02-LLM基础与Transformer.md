---
title: "AI 系统学习路线 02：LLM 基础与 Transformer"
date: 2026-07-07 23:58:58
author: Chao
tags:
  - AI Learning
  - LLM
  - Transformer
  - Token
categories:
  - AI Learning
photos:
  - https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=1200
---

> **一句话**：LLM 基础不是为了推公式，而是为了理解成本、延迟、幻觉、上下文和输出稳定性。

<!-- more -->

## 1. 先抓住 LLM 的输入输出

大模型本质上是在做“给定上下文，预测下一个 token”。工程上你需要关心：

| 概念 | 工程影响 |
|:--|:--|
| Token | 决定成本、上下文容量和输出长度 |
| Context Window | 决定能塞多少历史、文档和工具结果 |
| Temperature | 决定输出随机性 |
| Top-p / Top-k | 控制采样候选范围 |
| Stop Sequence | 控制模型在哪里停止 |
| System Prompt | 决定最高优先级行为约束 |

## 2. 为什么 Transformer 重要

面试里不必从零推导 Transformer，但要知道它为什么适合语言建模：

- **Self-Attention**：每个 token 可以关注上下文里的其他 token；
- **Multi-Head Attention**：不同头学习不同关系；
- **Positional Encoding**：给序列位置感；
- **Feed Forward Network**：在每个位置上做非线性变换；
- **LayerNorm / Residual**：让深层网络更稳定。

可以这样回答：

> Transformer 的核心是注意力机制，它让模型在生成每个 token 时动态关注上下文中的相关信息。工程上，这直接影响上下文窗口、长文本理解、RAG 片段排序和推理成本。

## 3. LLM 为什么会幻觉

幻觉不是一个单点 bug，而是多因素叠加：

| 原因 | 解决思路 |
|:--|:--|
| 训练语料没有事实 | RAG、工具查询 |
| Prompt 不约束来源 | 要求引用上下文 |
| 采样太发散 | 降低 temperature |
| 上下文过长稀释 | 分块、摘要、重排 |
| 问题本身模糊 | 先澄清再回答 |

不要说“换个更大的模型就不会幻觉”。更好的说法是：

> 我会把幻觉治理分成输入、检索、生成、评测四层：输入侧澄清意图，检索侧提供证据，生成侧强制基于上下文，评测侧用 faithfulness 和人工 bad case 回归。

## 4. 上下文窗口不是越大越好

长上下文能塞更多内容，但代价也明显：

- prefill 更慢；
- token 成本更高；
- 重要信息可能 lost in the middle；
- 工具结果和文档片段混在一起更难控制。

生产系统通常会组合：

```text
短期历史 -> 摘要
外部知识 -> RAG 检索
关键信息 -> 结构化状态
长文档 -> 分块 + 重排
```

## 5. 你真正要掌握的基础题

| 问题 | 答题要点 |
|:--|:--|
| Token 是什么？ | 文本切分后的模型处理单位，影响成本和上下文 |
| Temperature 怎么调？ | 事实问答低温，创意生成高温 |
| Top-p 是什么？ | 从累计概率候选集合中采样 |
| 为什么需要 KV Cache？ | 避免每次生成都重复计算历史 token |
| LLM 和传统 NLP 有什么不同？ | 从任务模型转向通用生成模型和 Prompt 编程 |

## 6. 本章产出

学完这一章，建议写一页自己的速记卡：

- Token 如何影响成本；
- 上下文窗口如何影响 RAG；
- 幻觉如何治理；
- Transformer 为什么适合语言任务；
- 推理时哪些参数影响稳定性。

