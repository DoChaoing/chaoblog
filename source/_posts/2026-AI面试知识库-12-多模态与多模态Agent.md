---
title: "AI 面试知识库 12：多模态与多模态 Agent"
date: 2026-07-07 20:00:00
author: Chao
tags:
  - Multimodal AI
  - Vision Language Model
  - OCR
  - AI Agent
categories:
  - AI Career
photos:
  - https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200
---

> **TL;DR** — 多模态面试要覆盖 CLIP、视觉语言模型、OCR、文档理解、图文检索、视频理解和视觉 Agent 工具链。

多模态是 `ai-interview-guide` 相比 Agent 专项仓库补充的重要模块。

---

## 1. 多模态模型

基本架构：

```text
图像 -> Vision Encoder -> Projector / Resampler -> LLM -> 输出
```

CLIP 用图文对比学习实现图文对齐，适合 zero-shot 分类和图文检索。LLaVA、GPT-4V、Gemini、Qwen-VL 等更偏视觉问答和推理。

---

## 2. 多模态 RAG

```text
文档/图片 -> OCR/版面解析 -> 文本向量 + 图片向量 + 元数据 -> 多路检索 -> 多模态回答
```

难点：

- OCR 噪声；
- 表格结构；
- 图片证据引用；
- 多图上下文成本；
- 版面关系。

---

## 3. 视觉 Agent

工具集：

- 截图；
- OCR；
- 目标检测；
- 坐标点击；
- 图像差异检测；
- 表格抽取；
- 图片检索。

应用：发票报销、UI 自动化、商品理解、内容审核、视频摘要。

---

## 面试速答

> 多模态 Agent 不只是让模型看图，而是把视觉理解结果变成可执行动作。系统要处理置信度、坐标校验、权限和失败回滚。

---

## 参考资料

- [guocong-bincai/ai-interview-guide](https://github.com/guocong-bincai/ai-interview-guide)

