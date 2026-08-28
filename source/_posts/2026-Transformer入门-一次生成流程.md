---
title: Transformer 入门：一次文本生成经历了什么
date: 2026-08-13 09:00:00
categories:
  - AI 学习路线
tags:
  - LLM
  - Transformer
  - Attention
description: 从输入、位置、Attention、前馈网络到 KV Cache，解释 Decoder-only Transformer 完成一次文本生成的主要步骤。
---

理解 Transformer 不需要一开始推完所有公式。先沿着一次请求走完数据流，再回头学习矩阵计算，会更容易知道每个模块解决什么问题。

## 1. 输入被整理成模型能接受的序列

聊天应用通常会先用 chat template 把 system、user、assistant 消息转换为模型训练时熟悉的格式，然后由 tokenizer 生成 token ID。

不同模型的特殊标记和消息模板可能不同。直接拼字符串虽然有时能运行，却可能破坏角色边界或停止条件。使用模型仓库提供的 tokenizer 和 chat template 更可靠。

## 2. Token Embedding 加上位置信息

每个 token ID 会被映射成向量。模型还必须知道顺序，否则“猫追狗”和“狗追猫”只包含相同 token。原始 Transformer 使用位置编码，现代模型也常使用旋转位置编码等方案。

位置信息不只是一个配置数字。扩大上下文长度可能涉及位置编码、训练分布、KV Cache 显存和注意力计算成本，不能只修改一个上限就假设效果保持不变。

## 3. Masked Self-Attention 只查看已经出现的内容

Decoder-only 模型在生成当前位置时不能偷看未来 token，因此使用 causal mask。每一层会根据 Query、Key、Value 计算信息应该如何混合。

可以把多头注意力理解为：多个并行的信息通道使用不同投影寻找关系，最后合并。它并不保证每个头都对应一个人类可命名的语法规则。

## 4. 前馈网络处理每个位置

Attention 主要在 token 之间传递信息，前馈网络则对每个位置的表示进行非线性变换。残差连接和归一化帮助深层网络稳定训练和传播信息。

一个 Transformer Block 大致重复：

```text
输入
  -> 归一化
  -> Self-Attention
  -> 残差连接
  -> 归一化
  -> 前馈网络
  -> 残差连接
```

不同模型会调整归一化位置、激活函数、注意力结构和专家模块，但整体数据流仍可以从这个骨架理解。

## 5. 输出层预测下一个 Token

最后一层隐藏状态经过投影得到词表 logits，再由解码策略选出下一个 token。新 token 被接回序列，模型继续生成，直到遇到停止标记、达到长度限制或被应用主动终止。

## 6. KV Cache 为什么能加速生成

如果每生成一个 token 都重新计算全部历史 Key 和 Value，会产生大量重复工作。KV Cache 保存前面 token 在各层的 Key/Value，后续步骤只计算新 token 对应部分。

代价是显存会随层数、序列长度、并发请求和缓存数据类型增长。长上下文服务经常不是模型权重放不下，而是并发时 KV Cache 成为瓶颈。

## Prefill 和 Decode 要分开看

- Prefill：一次处理完整输入，计算量通常较集中；
- Decode：逐 token 生成，延迟更受内存带宽、缓存访问和调度影响。

因此压测至少应分开记录首 token 延迟和后续生成速度。只报告“总共用了几秒”，很难判断系统到底慢在哪里。

## 建议做的三个实验

1. 固定输出长度，逐渐增加输入长度，记录首 token 延迟；
2. 固定输入，增加输出长度，记录每秒输出 token；
3. 固定请求内容，增加并发，记录吞吐量和 P95 延迟。

每次只改变一个变量，并保存模型、量化、硬件、上下文和采样参数。

## 面试时怎么解释

用一句话概括：Decoder-only Transformer 把上下文编码成隐藏表示，通过多层因果自注意力和前馈网络预测下一个 token；推理时利用 KV Cache 避免重复计算历史状态。

如果继续追问，再分别展开 tokenizer、位置编码、Attention、解码和缓存，不要从公式背诵开始。

## 原始资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Hugging Face：Generation strategies](https://huggingface.co/docs/transformers/main/en/generation_strategies)
- [Hugging Face Transformers 文档](https://huggingface.co/docs/transformers/)
