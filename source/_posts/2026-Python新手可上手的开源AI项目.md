---
title: Python 新手学 AI：7 个两天内能做完的开源项目
date: 2026-08-11 10:00:00
categories:
  - AI 应用实战
tags:
  - Python
  - 开源项目
  - AI 入门
  - RAG
  - Agent
description: 为 Python 新手选择 7 个两天内可完成的 AI 开源项目，覆盖模型调用、Gradio、FastAPI、RAG、Agent 和模型原理。
---

新手学 AI 最容易做错的一件事，是一上来就克隆一个“全栈 Agent 平台”。装好二十个依赖、填完三个 API Key，页面能聊天，却不知道模型、检索、工具和服务各自做了什么。

更好的开始方式是：一次只引入一个新变量，并留下一个能验证的结果。下面七个项目不是“必装工具”，而是一条由浅到深的 Python 练习阶梯。

![Python 开源 AI 项目学习阶梯](/images/ai-learning/python-ai-project-ladder.svg)

这张图有一个刻意的设计：它不是“工具排行榜”。前四步在回答“模型能力如何被人和程序使用”，后面三步才分别处理资料、工具和原理。每完成一个项目，先把它的输入、输出和失败情况说清楚，再进入下一步。

## 先准备什么

会写函数、读 JSON、创建虚拟环境就够开始。建议使用 Python 3.10+；把每个练习放进独立目录，保存 `requirements.txt` 或 `pyproject.toml`、运行命令和一组测试输入。

不需要一开始有 GPU。前四个练习可以使用小模型、已有 API 或本地 CPU；需要下载模型时，先看模型大小和许可，不要把“能拉下来”误认为“自己的电脑跑得动”。

## 选项目的标准

| 项目 | 你会学到什么 | 最小成果 | 不适合拿来做什么 |
|:--|:--|:--|:--|
| Transformers | 调用预训练模型 | 一个文本/图片/音频推理脚本 | 第一次就训练大模型 |
| Ollama Python | 本地模型请求与流式输出 | 本地问答命令行工具 | 绕开模型体积和硬件限制 |
| Gradio | 把 Python 函数做成界面 | 一个可上传文件的 demo | 复杂业务后台 |
| FastAPI | 类型化 API、错误处理、文档 | 一个带 `/health` 的 AI 接口 | 把业务逻辑全塞进路由函数 |
| Qdrant Client | 本地向量检索 | 一个能返回来源的迷你检索器 | 直接宣称“企业知识库” |
| smolagents | 受限工具调用 | 只读两工具 Agent | 未经确认的写操作 |
| Tiny-Universe | 从原理手写 LLM 组件 | 跑通一个 Tiny 模块 | 把它当作生产框架 |

## 先建立一张心智地图：AI 应用不是一个聊天框

一段能调用模型的 Python 代码，只解决了最内层的问题。真正面向使用者的 AI 功能，还要处理输入是否合法、模型挂了怎么办、资料从哪里来、模型能调用哪些工具，以及出了问题如何追踪。

![从 Python 脚本到可靠 AI 应用](/images/ai-learning/from-script-to-ai-app.svg)

所以这篇文章的顺序不是随意排列：先用 `Transformers` 或 Ollama 验证“模型能做什么”，再用 Gradio/FastAPI 把它包成可用能力；确认检索本身可靠后才接 RAG；最后才尝试 Agent。**Agent 不是起点，而是把已经验证过的能力组织起来。**

## 1. Transformers：先让一个预训练模型完成单一任务

[Hugging Face Transformers](https://github.com/huggingface/transformers) 的 `pipeline` 是很好的第一站：同一套 Python 接口可以尝试文本生成、分类、语音识别和图像分类。

第一天只选一个任务。例如做“评论情感分析”：读入十条自己写的文本，输出标签与置信度，并把结果保存为 JSON。然后故意加入反讽、空字符串和中英混合文本，观察失败情况。

```python
from transformers import pipeline

classifier = pipeline("sentiment-analysis")
print(classifier("This update is surprisingly useful."))
```

上面这段代码的价值不在于短，而在于它把边界暴露得很清楚：**输入是字符串，输出是标签和分数，模型文件会首次下载到本地。** 先打印十条结果，再决定要不要做界面。

这个练习的目标不是做一个漂亮聊天框，而是理解模型调用的输入、输出、模型下载和失败边界。模型输出是预测，不是事实；不要据此自动删除评论或给用户打标签。

> **验收问题：**我能否举出两条模型判断不可靠的样本，并说明为什么不能把这个输出当作事实？

## 2. Ollama Python：用本地模型做一个命令行小工具

[ollama-python](https://github.com/ollama/ollama-python) 是官方 Python 客户端，适合把已运行的 Ollama 模型接进脚本。它支持普通和流式聊天，也有异步客户端。

一个足够好的练习是“本地文本改写器”：命令行读取一段 Markdown，要求模型给出标题、三条摘要和待核实问题；把请求、模型名和输出写到本地文件。不要让模型直接修改原文件。

先在一个小模型上跑通。若内存不足，缩短输入或换更小模型，而不是反复重试。这里学到的是本地服务、流式响应与可重放输入，不是比较哪个模型最强。

> **验收问题：**关闭本地模型服务时，你的脚本能否给出“服务不可用”的提示，而不是一串难懂的异常？

## 3. Gradio：把函数变成可试用的 demo

[Gradio](https://github.com/gradio-app/gradio) 可以把任意 Python 函数包装成 Web 界面，适合检验功能是否真的可被人使用。

延续上一步，把文本改写器改成一个页面：左侧输入文本，右侧显示结构化结果；当输入为空、超过长度限制或模型不可用时，给出明确提示。只要一个 `Interface` 或很小的 `Blocks` 页面就够了。

验收方式很简单：让一位朋友不用解释就完成一次输入、看到失败提示、复制结果。能被使用比动画和渐变更重要。

这里要练的不是前端框架，而是产品的最小闭环：用户看到输入框，系统给出结果，失败时能知道下一步该做什么。

## 4. FastAPI：把 demo 收敛成可测试的服务

[FastAPI](https://github.com/fastapi/fastapi) 适合作为 Python AI 功能的服务层：类型声明会生成交互文档，Pydantic 可校验请求和返回值。

不要直接做“聊天 API”。先写两个端点：`GET /health` 返回服务状态，`POST /summaries` 接收文本并返回一个固定 Schema。为超长文本、非法 JSON 和模型超时写测试。模型调用放在单独的 service 模块，路由只负责请求/响应和 HTTP 错误。

完成后再让 Gradio 调用这个 API。这样你能清楚地区分界面、服务、模型和存储，而不是所有代码都挤在一个 `app.py`。

```python
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/summaries")
def summarize(request: SummaryRequest) -> SummaryResponse:
    return summary_service.run(request)
```

这两个接口分别回答两个不同的问题：服务是否活着？输入是否符合约定、输出是否符合约定？把模型调用藏在 `summary_service` 中，日后替换模型时就不会牵动 HTTP 层。

## 5. Qdrant Client：做一个带来源的迷你检索器

很多 RAG 教程的第一步就让你装 Docker、向量库、框架和工作流。对新手来说，[Qdrant Python Client](https://github.com/qdrant/qdrant-client) 的本地模式更合适：它可以在内存或本地路径运行，之后再切换到服务模式。

练习用 5 篇自己写的短 Markdown 文档完成：

1. 给每篇文档分配 ID、标题和路径；
2. 生成向量并写入本地集合；
3. 输入问题后返回最相关的三段文本和来源；
4. 如果最高分不足阈值，返回“未找到足够资料”。

先把检索结果打印出来，不要急着接模型生成答案。你能解释“为什么这段被找回”之后，再谈 RAG。

可以把一次查询想成下面这个小闭环：

`问题 → 向量化 → Top-k 文档片段 → 分数阈值判断 → 文本 + 文件来源`

最后一步很关键。如果没有达到阈值，就明确说“资料不足”；不要让模型凭空补一段看似流畅的答案。

## 6. smolagents：只做一个受限的工具调用 Agent

[smolagents](https://github.com/huggingface/smolagents) 提供了较小的 Agent 实现，既有生成 Python 调用的 `CodeAgent`，也有输出结构化工具调用的 `ToolCallingAgent`。它适合在已经完成 API 与检索练习后，学习“模型如何选择工具”。

第一版只给两个只读工具：`search_notes(query)` 和 `get_note(id)`。设置最多三步；工具返回空结果时必须结束；所有调用记录到日志。不要接文件删除、邮件发送、浏览器控制或任何带副作用的工具。

特别要注意：模型生成的 Python 代码不应默认在宿主机执行。工具的参数、权限和执行环境要由程序控制；Agent 是一个需要测试的流程，不是一句 Prompt。

把 Agent 的一次运行当成可审计的记录，而不是魔法：`用户问题 → 工具选择 → 工具参数 → 工具返回 → 最终回答`。当这个记录能完整保存下来时，你才有能力修复“它为什么答错”。

## 7. Tiny-Universe：想知道原理时，再做白盒练习

[Datawhale Tiny-Universe](https://github.com/datawhalechina/tiny-universe) 覆盖手写 Transformer、Tiny LLM、RAG、Agent 和 Eval，目标是让学习者看见底层实现，而不是只调用封装框架。

它适合已经完成前面两三个小项目、并且愿意读 PyTorch 代码的人。推荐只选一个模块：例如 Tiny Transformer 或 Tiny RAG。给自己一个限制：读懂并改动一个函数，再写一条测试，而不是把整个仓库一次跑完。

## 一个四周节奏

| 周 | 项目 | 交付物 |
|:--|:--|:--|
| 第 1 周 | Transformers + Ollama | 两个可重复运行的命令行脚本和十条样本 |
| 第 2 周 | Gradio + FastAPI | 一个 demo、一个 API、基础测试与错误提示 |
| 第 3 周 | Qdrant Client | 五篇文档的本地检索、来源列表和拒答阈值 |
| 第 4 周 | smolagents 或 Tiny-Universe | 工具 trace，或一份带注释的原理实验 |

完成四周后再选方向：想做产品，就加强评测、权限和部署；想理解模型，就继续 tokenizer、attention 和训练循环；想微调开源模型，再看 [Self-LLM](https://github.com/datawhalechina/self-llm) 与 [LLaMA-Factory](https://github.com/hiyouga/LLaMA-Factory)。

真正的作品集不需要七个仓库。一个有 README、样本、错误处理、测试和已知限制的小项目，比一串“已学过 LangChain、RAG、Agent”的截图更有说服力。
