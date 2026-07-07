---
title: "AI 面试知识库 14：Python 工程与项目实战"
date: 2026-07-07 22:00:00
author: Chao
tags:
  - Python
  - FastAPI
  - Project Experience
  - RAG
categories:
  - AI Career
photos:
  - https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200
---

> **TL;DR** — AI 项目面试最终会落回工程基本功：asyncio、FastAPI SSE、Pydantic、重试、pytest、内存排查，以及项目指标。

两个仓库都强调项目，但角度不同：一个讲三语言 Agent 骨架，一个讲 RAG/Agent 项目实战和 Python 工程基础。

---

## 1. Python 工程高频点

- asyncio 并发外部调用；
- Semaphore 控制并发；
- timeout 和 retry；
- Pydantic v2 校验 LLM 输出；
- FastAPI SSE 流式响应；
- pytest + mock 测试 LLM 应用；
- 内存泄漏和 OOM 排查。

---

## 2. 项目模块

一个完整 AI 应用项目可拆成：

```text
API 层 -> Agent/RAG 核心 -> 工具系统 -> 记忆 -> 基础设施 -> ETL -> 观测
```

Python 适合 Agent 编排和 RAG 快速迭代；Java 适合企业集成；Go 适合高性能网关和流式代理。

---

## 3. 项目指标

面试不要只讲功能，要讲指标：

- Recall@K；
- Precision@K；
- P95；
- TTFT；
- token 成本；
- 缓存命中率；
- 转人工率；
- bad case 数量。

---

## 参考资料

- [bcefghj/ai-agent-interview-guide](https://github.com/bcefghj/ai-agent-interview-guide)
- [guocong-bincai/ai-interview-guide](https://github.com/guocong-bincai/ai-interview-guide)

