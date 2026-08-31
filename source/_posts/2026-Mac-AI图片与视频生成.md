---
title: Mac AI 图片与视频生成：用 ComfyUI 跑通第一个完整工作流
date: 2026-08-29 09:00:00
categories:
  - AI 应用实战
tags:
  - Mac
  - ComfyUI
  - AI 绘画
  - 视频生成
  - 提示词
description: 在 Apple 芯片 Mac 上安装 ComfyUI，先生成一张赛博朋克图片，再把它制作成短视频，并讲清模型、工作流、参数和内存优化。
---

文本大模型输出的是 Token，图片模型输出像素，视频模型则要生成一串在时间上连续的画面。三者的操作界面不同，但工程方法一致：**先跑通最小案例，再固定输入做参数对比，最后才追求分辨率和复杂效果。**

本文在 Apple 芯片 Mac 上完成一个具体项目：

```text
文字提示词
  → 生成一张“赛博朋克终端桌面”图片
  → 把图片作为视频第一帧
  → 生成 3～5 秒的缓慢运镜视频
  → 导出 MP4 并检查画面稳定性
```

![Mac 上从提示词、生图、首帧到视频导出的完整流程](/images/ai-media/mac-ai-image-video-pipeline.png)

*流程示意：先让单张图片的主体与构图稳定，再把它作为第一帧生成视频，最后导出 MP4。*

主工具选择 ComfyUI Desktop。它把模型推理拆成可视化节点，图片和视频可以共用同一套模型管理与工作流机制。

## 一、先判断本地生成是否适合你的 Mac

ComfyUI Desktop for macOS 目前只支持 Apple Silicon，并推荐使用 MPS，让 PyTorch 通过 Metal 使用 Apple GPU。

可以按照统一内存选择目标：

| 统一内存 | 建议目标 |
| ---: | --- |
| 8 GB | 先做 512×512 图片；视频优先使用云端 |
| 16 GB | 适合轻量图片模型；短视频需要低分辨率、少帧数 |
| 24～32 GB | 可以尝试轻量 2B 视频模型和图片转视频 |
| 48 GB 以上 | 可尝试更大模型，但仍要控制分辨率和帧数 |

这只是保守起点，不是兼容性保证。视频模型会同时处理多帧，内存和耗时通常远高于单张图片。活动监视器出现黄色或红色内存压力、交换空间持续增长时，应立即降低规模。

## 二、安装 ComfyUI Desktop

最简单的方法是使用 Homebrew：

```bash
brew install comfyui
```

也可以从 [ComfyUI Desktop macOS 页面](https://docs.comfy.org/installation/desktop/macos) 下载应用。第一次启动时：

1. 计算设备选择 **MPS**；
2. 选择一个空间充足的独立目录；
3. 等待 Python 环境和依赖初始化；
4. 不要修改应用内部的 `resource/ComfyUI` 目录。

模型通常比程序本身大得多。建议至少预留几十 GB 空间；计划尝试多个视频模型时，需要预留更多。

进入界面后先认识四个位置：

- 左侧或菜单中的 **Workflow Templates**：加载官方工作流；
- **Load Checkpoint**：选择图片模型；
- **CLIP Text Encode**：填写正向或负向提示词；
- **Run / Queue**：执行工作流，快捷键通常是 `Cmd + Enter`。

![节点式图片生成工作流示意图](/images/ai-media/comfyui-image-workflow.png)

*节点关系示意：模型和提示词进入采样器，生成结果交给保存节点。实际 ComfyUI 界面会包含更多编码、Latent 和 VAE 节点。*

## 三、第一部分：生成一张图片

为了先理解流程，使用官方入门工作流和 SD 1.5。它不是最新、质量最高的模型，但体积和资源要求相对较低，适合验证 Mac、MPS、模型目录和保存流程是否都正常。

### 第 1 步：加载模板和模型

在 ComfyUI 中打开：

```text
Workflow → Browse Workflow Templates → Image Generation
```

如果缺少 `v1-5-pruned-emaonly-fp16.safetensors`，界面会显示 Missing Models。Desktop 版可以点击下载，模型会被放入 `models/checkpoints`。

如果需要手动确认模型目录：

```text
左上角 ComfyUI 标志 → Help → Open folder → Open models folder
```

模型加入后按 `R` 刷新节点，再在 `Load Checkpoint` 中选中它。

### 第 2 步：设置第一组提示词

正向提示词不要只写关键词列表。按照“主体、环境、构图、光线、材质、风格”的顺序描述：

```text
a futuristic programmer desk inside a dark cyberpunk room,
a vintage terminal monitor displaying green command line text,
mechanical keyboard, subtle neon cyan and magenta lights,
rain on the window, cinematic wide shot, realistic materials,
high contrast lighting, detailed, no person
```

负向提示词用于排除常见问题：

```text
blurry, low quality, distorted monitor, unreadable layout,
extra keyboards, duplicate objects, watermark, logo, person
```

图片模型经常无法稳定生成正确文字，所以重点应是“终端视觉氛围”，不要期待屏幕命令完全正确。准确文字更适合在后期设计工具中添加。

### 第 3 步：使用一组可复现参数

在工作流节点中设置：

```text
宽度：512
高度：512
Batch size：1
Steps：20
CFG：7
Seed：20260829
```

不同模板的采样器默认值可能不同，第一轮保持模板默认即可。点击 Run 或按 `Cmd + Enter`。生成结果会出现在 Save Image 节点，并保存到 ComfyUI 的 `output` 目录。

验收第一张图：

- 能否成功生成，没有 MPS 或内存错误；
- 主体是否明确是终端桌面；
- 构图是否适合后续做运镜；
- 是否存在重复键盘、扭曲屏幕等明显错误；
- 保存的图片能否重新拖入 ComfyUI 恢复工作流。

最后一点很实用：ComfyUI 生成的 PNG 通常带有工作流元数据，拖回界面就能继续修改。

## 四、不要盲调：完成三轮图片实验

固定 Seed，一次只改一个变量：

| 实验 | 改动 | 观察点 |
| --- | --- | --- |
| A | Steps 20 → 30 | 细节是否改善，耗时增加多少 |
| B | CFG 7 → 5 | 构图是否更自然，提示词遵循是否下降 |
| C | 512² → 768² | 细节、耗时和内存压力变化 |

Seed 固定后，噪声起点基本一致，更容易看出参数的影响。如果每次同时换 Seed、尺寸、提示词和采样器，就无法知道改进来自哪里。

Mac 上优先遵循以下顺序：

```text
先优化提示词和构图
→ 再尝试少量增加 Steps
→ 最后提高分辨率或做后期放大
```

直接用大分辨率生成，通常比低分辨率出图后放大更容易造成高内存压力。

## 五、第二部分：把图片生成短视频

视频入门建议选择**图片转视频（Image-to-Video）**，而不是直接文字转视频。首帧已经确定了主体、颜色和构图，视频模型只需要解决运动，结果通常更可控。

这里使用 ComfyUI 官方的 LTX-Video 轻量工作流思路。官方 LTX 0.9.5 示例提供 2B 模型和 Image-to-Video 模板，更适合本地学习。最新 LTX-2.x 模型规模明显更大，低内存 Mac 应优先考虑 Comfy Cloud 或其他云端 GPU。

### 第 1 步：加载 Image-to-Video 模板

先更新 ComfyUI，然后打开模板库：

```text
Workflow Templates → Video → LTX Video → Image to Video
```

模板名称会随 ComfyUI 版本变化。如果找不到，参考 [ComfyUI LTX 工作流示例](https://docs.comfy.org/tutorials/video/ltxv) 下载官方工作流；Desktop 稳定版有时会晚于最新文档。

模板加载后，根据 Missing Models 提示下载模型。官方轻量示例使用的文件包括：

```text
models/checkpoints/ltx-video-2b-v0.9.5.safetensors
models/text_encoders/t5xxl_fp16.safetensors
```

视频模型和文本编码器都很大，下载前再次检查磁盘空间。不要从来源不明的网站下载可执行文件或自定义节点。

### 第 2 步：载入刚才生成的图片

在 `Load Image` 节点中选择赛博朋克终端图片。第一次实验使用横向尺寸，并避免过高分辨率：

```text
宽度：768（如果内存不足则 512）
高度：512
帧数：先使用模板的较小默认值
Batch：1
Seed：20260829
```

具体宽高需要符合工作流节点的倍数约束。如果报尺寸错误，使用模板默认尺寸，而不是随意输入任意像素。

### 第 3 步：写“运动提示词”

图片提示词描述画面里有什么；视频提示词还要描述谁在动、如何动、镜头如何动，以及哪些东西必须保持稳定。

```text
Slow cinematic camera push-in toward the terminal monitor.
Green terminal cursor blinks softly, subtle code lines scroll upward.
Neon cyan and magenta reflections move gently across the desk.
Rain slides down the window in the background.
The monitor, keyboard and desk remain structurally stable.
No scene change, no new objects, no people.
```

第一条视频不要写爆炸、快速旋转、人物走动和大幅镜头切换。运动越多，短视频越容易出现物体变形和闪烁。

### 第 4 步：生成并导出

点击 Run。视频生成可能比图片慢得多，期间观察活动监视器，不要同时启动其他大模型。

完成后，视频通常由保存节点写入：

```text
ComfyUI/output/
```

部分工作流会放入 `output/video` 子目录。最终格式取决于保存节点，常见为 MP4 或 WebM。

验收视频时不要只看第一帧：

- 终端、键盘和桌子结构是否稳定；
- 是否出现突然增加或消失的物体；
- 光线变化是否连续；
- 首尾是否有跳变；
- 是否存在大面积闪烁、融化或拉伸；
- 实际时长和画幅是否适合发布平台。

## 六、视频失败时怎么调

### 画面严重变形

减少运动数量，把提示词从“镜头旋转、屏幕变化、雨水、人物进入”缩减为一个主运动，例如只保留缓慢推进。图片转视频的第一帧也要构图清晰，避免过多细碎物体。

### 视频像静态图片

把运动写成明确动词：`camera slowly pushes in`、`cursor blinks`、`rain slides down`。不要只重复图片的风格词。可以小幅提高运动相关参数，但每次只改一项。

### 闪烁严重

减少生成尺寸和运动幅度，缩短视频，避免提示词要求连续出现精确文字。先生成稳定的短片，再考虑插帧和放大。

### Mac 内存不足或系统卡死

按顺序处理：

1. Batch 固定为 1；
2. 降低宽高；
3. 减少帧数；
4. 关闭 Ollama、浏览器大标签页和其他高内存应用；
5. 换轻量模型；
6. 改用云端 GPU。

不要同时提高分辨率、帧数和 Batch。视频总像素量大致随“宽 × 高 × 帧数”增长，三个参数一起增加会迅速放大资源需求。

![Mac 视频生成保守参数与过载参数对比](/images/ai-media/mac-video-memory-comparison.png)

*第一次运行应从低分辨率、少帧数、Batch 1 开始。图中的参数用于解释资源增长关系，不代表所有视频模型都接受完全相同的尺寸和帧数。*

## 七、图片与视频提示词模板

图片提示词：

```text
[主体]，位于[环境]，[构图/视角]，[光线]，[材质与细节]，
[视觉风格]，[色彩]，[画面中不要出现什么]
```

视频提示词：

```text
[主体]执行[一个主要动作]，[镜头运动]，[背景中的次要运动]，
[光线如何变化]，[必须保持稳定的对象]，
no scene change, no new objects, continuous motion
```

提示词不必无限加长。真正有效的是明确主体、空间关系和运动，而不是堆满“8K、masterpiece、best quality”等宽泛词。

## 八、什么时候该用本地，什么时候用云端

| 场景 | 本地 Mac | 云端生成服务 |
| --- | --- | --- |
| 学习工作流 | 非常适合 | 可以，但不利于理解节点 |
| 隐私图片 | 适合，注意模型许可证 | 需要确认数据政策 |
| 512～768 图片 | 适合 | 更快但可能按量付费 |
| 高质量长视频 | 通常较吃力 | 更适合 |
| 大规模批量生产 | 不推荐个人 Mac | 更容易扩容 |
| 最新超大模型 | 经常受内存限制 | 通常先在云端可用 |

比较成本时，不要只看一次生成价格。本地还有下载空间、等待时间、电量和电脑被占用的成本；云端则有费用、隐私和平台依赖。

## 九、发布前的版权与安全检查

- 确认基础模型、LoRA 和素材允许你的使用方式；
- 不用真实人物照片制作误导性内容；
- 不模仿在世艺术家的独特风格进行商业冒充；
- 检查图片和视频中的错误文字、商标和水印；
- 保存模型版本、工作流、Seed 和提示词；
- 对外发布时根据平台要求说明 AI 生成或 AI 辅助；
- 涉及客户或公司资料时，不上传到未经批准的云端服务。

## 十、下一步怎么练

完成本文后，可以按这个顺序继续：

1. 同一 Seed 比较三种提示词；
2. 学习 Image-to-Image，保持构图改变风格；
3. 使用 ControlNet 控制边缘、深度或人物姿态；
4. 使用 LoRA 固定视觉风格；
5. 对视频进行插帧、放大和剪辑；
6. 把工作流导出为 JSON，记录每次实验结果。

最值得保留的成果不是某一张“抽卡成功”的图片，而是一份别人可以重新运行的工作流。

## 总结

Mac 上生成图片和视频的可靠路线是：

```text
安装 ComfyUI Desktop（MPS）
→ 用 SD 1.5 跑通第一张 512×512 图片
→ 固定 Seed 比较参数
→ 选择稳定图片作为首帧
→ 用轻量 LTX Image-to-Video 生成短片
→ 从低分辨率、少帧数、单运动开始调优
```

先得到一个稳定、可复现的小结果，再逐步增加模型、尺寸和运动复杂度。对 Mac 来说，这比一开始挑战最新最大的视频模型更容易真正学会生成工作流。

## 官方资料

- [ComfyUI：macOS Desktop 安装](https://docs.comfy.org/installation/desktop/macos)
- [ComfyUI：第一次图片生成](https://docs.comfy.org/get_started/first_generation)
- [ComfyUI：Text-to-Image 工作流](https://docs.comfy.org/tutorials/basic/text-to-image)
- [ComfyUI：工作流模板](https://docs.comfy.org/interface/features/template)
- [ComfyUI：LTX-Video 示例](https://docs.comfy.org/tutorials/video/ltxv)
- [Hugging Face Diffusers：Apple Silicon MPS](https://huggingface.co/docs/diffusers/main/optimization/mps)
- [Lightricks：LTX-Video](https://github.com/Lightricks/LTX-Video)
