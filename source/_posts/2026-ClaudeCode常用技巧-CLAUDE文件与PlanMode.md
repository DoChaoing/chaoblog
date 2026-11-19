---
title: Claude Code 常用技巧：CLAUDE.md、Plan Mode 与高频命令
date: 2026-11-14 09:00:00
categories:
  - AI 应用实战
tags:
  - Claude Code
  - CLAUDE.md
  - 工作流
description: 用好 CLAUDE.md 沉淀项目约定，用 Plan Mode 先对齐再动手，再记住十来个高频命令，Claude Code 的效率差距一大半来自这些基本功。
---

新手用 Claude Code 是"每次都从零解释一遍项目"，熟手是"项目约定已经写好、计划先行、命令顺手"。差距不在模型，在基本功。

## CLAUDE.md：项目约定的家

每次会话开始，Claude Code 都会读取 CLAUDE.md 作为常驻上下文。三级作用域按需使用：

```text
~/.claude/CLAUDE.md          个人全局：跨项目的个人偏好（如"提交信息用中文"）
项目根/CLAUDE.md             项目级：进仓库就该知道的一切
项目根/CLAUDE.local.md       本机私有：不想提交到 git 的个人配置（建议加入 .gitignore）
```

新项目直接让它自己生成初稿：

```text
> /init
```

CLAUDE.md 里最值得写的是那些"不看会踩坑"的事：

- 常用命令：怎么构建、怎么测试、怎么本地预览；
- 项目结构：哪个目录放什么，命名约定是什么；
- 红线：不许动的文件、必须遵守的代码风格；
- 事实性背景：这个项目为什么用某个看起来奇怪的设计。

保持短。CLAUDE.md 是常驻上下文，每轮对话都要为它付费，把"操作流程"类的长内容挪到 Skills 或子代理里按需加载。对话中发现新约定，用 `#` 开头发一句消息即可快速追加进去。

## Plan Mode：先对齐，再动手

按 Shift+Tab 循环切换权限模式，切到 Plan Mode 后 Claude Code 只读不写，产出一份行动计划。这一步的价值在于：**在代码被改坏之前发现理解偏差**。

```text
> 给博客加一个暗色主题切换按钮
（Plan Mode 下先输出：涉及哪些文件、按钮放哪、状态存哪、要改几个组件）
```

计划满意后确认执行。改动越大、仓库越不熟，越值得先进 Plan Mode；改一行配置这种小事就没必要了。

## 高频命令清单

| 命令 | 用途 |
|---|---|
| `/clear` | 清空上下文开新任务，任务切换必用 |
| `/compact` | 压缩历史保留要点，长会话省钱续命 |
| `/resume` | 恢复历史会话 |
| `/model` | 切换模型，简单任务切便宜模型 |
| `/init` | 生成 CLAUDE.md 初稿 |
| `/help` | 查看全部命令 |

`/clear` 是最被低估的命令：上下文里堆着的旧任务残留只会干扰当前任务，还会让每一轮变贵。任务完成，立刻清。

## 让它替你管 git

Claude Code 对 git 工作流很熟，可以直接委派：

```text
> 把当前改动按逻辑拆成几个提交，提交信息遵循项目现有风格
> 基于当前改动开一个 PR，描述里写清楚动机和测试情况
```

好的习惯是小步提交：让每完成一个独立改动就提交一次，这样任何一步不满意都能精确回退。

## 把重复指令做成自定义命令

第三次粘贴同一段 prompt 时就该固化了。项目里建 `.claude/commands/build-check.md`：

```markdown
---
description: 构建并检查本博客最新改动
---

运行 hexo generate，若失败则修复错误直到构建通过。
注意：不要改动 _config.yml。
```

之后输入 `/build-check` 即可调用。支持 `$ARGUMENTS` 占位符接收参数，做成命令的好处是版本化、可分享给协作者。

## 官方资料

- [CLAUDE.md 与记忆机制](https://code.claude.com/docs/en/memory)
- [常见工作流](https://code.claude.com/docs/en/common-workflows)
- [斜杠命令与自定义命令](https://code.claude.com/docs/en/slash-commands)
- [Claude Code 最佳实践（Anthropic 工程博客）](https://www.anthropic.com/engineering/claude-code-best-practices)

这些技巧的共同逻辑是：把你的项目知识外置成文件，把上下文留给当前任务本身。
