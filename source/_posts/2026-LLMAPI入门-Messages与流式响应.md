---
title: LLM API 调用入门：messages、流式响应与错误处理
date: 2026-11-19 09:00:00
categories:
  - AI 学习路线
tags:
  - LLM
  - API
  - Python
description: 从 messages 结构到流式响应到限流重试：调 LLM 接口和调普通 Web API 的差异，一次写清楚并给出可用的最小实现。
---

调用 LLM API 表面上和调用普通 REST API 没区别，实际上有三个本质差异：**输入是累积的对话历史**、**输出是逐 token 流出的**、**错误需要专门的重试策略**。这篇从零写一个能上生产的调用层。

## 准备：API Key 的正确放法

Key 从平台控制台创建（以 Claude 为例是 console），放到环境变量：

```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxx
```

三条纪律：不写进代码、不提交进 git、用 `.env` 文件时确认它被 `.gitignore` 覆盖。泄漏的 key 会被人拿来烧你的账单，平台也建议按项目分 key 方便单独吊销和限额。

## messages：多轮对话要自己维护

LLM API 无状态。所谓"多轮对话"，是你把历史全部重发一遍：

```python
import anthropic

client = anthropic.Anthropic()  # 自动读 ANTHROPIC_API_KEY

messages = [{"role": "user", "content": "用一句话解释什么是上下文窗口"}]

response = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=1024,        # 必填：本次最多生成多少 token
    system="你是一个简洁的技术助手",  # 可选：系统提示，设定行为
    messages=messages,
)
print(response.content[0].text)

# 第二轮：必须手动把第一轮拼进历史
messages.append({"role": "assistant", "content": response.content[0].text})
messages.append({"role": "user", "content": "那它和 KV Cache 有什么关系？"})
response = client.messages.create(
    model="claude-sonnet-5-5", max_tokens=1024, messages=messages
)
```

三个角色：`system`（全局行为约束）、`user`、`assistant`。忘记追加历史，模型就"失忆"；顺序错乱会直接报 4xx。上一篇文章（上下文与 Token 计费）讲过：这份历史每轮全量计费，所以对话越长越贵，生产代码要考虑裁剪或摘要。

## 流式响应

非流式调用要等整个回复生成完才返回，长回复可能等十几秒。流式把生成过程拆成事件推送（SSE），首字延迟降到几百毫秒：

```python
with client.messages.stream(
    model="claude-sonnet-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "写一首关于上下文的五言诗"}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

什么时候必须流式：聊天界面的打字机效果（用户等待体感）、Agent 需要尽早展示中间过程。什么时候不必：后台批处理、需要完整 JSON 一次解析的场景。

## 错误处理：LLM API 的特色

普通 API 的 4xx 都是"你的错"，LLM API 还有一类"**现在不行，待会儿再试**"：

| 状态 | 含义 | 处理 |
|---|---|---|
| 401 / 403 | key 无效或无权限 | 停止，检查配置 |
| 400 | 请求结构错误（messages 顺序、超限） | 修代码，别重试 |
| 413 | 输入超上下文窗口 | 裁剪历史 |
| 429 | 限流（rate limit） | 指数退避重试 |
| 5xx / 529 | 服务端错误或过载 | 指数退避重试 |

```python
import time

def chat_with_retry(messages, max_retries=4):
    for attempt in range(max_retries):
        try:
            return client.messages.create(
                model="claude-sonnet-5-5", max_tokens=1024, messages=messages
            )
        except anthropic.RateLimitError:
            wait = 2 ** attempt          # 1s, 2s, 4s, 8s
            time.sleep(wait)
    raise RuntimeError("重试耗尽，检查配额")
```

官方 SDK 自带自动重试，这里手写是为了说清逻辑。注意 400 无论如何都不要重试——结构错误重试一万次还是错。

## 成本预估

调用前心里要有数：

```text
成本 ≈ (输入 token 数 × 输入单价) + (预期输出 token 数 × 输出单价)
```

`max_tokens` 就是你的输出成本上限。开发阶段用 `response.usage` 里的 input_tokens / output_tokens 核对真实消耗，和估算对不齐时先查这一步。

## 官方资料

- [API 总览](https://platform.claude.com/docs/en/api/overview)
- [Messages API 参考](https://platform.claude.com/docs/en/api/messages)
- [流式响应](https://platform.claude.com/docs/en/build-with-claude/streaming)
- [错误处理参考](https://platform.claude.com/docs/en/api/errors)

写好这四块——历史维护、流式、重试、成本预估——你就有了调 LLM 的地基，后面无论做 Agent 还是 RAG 都是往这份地基上加东西。
