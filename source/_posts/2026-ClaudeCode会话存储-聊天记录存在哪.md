---
title: Claude Code 会话存储：你的聊天记录存在哪
date: 2026-11-18 09:00:00
categories:
  - AI 应用实战
tags:
  - Claude Code
  - Session
  - 隐私
description: 会话按项目目录明文存在本地 jsonl 文件里，可以恢复、可以搜索、可以回退。理解这几点，长项目工作流会顺畅很多。
---

Claude Code 的聊天记录不在云端，就在你本机的一个目录里，明文 JSON Lines 格式。知道它存在哪、怎么恢复、怎么回退，长项目的工作流会完全不一样。

## 存在哪

```text
~/.claude/projects/<把项目路径里的 / 替换成 ->/*.jsonl
```

比如在 `/Users/you/projects/chaoblog` 里的会话，会存到：

```text
~/.claude/projects/-Users-you-projects-chaoblog/abc123def....jsonl
```

每个会话一个 `.jsonl` 文件，每行一条 JSON 记录：用户消息、模型回复、工具调用及结果、以及元数据。想验证很简单：

```bash
ls -lt ~/.claude/projects/ | head    # 按最近活跃列出项目
# 找到对应目录后：
ls -lt ~/.claude/projects/-Users-you-projects-chaoblog/ | head
```

## 恢复会话

```bash
claude --continue      # 接着当前项目最近一次会话，不用选
claude --resume        # 弹出会话列表让你挑
```

典型用法：昨天的任务做了一半，今天 `claude --continue` 接着干，模型记得全部上下文——**前提是那个会话还没被压得太满**。

## 把会话记录当数据库用

既然是明文 jsonl，就可以直接搜：

```bash
# 上周那个关于部署脚本的讨论，当时结论是什么？
grep -l "部署脚本" ~/.claude/projects/-Users-you-projects-chaoblog/*.jsonl
```

比翻聊天界面快得多。很多"我记得当时它给过一个很好的方案"的时刻，答案就在历史文件里。

## 回退：rewind

模型改错了方向怎么办？连按两次 Esc 触发 rewind，可以回退到之前任意一个检查点：

- **只回退代码**：文件状态还原，对话继续——适合"改动没问题，但我想换个思路重来"；
- **回退代码和对话**：整个状态回去，从头再引导。

配合干净的小步 git 提交，基本不会出现"改坏了救不回来"的局面。

## 会话寿命与 /compact

上下文窗口是有限的。会话越长，历史越多，每一轮都变贵、变慢，直到模型开始"遗忘"开头的内容。两个动作：

- **`/compact`**：压缩历史为摘要，保留要点继续当前任务。长任务中途的续命手段，摘要可能丢细节，重要结论最好让它写进文件再压缩；
- **`/clear`**：任务完成就清场，下一个任务从零开始。

原则：一个会话一件事。跨会话要留痕的结论，让模型写进 CLAUDE.md 或文档文件，而不是指望下次还能恢复会话。

## 隐私提醒

- 记录是**明文**的，包含你粘贴进对话的一切。不要往对话里贴 API key、密码、生产数据；
- 清理旧会话就是删对应的 jsonl 文件，或按项目目录整个删除；
- 公司项目要确认这种本地留痕是否符合你的合规要求。

## 官方资料

- [CLI 参考（--continue / --resume）](https://code.claude.com/docs/en/cli-reference)
- [会话回退与检查点](https://code.claude.com/docs/en/checkpointing)
- [数据使用与隐私](https://code.claude.com/docs/en/data-usage)

会话记录是资产：能恢复、能检索、能回退。唯一的敌人是明文泄露——管住你粘贴进对话的东西。
