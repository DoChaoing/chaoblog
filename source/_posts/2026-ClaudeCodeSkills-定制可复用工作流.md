---
title: Claude Code Skills：把重复操作固化成可复用的工作流
date: 2026-11-16 09:00:00
categories:
  - AI 应用实战
tags:
  - Claude Code
  - Skills
  - 自动化
description: 同一段流程粘贴三次就该做成 Skill 了。SKILL.md 的结构、渐进式加载的原理、与 CLAUDE.md 和自定义命令的分工，一次讲清。
---

当你发现自己第三次把同样的操作步骤粘贴进对话——压缩图片、发布博客、生成周报——就该做 Skill 了。Skill 是一个带 `SKILL.md` 的目录，把一段多步骤流程固化下来，之后一句话触发，每次都按同样的标准执行。

## SKILL.md 的结构

```
.claude/skills/deploy-blog/
├── SKILL.md          # 必需：说明 + 流程
└── scripts/
    └── check-seo.sh  # 可选：附属脚本
```

```markdown
---
name: deploy-blog
description: 发布本博客文章前执行完整的质量检查流程。当用户要求发布、部署博客或检查文章质量时使用。
---

## 流程

1. 运行 scripts/check-seo.sh，检查所有待发布文章的 front matter 完整性
2. 运行 npx hexo generate 确认构建无错误
3. 任一步骤失败：修复后重跑，直到全部通过
4. 全部通过后询问用户是否执行发布

## 约定

- 构建失败时优先检查最近修改的文章
- 不要修改 _config.yml
```

存放位置有两级：`.claude/skills/`（项目内共享，进 git）和 `~/.claude/skills/`（个人全局）。三件事决定 Skill 好不好用：

- **description 写触发时机**，不只是写功能。模型靠它判断什么时候自动启用，写"当用户要求发布博客时使用"比写"博客发布工具"命中率高得多；
- **流程写成可执行步骤**，而不是泛泛的原则；
- **固定的机械步骤交给脚本**，SKILL.md 里只写判断和分支。脚本比自然语言指令可靠且省 token。

## 渐进式加载：Skill 的上下文经济学

Skill 不会一开始就占满上下文，而是分三层按需加载：

```text
第 1 层：所有 skill 的 name + description 常驻（几十 token 每个）
第 2 层：命中任务时才加载 SKILL.md 正文（几百到几千 token）
第 3 层：正文引用的脚本、参考资料，执行到才读取
```

这意味着你可以在项目里放二十个 Skill，而不用为它们一次性支付上下文成本。这也是 Skill 和 CLAUDE.md 的分工标准：**常驻的"事实"进 CLAUDE.md，按需的"操作流程"进 Skill**。

## 触发方式

- **自动**：description 与当前任务匹配时，模型自行加载使用，无感；
- **手动**：`/deploy-blog 直接发布最新那篇` ——像斜杠命令一样调用，`$ARGUMENTS` 接收后半句作为参数；
- 还可以用 frontmatter 精细控制：`disable-model-invocation: true` 只允许手动触发，`allowed-tools` 预授权一组工具免去权限确认。

## 和其他机制的分工

| 机制 | 放什么 | 加载方式 |
|---|---|---|
| CLAUDE.md | 项目事实与约定，每轮都相关 | 常驻 |
| 自定义命令 | 单步小指令（`.claude/commands/`） | 手动 |
| Skill | 多步骤、带判断、带附属文件的工作流 | 按需三层 |
| Hooks | 强制性的硬约束 | 事件触发 |

一个简单判断：内容超过一屏、或者需要带脚本和参考资料，就用 Skill。

## 官方资料

- [Skills 官方文档](https://code.claude.com/docs/en/skills)
- [Claude Code 最佳实践](https://www.anthropic.com/engineering/claude-code-best-practices)

Skill 的本质是把"你脑子里每次都要重述的流程"变成项目资产——写一次，所有人（包括未来的你）每次都以同一标准执行。
