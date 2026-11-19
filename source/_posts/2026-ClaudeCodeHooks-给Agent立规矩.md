---
title: Claude Code Hooks：给 Agent 立下系统层面的规矩
date: 2026-11-15 09:00:00
categories:
  - AI 应用实战
tags:
  - Claude Code
  - Hooks
  - 自动化
description: CLAUDE.md 只是提醒，Hooks 才是强制。在工具调用、提交 prompt、会话结束等关键时机执行你的脚本，把"指望模型自觉"变成系统保证。
---

CLAUDE.md 写着"提交前要跑 lint"，模型大多数时候会照做，但总有忘记的时候。Hooks 解决的就是这个问题：它在 Claude Code 运行的关键时机执行你预先配好的脚本，脚本的输出和退出码会真实影响下一步行为。**CLAUDE.md 是软提醒，Hooks 是硬约束。**

## 支持的时机

| 事件 | 触发点 |
|---|---|
| `UserPromptSubmit` | 用户提交 prompt 后、模型看到前 |
| `PreToolUse` | 工具调用前，可放行或拦截 |
| `PostToolUse` | 工具调用后 |
| `Stop` | 主 Agent 结束响应时 |
| `SubagentStop` | 子 Agent 结束时 |
| `PreCompact` | /compact 压缩前 |
| `SessionStart` | 会话启动时 |
| `Notification` | 需要用户注意时（如等待权限确认） |

配置写在 `.claude/settings.json`（项目级）或 `~/.claude/settings.json`（个人级）。

## 例子一：编辑后自动格式化

`PostToolUse` 在每次文件编辑后触发，用 `matcher` 限定只针对 Edit 工具：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/scripts/auto-format.sh"
          }
        ]
      }
    ]
  }
}
```

脚本从 stdin 读到 JSON（含被改的文件路径），格式化后如有改动就输出一句提示，模型会看到并自行处理遗漏。

## 例子二：拦截危险命令

`PreToolUse` 是最重要的安全钩子。退出码 2 表示拦截并阻止本次调用：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/scripts/guard-bash.sh"
          }
        ]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# guard-bash.sh：拒绝高危命令
input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command')

if echo "$command" | grep -qE 'rm -rf|git push --force|git reset --hard'; then
  echo "禁止执行高危命令：$command" >&2
  exit 2   # 退出码 2 = 拦截本次调用
fi
exit 0
```

也可以不靠退出码，而是输出 JSON 精细控制：

```json
{"hookSpecificOutput": {"permissionDecision": "deny", "permissionDecisionReason": "该命令在黑名单中"}}
```

## 例子三：给每次 prompt 注入上下文

`UserPromptSubmit` 的 stdout 会直接拼进模型看到的 prompt。适合注入"时时刻刻都有用"的动态信息：

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          { "type": "command", "command": "echo \"当前分支：$(git branch --show-current)，未提交文件数：$(git status -s | wc -l)\"" }
        ]
      }
    ]
  }
}
```

模型从此不必每次调用 git 命令才知道仓库状态，省 token 也省来回。

## 调试要点

- 脚本通过 **stdin 收到完整 JSON**（工具名、参数、会话 ID 等），用 `jq` 解析；
- `exit 2` = 阻止并报错，其他非零 = 非阻塞错误，`exit 0` = 放行；
- stdout 在 `UserPromptSubmit` 里进上下文，在 `PreToolUse` 里配合 JSON 用；stderr 始终只是调试日志；
- 改完配置用 `/hooks` 查看是否生效，或在命令里加 `echo "$input" > /tmp/hook-debug.json` 抓真实输入。

## 别过度使用

Hooks 每次触发都要跑脚本，复杂的同步脚本会让整个会话变卡。经验法则：安全拦截和自动格式化值得做成 Hook；一次性流程不值得，那是 Skills 的领域。模型指令遵从能力越来越强，先想想"一句 CLAUDE.md 能不能解决"，再决定是否上 Hook。

## 官方资料

- [Hooks 参考与事件一览](https://code.claude.com/docs/en/hooks)
- [Hooks 实战指南](https://code.claude.com/docs/en/hooks-guide)
- [settings.json 配置](https://code.claude.com/docs/en/settings)

把"可能被忘掉的规矩"交给 Hooks 强制执行，人和模型都轻松。
