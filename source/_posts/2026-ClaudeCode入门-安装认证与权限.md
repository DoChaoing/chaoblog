---
title: Claude Code 入门：安装、认证与权限边界
date: 2026-11-13 09:00:00
categories:
  - AI 应用实战
tags:
  - Claude Code
  - Agent
  - CLI
description: 从安装启动到第一次真实改动：两种认证方式的区别、权限模式的选择、以及让 Agent 在真实仓库里安全干活的基本约定。
---

Claude Code 和聊天机器人的区别在于：它不只回答问题，还能直接在你的项目目录里读文件、改代码、跑命令。所有技巧都建立在一个前提上——先把安装、认证和权限边界设置好。

## 安装

```bash
# 官方安装脚本（推荐，自动跟随版本更新）
curl -fsSL https://claude.ai/install.sh | bash

# 或通过 npm（需要 Node 18+）
npm install -g @anthropic-ai/claude-code
```

装完后 `cd` 到你的项目根目录，输入 `claude` 启动。在项目根目录启动很重要：Claude Code 会把当前目录视为工作区，项目级配置（CLAUDE.md、.claude/ 目录）都从这里解析。

## 两种认证方式

| 方式 | 适合人群 | 计费 |
|---|---|---|
| 账号登录（`/login`） | Claude Pro / Max 订阅用户 | 包含在订阅里，按套餐限额 |
| API Key | 无订阅、或需要精确控制成本 | 按 token 计费，在控制台充值 |

无订阅时设置环境变量即可：

```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxx
```

API Key 方式下，一次长会话可能花掉几美元，建议先在控制台设置用量上限再开始。订阅方式的额度模型不同，重任务前可以先 `/usage` 看余量。

## 第一次对话的正确姿势

不要上来就说"帮我把这个项目重构一下"。从小而完整的任务开始：

```text
> 这个项目用什么构建？读 package.json 告诉我
> 给 source/_posts 加一个 2026 年的空文章模板，不要改其他文件
```

你会看到 Claude Code 的典型工作流：先调用读文件工具查看现状，给出方案，再调用编辑工具落地，每一步危险操作前会向你确认。

## 权限模式

Claude Code 的每次工具调用默认都要你批准。这是最重要的安全边界，有几种放宽方式，按需选择：

- **默认模式**：每个写操作和命令都询问，适合不熟悉的仓库。
- **auto-accept**：按 Shift+Tab 切换，会话内自动接受编辑（命令仍会确认）。
- **Plan Mode**：先只规划不动手，计划确认后再执行，适合大改动。
- **permissions 配置**：在 `.claude/settings.json` 里写白名单，把高频安全操作固化下来。

```json
{
  "permissions": {
    "allow": ["Read", "Glob", "Grep", "Bash(git diff:*)", "Bash(git log:*)"],
    "deny": ["Bash(rm -rf:*)", "Bash(git push --force:*)"]
  }
}
```

`allow` 里放确定无害的操作，`deny` 里放绝对不想让它碰的命令。deny 优先级最高，即使你本人在会话里批准也会被拦下。

`--dangerously-skip-permissions` 会跳过所有确认，只建议在一次性容器或沙箱环境里用，绝不要在主力开发机上全局开启。

## 常见坑

1. **启动目录不对**：在子目录启动会看不到项目级配置，也让文件搜索范围变窄。
2. **git 工作区太脏**：改动混在一起无法回退。让 Claude Code 动手前保持工作区干净，或让它先建分支。
3. **一个会话塞太多需求**：上下文是有限资源，任务完成就 `/clear`，大任务拆会话。

## 官方资料

- [Claude Code 文档总览](https://code.claude.com/docs/en/overview)
- [快速开始](https://code.claude.com/docs/en/quickstart)
- [settings 与 permissions 配置](https://code.claude.com/docs/en/settings)
- [模型与用量说明](https://code.claude.com/docs/en/costs)

把权限边界当成第一件事配置，之后的所有自动化才谈得上安全。
