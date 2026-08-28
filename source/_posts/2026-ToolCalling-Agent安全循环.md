---
title: Tool Calling Agent 实战：从工具调用到安全执行循环
date: 2026-08-18 09:00:00
categories:
  - AI 应用实战
tags:
  - Agent
  - Tool Calling
  - Python
description: 不依赖复杂 Agent 框架，实现工具定义、参数校验、执行白名单、循环上限、日志和失败处理。
---

Tool Calling 不是模型直接执行函数。模型只生成“希望调用哪个工具、参数是什么”，真正执行工具的是你的程序。这条边界决定了 Agent 能否被控制和审计。

## 最小工具集合

第一版只提供两个只读工具：搜索笔记和读取单篇笔记。

```python
def search_notes(query: str) -> list[dict]:
    """Search note metadata by query."""
    ...

def get_note(note_id: str) -> dict:
    """Read one note by its public identifier."""
    ...
```

不要一开始提供删除文件、发送邮件或执行任意命令。工具越少，越容易写清楚参数、权限和测试。

## 一个完整执行循环

```text
用户消息
  -> 模型选择工具
  -> 程序校验工具名与参数
  -> 执行工具
  -> 将结果作为 tool 消息加入历史
  -> 模型决定继续调用或给出答案
```

Ollama 当前官方工具调用文档覆盖单工具、并行工具和多轮 Agent loop。无论使用哪个 SDK，程序都应维护明确的工具注册表。

```python
TOOLS = {
    "search_notes": search_notes,
    "get_note": get_note,
}

for step in range(3):
    response = chat(model=MODEL, messages=messages, tools=list(TOOLS.values()))
    messages.append(response.message)

    if not response.message.tool_calls:
        return response.message.content

    for call in response.message.tool_calls:
        function = TOOLS.get(call.function.name)
        if function is None:
            raise UnknownTool(call.function.name)
        result = function(**call.function.arguments)
        messages.append({
            "role": "tool",
            "tool_name": call.function.name,
            "content": json.dumps(result, ensure_ascii=False),
        })

raise StepLimitExceeded("Agent 超过最大执行步数")
```

## 参数必须由程序验证

工具描述不是安全边界。使用 Pydantic 或 JSON Schema 验证类型、长度、枚举和格式；再做业务授权，例如当前用户是否有权读取这个 `note_id`。

模型生成的路径、URL、SQL 和命令都应视为不可信输入。

## 设置资源上限

至少限制：

- 最大循环步数；
- 单工具超时；
- 单次返回数据大小；
- 并行工具数量；
- 整个请求的 token 和时间预算。

工具失败时返回结构化错误，让模型知道是“未找到、无权限、超时”还是“参数错误”。不要把内部堆栈直接交给模型或用户。

## 保存可审计记录

一次执行应该能还原：用户请求、模型版本、工具名、参数摘要、授权结果、开始结束时间、工具返回摘要和最终状态。敏感字段需要脱敏。

有了完整记录，才能回答“为什么调用了这个工具”和“失败发生在哪一步”。

## 测试场景

1. 正常搜索后读取笔记；
2. 模型请求不存在的工具；
3. 参数类型错误；
4. 工具超时；
5. 连续重复同一个调用；
6. 用户诱导读取无权限数据；
7. 达到最大步骤后仍未结束。

这些测试比展示一次成功对话更能说明 Agent 的工程质量。

## 官方资料

- [Ollama：Tool calling](https://docs.ollama.com/capabilities/tool-calling)
- [OpenAI API：Function calling](https://platform.openai.com/docs/guides/function-calling)

Agent 的核心不是“自主”，而是模型选择能力与程序控制边界之间的协议。
