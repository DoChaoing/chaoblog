---
title: "AI 面试知识库 02：LLM 基础与 Transformer"
date: 2026-07-07 10:00:00
author: Chao
tags:
  - LLM
  - Transformer
  - Token
  - Interview
categories:
  - AI Career
photos:
  - https://images.unsplash.com/photo-1518770660439-4636190af2dd?w=1200
---

> **TL;DR** — LLM 基础题要答出工程影响：Token 影响成本，采样影响稳定性，上下文影响 RAG 和记忆，KV Cache 影响推理速度，Transformer 解释模型为什么能理解上下文。

AI 应用工程师不一定训练模型，但必须理解模型行为。很多线上问题都能回到基础机制：为什么幻觉、为什么慢、为什么贵、为什么输出不稳定。

---

## 1. Token、采样与上下文

**Token** 是模型输入输出的基本单位。它影响上下文长度、计费、延迟和截断策略。

**Temperature / Top-P / Top-K** 控制生成随机性：

- 事实问答、RAG、工具调用：低 temperature；
- 创意生成：可适当提高；
- 结构化输出：尽量稳定，避免 schema 漂移。

**Context Window** 不是越大越好。窗口越大，prefill 成本越高，注意力更稀释，还会带来 lost in the middle。生产系统通常会结合 RAG、摘要、裁剪和记忆。

---

## 2. Transformer 与 Attention

Transformer 的核心是 Self-Attention：

```text
输入 X -> Q/K/V -> 相似度 -> softmax -> 加权 V -> 输出表示
```

面试级解释：

- Q：当前 token 想找什么；
- K：其他 token 提供什么索引；
- V：真正被聚合的信息；
- Multi-Head：从多个子空间捕捉不同关系。

Encoder-only 模型常用于理解、分类、Embedding；Decoder-only 模型常用于生成；Encoder-Decoder 常用于文本转换。

---

## 3. 幻觉怎么产生

幻觉来自多个原因：

- 训练目标是预测 token，不是事实校验；
- 知识过期或缺失；
- 上下文证据不足；
- Prompt 约束弱；
- 采样随机性过高；
- 用户问题带错误假设。

缓解方式：

- RAG 提供证据；
- 引用来源；
- 低置信度拒答；
- 降低 temperature；
- 输出后校验；
- bad case 回归。

不要说“换更大模型就能解决”。更大模型能改善部分问题，但不能替代证据链和评测体系。

---

## 4. KV Cache 与推理基础

自回归生成每次只生成下一个 token。如果没有 KV Cache，每一步都要重新计算历史上下文。KV Cache 缓存历史 Key/Value，减少重复计算。

推理分两段：

- **Prefill**：处理输入上下文；
- **Decode**：逐 token 生成。

面试里常问：为什么长 prompt 首字慢？因为 prefill 长；为什么长输出慢？因为 decode 是逐步生成。

---

## 面试速答

如果被问“LLM 基础你怎么理解”，可以这样答：

> 我会从 token、上下文、采样和 Transformer 机制理解模型行为。做 AI 应用时，这些基础会直接影响成本、延迟、稳定性和幻觉治理，所以需要结合 RAG、Prompt、模型路由和评测一起设计。

---

## 参考资料

- [guocong-bincai/ai-interview-guide](https://github.com/guocong-bincai/ai-interview-guide)

