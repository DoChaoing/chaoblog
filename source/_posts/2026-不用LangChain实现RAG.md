---
title: 不用 LangChain，自己实现一个可评测的最小 RAG
date: 2026-08-17 09:00:00
categories:
  - AI 应用实战
tags:
  - RAG
  - Python
  - 向量检索
description: 从文档切分、Embedding、检索、引用到 Recall@k 评测，实现一个能解释失败原因的最小 RAG 系统。
---

学习 RAG 时，最重要的不是先接聊天模型，而是先证明检索能找到正确资料。框架可以减少代码，但也容易把切分、索引和召回错误藏在链式调用后面。

## 最小系统边界

第一版只处理一组 Markdown 文档，并实现：

```text
文档 -> 切分 -> Embedding -> 向量索引
问题 -> Embedding -> Top-k 检索 -> 返回片段和来源
```

先不生成答案。检索结果稳定后，再把片段交给模型。

## 文档切分要保存来源

每个 chunk 至少保存：

- `chunk_id`；
- 文件路径；
- 标题或章节；
- 原始文本；
- 起止位置或页码；
- 文档版本。

固定字符数切分可以作为基线，但标题、段落和代码块边界通常比任意位置更有意义。重叠能减少信息被边界切断的问题，也会增加重复召回和索引体积。

## 检索接口应该足够简单

```python
from dataclasses import dataclass

@dataclass
class SearchHit:
    chunk_id: str
    text: str
    source: str
    score: float

def search(query: str, top_k: int = 5) -> list[SearchHit]:
    query_vector = embedder.encode(query)
    return vector_store.search(query_vector, top_k=top_k)
```

把 Embedding 和向量库放在接口后面，便于替换方案时保持评测流程不变。

## 用问题集评测检索

为每个问题标记至少一个相关 chunk，形成小型 golden set：

```json
{"query": "如何设置模型超时？", "relevant": ["api-timeout-01"]}
```

RAG 把多个片段交给模型时，Recall@k 是很实用的第一项指标：前 k 个结果中是否包含至少一个相关片段。Qdrant 当前检索评测文档还建议根据场景选择 MRR 或 NDCG@k；k 应与真实传给模型的片段数量一致。

## 再加入答案生成

Prompt 明确要求：只能根据提供片段回答；证据不足就说明不知道；每个关键结论附来源 ID。返回结果包含：

```json
{
  "answer": "...",
  "citations": ["api-timeout-01"],
  "retrieved_chunks": ["..."]
}
```

引用存在不代表引用支持结论，还要检查 citation correctness。

## 什么时候加入混合检索和重排

Dense 检索擅长语义相似，Sparse/BM25 对产品编号、函数名和精确关键词更敏感。Qdrant 当前 Query API 支持 dense 与 sparse 的混合检索，并使用 RRF 或 DBSF 融合；在候选集合上再使用 reranker，可以提高精度，但会增加延迟与计算成本。

不要因为“混合检索更先进”就直接启用。先分别测 dense-only、sparse-only 和 hybrid，确认它在自己的问题集上确实改善指标。

## 常见失败顺序

1. 文档根本没有答案；
2. 切分破坏了关键信息；
3. Embedding 不适合语言或领域；
4. Top-k 太小或过滤条件错误；
5. 检索正确，但生成忽略证据；
6. 引用存在，但并不支持答案。

按照链路定位问题，比不断修改 Prompt 更有效。

## 官方资料

- [Qdrant：Measuring Retrieval Relevance](https://qdrant.tech/documentation/improve-search/retrieval-relevance/)
- [Qdrant：Hybrid Queries](https://qdrant.tech/documentation/search/hybrid-queries/)
- [Qdrant：Hybrid Search with Reranking](https://qdrant.tech/documentation/tutorials-basics/reranking-hybrid-search/)
