---
title: AI 系统学习 02：Prompt 不是咒语，它是模型接口的契约
date: 2026-07-09 09:20:00
updated: 2026-08-04 10:20:00
categories:
  - AI 系统学习
tags:
  - Prompt
  - 结构化输出
  - 函数调用
  - 工程实践
description: 从一次无法解析的模型输出出发，把 Prompt 设计成可版本化、可校验、可评测的接口契约。
---

“帮我把这封邮件分类”是一个看上去非常简单的需求。

第一版 Prompt 往往是：

```text
请判断这封邮件属于咨询、投诉还是合作，并给出优先级。
```

演示时通常很好看。真正接进程序后，模型可能回答：

> 这是一封比较紧急的合作意向，建议高优先级跟进。

人能看懂，代码却不知道该把它写进 `cooperation`、`high`，还是交给人工。Prompt 的问题不在于“写得不够长”，而在于你把一段自然语言当成了稳定接口。

这篇的结论很简单：**Prompt 不是向模型许愿，它是输入、约束和输出之间的契约。**

## 先定义失败：什么叫“模型没有按要求工作”

对于邮件分类，至少有四种不同失败：

| 表现 | 真正的问题 |
|:--|:--|
| 输出一段解释性文字 | 输出格式没有契约 |
| 分类名称变成“商务合作” | 枚举值没有限制 |
| 邮件没有紧急词却给了 high | 判断标准没有写清 |
| 同一邮件多次结果不同 | 随机性或边界不稳定 |

把它们都归为“Prompt 不好”没有意义。工程上要把每一种失败转成可检查的条件。

## Prompt 的最小结构

一个可维护的 Prompt 通常包含五部分：

```text
角色：你处理什么任务
输入：你能使用哪些数据
规则：怎么判断，不能做什么
输出：字段、类型、枚举和示例
边界：资料不足、冲突或不合规时怎么处理
```

把刚才的需求改写：

```text
你是客服工单分类器。

根据邮件正文分类；不要使用正文之外的假设。
category 只能是 inquiry、complaint、cooperation、other。
priority 只能是 low、medium、high。
只有出现退款、服务中断、法律风险或明确的紧急时限时，priority 才能是 high。
信息不足时，category=other，needs_human_review=true。

只输出 JSON：
{
  "category": "...",
  "priority": "...",
  "reason": "不超过 30 字",
  "needs_human_review": false
}
```

这里最重要的不是“你是资深专家”这类人设，而是把程序关心的规则写成了可验证约束。

## 结构化输出：让程序相信 Schema，而不是相信模型

即使 Prompt 写了 JSON，仍可能得到 Markdown 代码块、缺失字段或无效枚举。因此要用两层约束：模型侧请求结构化输出，程序侧做 Schema 校验。

```python
from enum import Enum
from pydantic import BaseModel, Field

class Category(str, Enum):
    inquiry = "inquiry"
    complaint = "complaint"
    cooperation = "cooperation"
    other = "other"

class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TriageResult(BaseModel):
    category: Category
    priority: Priority
    reason: str = Field(max_length=30)
    needs_human_review: bool
```

调用模型后，不要直接使用字符串，而是先解析：

```python
def parse_result(raw_json: str) -> TriageResult:
    return TriageResult.model_validate_json(raw_json)
```

解析失败不是“悄悄给一个默认值”。应记录原始输出、Prompt 版本和请求 ID；必要时只针对格式问题重试一次。业务动作，例如自动创建工单或发送回复，只能发生在校验成功后。

## Few-shot 什么时候有用，什么时候会害你

示例可以让模型模仿格式与判断边界，但不是越多越好。

适合加入示例的场景：

- 分类边界很微妙，例如“功能咨询”和“故障投诉”；
- 输出语气或字段填写方式有固定规范；
- 有真实 bad case，文字规则难以说清。

不适合堆示例的场景：

- 示例占满上下文，真正输入反而被忽略；
- 示例本身过时或判断不一致；
- 你只是想用示例替代清楚的业务规则。

一个高质量示例必须包含边界：一封“请问怎么开通”的咨询、一封“服务不可用且今天到期”的投诉，以及一封资料不足、应该转人工的邮件。示例应和测试集分开；拿测试题去当示例，会制造虚假的高分。

## 函数调用不是“让模型执行代码”

当模型需要查订单、算价格或创建待办时，不要让它在文本里写“我已为你退款”。模型只能提出一个结构化的工具请求，真正的鉴权、参数校验和执行必须由程序完成。

以查订单为例，工具定义应描述业务边界：

```json
{
  "name": "get_order_status",
  "description": "查询当前已登录用户的一笔订单状态",
  "parameters": {
    "type": "object",
    "properties": {
      "order_id": {"type": "string", "description": "订单编号"}
    },
    "required": ["order_id"],
    "additionalProperties": false
  }
}
```

程序收到调用请求后仍要做三件事：

1. 校验 `order_id` 格式；
2. 确认当前用户是否有该订单权限；
3. 将工具的真实结果返回模型，再由模型组织人类可读答案。

模型负责“该不该查、查什么参数”；系统负责“能不能查、查到什么、能不能执行”。不要让自然语言绕过权限系统。

## Prompt 也需要版本号和评测

Prompt 改一个词都可能改变行为，所以它应该和代码一样可追踪。一个实用的记录格式：

```text
prompt_version: triage-v3
model: YOUR_MODEL
temperature: 0
input: 邮件正文
parsed_output: 校验后的 JSON
validation_error: null
latency_ms: 820
```

然后准备一张最小评测表：

| 输入 | 期望分类 | 期望优先级 | 是否转人工 | 实际结果 |
|:--|:--|:--|:--:|:--|
| 如何修改发票抬头？ | inquiry | low | 否 |  |
| 系统宕机，今晚必须恢复 | complaint | high | 否 |  |
| 我想合作 | cooperation | medium | 否 |  |
| 帮我处理一下 | other | low | 是 |  |

每次修改 Prompt 后，先跑这批固定输入。若格式通过率提高但“应转人工”的题开始被乱答，这不是优化，而是换了一种错误。

## 常见误区

| 做法 | 问题 | 替代方式 |
|:--|:--|:--|
| 不断加“请认真思考” | 不能替代缺失信息和规则 | 补输入、枚举与判断标准 |
| 只要求 JSON | 格式可能正确、语义仍然错 | JSON + Schema + 评测集 |
| 失败就无限重试 | 放大成本和延迟 | 明确重试条件与最大次数 |
| 让模型判断权限 | 容易被 Prompt 注入绕过 | 程序做鉴权，模型只提建议 |
| 一次塞进十几个任务 | 难评测、难排错 | 拆成分类、抽取、生成等小步骤 |

## 本篇练习：做一个可回归的分类器

请用任意模型 API 完成下面闭环：

1. 定义一个至少含 4 个枚举字段的 JSON Schema；
2. 准备 12 条样例，其中 3 条必须转人工；
3. 写代码校验每次输出，记录解析失败与字段错误；
4. 修改一次 Prompt 前后版本，比较分类准确率、格式通过率和人工转交准确率；
5. 写下一个“规则写得很像对，但模型仍理解错”的 bad case。

下一篇进入 RAG。你会看到：当 Prompt 已经足够清楚，模型仍然无法回答私有知识时，问题就从“如何表达任务”转向“如何可靠地把证据送到上下文里”。
