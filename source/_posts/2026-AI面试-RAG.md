---
title: RAG 面试高频问题：切分、检索、重排和评测怎么回答
date: 2026-08-20 09:00:00
categories:
  - AI 面试
tags:
  - AI 面试
  - RAG
  - 向量检索
description: 从完整链路回答 RAG 面试问题，覆盖文档切分、Embedding、混合检索、重排、引用、Recall@k 和故障定位。
---

RAG 面试最忌讳把答案缩成“文档向量化后放入向量数据库”。面试官通常会沿着数据进入、检索、生成和评测逐层追问。

## 问题一：完整 RAG 链路是什么

离线链路：解析文档、清洗、切分、生成向量、写入索引并保存来源元数据。

在线链路：理解问题、检索候选、过滤或重排、构造上下文、生成答案、返回引用并记录评测信号。

## 问题二：Chunk 大小怎么选

没有通用数字。Chunk 过小会丢失上下文，过大则混入无关内容、增加 token 和降低检索粒度。选择时考虑文档结构、问题粒度和模型上下文。

回答中应提出实验：固定问题集，比较不同切分策略的 Recall@k、答案正确率和 token 成本。

## 问题三：Dense、Sparse 和混合检索有什么区别

Dense 通过向量捕获语义相似，适合改写和同义表达；Sparse/BM25 对产品编号、函数名、专有名词和精确关键词更敏感。

混合检索可以同时获得两类候选，再用 RRF、DBSF 等方式融合。Qdrant 当前文档还支持 weighted RRF，但权重应该在训练/验证拆分的评测集上调整；没有评测集时，手调权重缺少依据。

## 问题四：为什么需要 Reranker

第一阶段检索追求较高召回率，Reranker 对较小候选集做更细致的 query-document 相关性判断，以提高排序精度。代价是额外延迟和计算，因此不对整个语料库运行。

## 问题五：RAG 如何评测

至少拆成两层：

- 检索：Recall@k、MRR、NDCG@k；
- 生成：答案正确性、忠实度、引用正确性和拒答表现。

Qdrant 当前检索评测建议：RAG 把 top-k 片段交给模型时优先关注 Recall@k；FAQ 只使用第一条结果时，MRR 或 Hits@1 更有意义。

## 问题六：为什么有引用仍可能答错

模型可能引用了不支持结论的片段，或把多个片段错误组合。必须分别检查“引用是否存在”和“引用是否蕴含答案”。

## 问题七：线上效果下降怎么排查

按顺序检查：原文是否有答案、解析是否完整、切分是否破坏语义、过滤条件是否错误、相关片段是否进入 top-k、重排是否改变正确结果、Prompt 是否要求基于证据回答。

一次只隔离一层，比直接更换模型更快。

## 一个合格回答模板

先给定义，再说取舍，然后给评测方法，最后指出边界。例如回答混合检索时，不只说“效果更好”，还要说明它对精确词和语义查询的互补、额外成本，以及如何用自己的数据判断是否值得启用。

## 官方资料

- [Qdrant：Measuring Retrieval Relevance](https://qdrant.tech/documentation/improve-search/retrieval-relevance/)
- [Qdrant：Hybrid Queries](https://qdrant.tech/documentation/search/hybrid-queries/)
- [Qdrant：Reranking](https://qdrant.tech/documentation/tutorials-basics/reranking-hybrid-search/)
