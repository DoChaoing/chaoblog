---
title: Ollama + Python 实战：让本地模型稳定返回结构化 JSON
date: 2026-08-15 09:00:00
categories:
  - AI 应用实战
tags:
  - Python
  - Ollama
  - 结构化输出
description: 使用 Ollama、Pydantic 和 JSON Schema 构建本地信息抽取工具，并处理校验、重试和模型不可用等失败情况。
---

让模型输出一段 JSON 很容易，让程序长期收到符合约定的数据并不容易。正确做法不是在 Prompt 里反复强调“只输出 JSON”，而是用 Schema 约束输出，再用类型系统验证。

## 项目目标

输入一段会议记录，输出：标题、行动项、负责人和截止日期。验收标准：

- 返回内容能被 Pydantic 解析；
- 缺少负责人或日期时允许为空，而不是编造；
- 模型服务不可用时给出明确错误；
- 保存原始输入、模型名和校验结果。

## 定义数据结构

```python
from pydantic import BaseModel, Field

class ActionItem(BaseModel):
    task: str = Field(min_length=1)
    owner: str | None = None
    due_date: str | None = None

class MeetingNotes(BaseModel):
    title: str
    actions: list[ActionItem]
```

字段是否允许为空必须根据业务定义。如果模型不知道负责人，把它设置为 `None` 比猜一个名字更可靠。

## 调用 Ollama

Ollama 当前官方文档支持把 JSON Schema 传给 `format`，并建议使用 Pydantic 的 `model_json_schema()` 复用结构。

```python
from ollama import chat

def extract_notes(text: str) -> MeetingNotes:
    response = chat(
        model="qwen3",
        messages=[{
            "role": "user",
            "content": f"提取会议行动项。未知字段保持为空。\n\n{text}",
        }],
        format=MeetingNotes.model_json_schema(),
        options={"temperature": 0},
    )
    return MeetingNotes.model_validate_json(response.message.content)
```

Schema 约束降低格式漂移，但不保证业务事实正确。类型通过只表示字段形状正确，不表示负责人、日期和任务来自原文。

## 错误处理

至少区分三类错误：

1. 连接错误：Ollama 未启动或端口不可达；
2. 校验错误：模型返回不符合 Schema；
3. 业务错误：结构正确，但结果与原文不一致。

校验失败可以重试一次，并把错误信息作为修正上下文。不要无限重试；达到上限后保存原始输出，方便复盘。

## 测试用例

准备五类输入：正常会议、没有行动项、负责人未知、日期格式混乱、恶意要求忽略 Schema。断言不仅检查 HTTP 成功，还要检查字段是否来自原文。

```python
def test_unknown_owner_stays_empty():
    result = extract_notes("下周完成检索评测，负责人待定。")
    assert result.actions[0].owner is None
```

涉及模型的测试可能不稳定。工程中可以把 Ollama 客户端放在单独模块，单元测试使用固定响应，另外保留少量真实模型集成测试。

## 何时使用结构化输出

适合信息抽取、分类、表单填充、API 参数和工作流状态；不适合把所有自然语言都塞进巨大 Schema。Schema 越复杂，越需要针对目标模型验证支持情况和错误率。

## 官方资料

- [Ollama：Structured Outputs](https://docs.ollama.com/capabilities/structured-outputs)
- [Pydantic：Models](https://docs.pydantic.dev/latest/concepts/models/)

下一步：把这个函数包装成一个带响应校验和测试的 FastAPI 服务。
