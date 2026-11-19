---
title: MCP 入门：协议拆解与开发第一个 MCP 工具
date: 2026-11-19 09:00:00
categories:
  - AI 应用实战
tags:
  - MCP
  - Claude Code
  - Python
description: MCP 是让 Agent 接入外部工具的开放协议：JSON-RPC 通信、三种原语、stdio 与 HTTP 两种传输。用一个可运行的最小 server 讲清楚，再讨论什么时候不该用它。
---

每个 AI 工具都在发明自己的插件协议，MCP（Model Context Protocol）的意义是把这件事标准化一次：你写的工具 server，Claude Code、各种 IDE 插件和任何支持协议的客户端都能用。理解它需要拆开三层：通信、原语、传输。

## 协议拆解

MCP 基于 JSON-RPC 2.0，一次工具调用链路是：

```text
Host（如 Claude Code）          MCP Server（你的工具服务）
        ├─ initialize 握手 ──────→
        ├─ tools/list ─────────→  返回工具清单（名称、描述、参数 schema）
        ├─ tools/call ─────────→  执行，返回结果
        └─（结果进入模型的上下文，模型基于它继续决策）
```

关键点：**模型永远不直接执行任何东西**。模型看到工具清单，决定"我想调哪个、参数是什么"，由 Host 发起真正的调用——和 Tool Calling 里的安全边界完全一致，MCP 只是把"工具从哪来"标准化了。

三种原语，用途不同：

| 原语 | 是什么 | 例子 |
|---|---|---|
| tools | 模型可以主动调用的操作 | 查笔记、发请求 |
| resources | 只读数据，由客户端挂载 | 文件内容、配置 |
| prompts | 预置的提示词模板 | 常用任务模板 |

实际开发里 90% 的价值在 tools，这篇也只做 tools。

## 传输：stdio 与 HTTP

- **stdio**：server 是本机命令，Host 起子进程通过标准输入输出通信。简单、安全边界清晰，适合个人和团队内部工具；
- **Streamable HTTP**：server 是远程服务，适合跨机器共享、需要集中鉴权和计费的场景。

个人工作流从 stdio 开始，不需要部署任何东西。

## 动手：一个最小 MCP Server

用官方 Python SDK 的 FastMCP 封装，十几行：

```python
# server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("notes")

@mcp.tool()
def search_notes(query: str) -> str:
    """在本地笔记库里搜索，返回最相关的 5 条标题和路径。"""
    # 真实实现里接你的检索逻辑
    return "1. 上下文管理笔记 (notes/context.md)\n2. ..."

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

注意 docstring 不是注释——它就是工具描述，模型靠它决定何时调用、怎么传参。这和 Skill 的 description 一个道理：**写给模型看的说明，质量决定命中率**。

## 接入 Claude Code

```bash
claude mcp add notes -- python /abs/path/to/server.py
```

等价的配置方式是项目根目录的 `.mcp.json`（进 git，全团队共享）：

```json
{
  "mcpServers": {
    "notes": {
      "command": "python",
      "args": ["/abs/path/to/server.py"]
    }
  }
}
```

重启会话后 `/mcp` 查看连接状态，工具会自动出现在模型的工具清单里。之后直接说"搜一下我关于上下文管理的笔记"即可。

## 什么时候不该用 MCP

MCP 不是把一切接到 AI 的默认答案：

- **固定的小操作**（部署、格式化、跑构建）做成 Skill 或脚本更轻——MCP server 要维护握手、生命周期，杀鸡用牛刀；
- **模型只需要读一次的数据**，直接把内容贴进对话或 CLAUDE.md；
- MCP 的适用场景是：工具**可复用、跨项目/跨应用共享、需要独立演进**（比如公司内部统一的数据查询服务）。

## 安全边界

MCP server 的返回值会直接进入模型上下文，这意味着：

- **提示注入面**：一个返回搜索结果的 server，其结果里可能藏着"忽略之前的指令"这类内容。工具返回视为不可信输入，和用户输入同级对待；
- **最小权限**：server 进程拥有你给它的全部权限，只读需求就只做只读实现；
- **审计**：工具调用要能追溯（谁、何时、什么参数），和个人写 Tool Calling 时的要求一致。

## 官方资料

- [MCP 官网与文档](https://modelcontextprotocol.io)
- [MCP 协议规范](https://spec.modelcontextprotocol.io)
- [Claude Code 的 MCP 配置](https://code.claude.com/docs/en/mcp)

MCP 的本质是把"AI 工具生态"从 N×N 的两两适配压缩成 N+M 的标准接口。对个人开发者，先用 stdio + 十行代码跑通一个真实需求，比读完整个协议文档收获大得多。
