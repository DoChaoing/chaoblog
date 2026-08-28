---
title: AI 入门第一课：Token、Embedding 和文本生成到底是什么
date: 2026-08-12 09:00:00
categories:
  - AI 学习路线
tags:
  - AI 入门
  - LLM
  - Tokenizer
description: 用一次完整文本生成过程解释 Token、Embedding、上下文、概率分布和解码，帮助初学者建立大模型最小心智模型。
---

刚接触大模型时，最容易把它理解成一个“会查资料的聊天程序”。更准确的起点是：语言模型接收一串 token，根据已有上下文计算下一个 token 的概率，再用某种解码策略选出结果。这个过程不断重复，最终形成文本。

## 第一步：文本先变成 Token

模型不直接读取汉字或单词。Tokenizer 会把文本拆成词、子词、字符或字节级单元，再映射成整数 ID。

```text
“学习大模型”
  -> [“学习”, “大”, “模型”]
  -> [3812, 317, 9281]
```

这只是示意。不同模型使用不同词表，同一句话得到的 token 数量可能不同。Hugging Face 当前文档列出的常见子词算法包括 BPE、Unigram 和 WordPiece；SentencePiece 还能直接处理没有空格分词习惯的中文、日文等文本。

Token 数量会影响三件事：上下文占用、请求成本和推理时间。因此，看到“支持 128K 上下文”时，应理解为 token 上限，而不是汉字数或单词数。

## 第二步：Token ID 变成向量

整数 ID 本身没有语义。Embedding 层会为每个 token 查找一个向量。训练过程中，模型逐渐把使用方式相近的 token 放到更有规律的向量空间中。

向量不是词典释义。“苹果”在水果、公司和品牌语境中的含义，需要结合前后文经过多层 Transformer 才能得到更适合当前位置的表示。

## 第三步：Attention 组合上下文

Self-Attention 让当前位置根据其他位置的信息更新自己的表示。可以先记住一个简化问题：

> 生成下一个 token 时，当前上下文中的哪些部分最值得参考？

Attention 不是一个可直接等同于“模型思考过程”的解释器。它是信息混合机制的一部分；模型的行为还受到多层变换、训练数据、目标函数和解码策略影响。

## 第四步：得到下一个 Token 的概率

模型最后输出词表中每个 token 的分数，经过 softmax 转成概率分布。

```text
“今天适合去” ->
  公园  0.31
  学校  0.18
  跑步  0.09
  ……
```

概率最高并不代表事实正确，只表示在模型学到的模式和当前上下文下，这个 token 更可能出现。

## 第五步：解码策略决定如何选择

Hugging Face 的生成文档区分了几种基础方法：

- Greedy search：每一步选择概率最高的 token，稳定但长文本可能重复；
- Sampling：按概率抽样，更有多样性，也更不稳定；
- Beam search：同时保留多个候选序列，更适合翻译、语音识别等有明确输入约束的任务。

`temperature`、`top_p` 等参数改变的是选择方式，不会给模型增加它没学过的知识。需要确定结构时，应优先使用 JSON Schema、类型校验和业务规则，而不是只把 temperature 调低。

## 一个最小验证实验

选择同一个模型和提示词，分别使用确定性生成与采样，连续运行五次，保存每次输出。

记录：

1. 输入 token 数；
2. 最大输出 token 数；
3. 解码参数；
4. 输出是否重复；
5. 事实是否一致。

完成这个实验后，你应该能解释：为什么同一个问题会得到不同回答，以及为什么“更随机”不等于“更聪明”。

## 常见误区

- Token 不是固定的汉字或单词；
- Embedding 相似不等于事实关系成立；
- 上下文更长不保证答案更好；
- 模型生成的是概率序列，不是数据库查询结果；
- 调整 temperature 不能替代检索、验证和结构约束。

## 官方资料

- [Hugging Face：Tokenization algorithms](https://huggingface.co/docs/transformers/main/en/tokenizer_summary)
- [Hugging Face：Generation strategies](https://huggingface.co/docs/transformers/main/en/generation_strategies)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)

下一篇建议阅读：[Transformer 入门：一次文本生成经历了什么](/2026/08/13/2026-Transformer入门-一次生成流程/)
