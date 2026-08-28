---
title: FastAPI 构建 AI 服务：响应模型、超时、测试一次讲清
date: 2026-08-16 09:00:00
categories:
  - AI 应用实战
tags:
  - Python
  - FastAPI
  - AI 应用
description: 把模型调用封装成可测试的 FastAPI 服务，覆盖请求校验、响应模型、超时、错误映射、健康检查和 TestClient 测试。
---

AI Demo 常把模型调用直接写进路由：收到文本、调用模型、返回字符串。它能演示，却很难测试、替换模型或定位失败。一个最小但清晰的服务应该分开 HTTP、业务逻辑和模型适配器。

## 目标接口

实现两个端点：

- `GET /health`：只检查服务进程是否可用；
- `POST /summaries`：接收文本并返回固定结构。

不要让健康检查每次都生成文本，否则监控本身会消耗昂贵推理资源。

## 定义请求和响应

```python
from pydantic import BaseModel, Field

class SummaryRequest(BaseModel):
    text: str = Field(min_length=1, max_length=20_000)

class SummaryResponse(BaseModel):
    summary: str
    model: str
    input_chars: int
```

FastAPI 的 `response_model` 不只是文档，它会校验和过滤返回数据，避免内部字段意外暴露。

## 路由保持薄

```python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/summaries", response_model=SummaryResponse)
def summarize(request: SummaryRequest):
    try:
        text = summary_service.run(request.text)
    except ModelTimeout as exc:
        raise HTTPException(status_code=504, detail="模型响应超时") from exc
    except ModelUnavailable as exc:
        raise HTTPException(status_code=503, detail="模型服务不可用") from exc

    return SummaryResponse(
        summary=text,
        model=summary_service.model_name,
        input_chars=len(request.text),
    )
```

路由负责协议：校验输入、映射 HTTP 状态和构造响应。Prompt、重试和模型选择放在 service 或 adapter 层。

## 超时比重试更重要

模型调用可能长时间占用连接。客户端和服务端都应设置超时。重试只适用于暂时性错误，并且应限制次数、增加退避；输入错误和 Schema 错误不应盲目重试。

还要考虑客户端断开后是否继续推理。长任务可以转为队列任务，但不要为了“架构完整”一开始就引入队列。

## 使用 TestClient 测试协议

FastAPI 官方测试文档使用 `TestClient` 编写普通 pytest 测试。

```python
from fastapi.testclient import TestClient

client = TestClient(app)

def test_empty_text_is_rejected():
    response = client.post("/summaries", json={"text": ""})
    assert response.status_code == 422

def test_model_timeout(monkeypatch):
    monkeypatch.setattr(summary_service, "run", raise_timeout)
    response = client.post("/summaries", json={"text": "hello"})
    assert response.status_code == 504
```

模型适配器用 mock 测试大部分错误路径，真实模型只保留少量集成测试。否则测试速度和稳定性都受模型影响。

## 最低可观测性

日志至少包含请求 ID、模型名、输入 token 数、输出 token 数、耗时、状态和错误类型。不要默认记录完整 Prompt、个人数据或密钥。

## 上线前检查

- 请求大小有限制；
- 超时和并发有上限；
- 错误不会泄露内部堆栈；
- 响应通过模型校验；
- 关键失败路径有测试；
- 日志不包含敏感原文。

## 官方资料

- [FastAPI：Response Model](https://fastapi.tiangolo.com/tutorial/response-model/)
- [FastAPI：Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [FastAPI：Handling Errors](https://fastapi.tiangolo.com/tutorial/handling-errors/)
