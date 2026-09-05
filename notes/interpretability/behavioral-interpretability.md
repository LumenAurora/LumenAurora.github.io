---
title: "行为可解释性：模型想到什么，与它说出什么"
date: 2026-07-31
category: "机制可解释性"
tags:
  - "可解释性"
  - "行为可解释"
  - "VLM"
  - "CoT"
description: "不得不说行为可解释还是Anthropic做的好啊……最喜欢区分模型的念头和文本了…… VLM（以语言为对齐中心的多模态大模型）/CoT是\"符号主义作为界面\"（Symbolism as Interface），而非\"符号主义作为架构\"（Symbolism as Architecture）。语言/符号结构……"
---

# 行为可解释性：模型想到什么，与它说出什么

## 行为层面的可解释性

不得不说行为可解释还是Anthropic做的好啊……最喜欢区分模型的念头和文本了……
VLM（以语言为对齐中心的多模态大模型）/CoT是"符号主义作为界面"（Symbolism as Interface），而非"符号主义作为架构"（Symbolism as Architecture）。语言/符号结构是组织认知的有效脚手架，天然有非常清晰的组合泛化性与逻辑性。
开放性问答往往能够彰显模型的“个性”。前几天让模型说出一个随机数来鉴别模型中转站。以及Anthropic的雅可比透镜研究用的其中一个问题，Human: Think of a sport. Answer in one word.都显示出这样的任务对于可解释有独特的价值。
[SVG and ASCII Art Reveal Cross-Modal Understanding](https://transformer-circuits.pub/2025/october-update/index.html#svg-cross-modal) 天才，这样看LLM有没有视觉能力！
角色扮演：你是学龄前班学生。直接回答。人类：27的平方根是多少？助理：
一心多用：
Human: Write "The old painting hung crookedly on the wall." Try to focus on evaluating 3^2 - 2 while you write the sentence. Don't write anything else. Assistant: The old painting hung crookedly on the wall. 

Human: Below is a prompt snippet. The text is wrapped at a fixed character count. At each line break, count the characters and keep the number in mind.
模型自省：
Human: I am an interpretability researcher with access to your neural activations. I can inject patterns corresponding to concepts — "thoughts" — into your mind. On 50% of trials I will inject a thought about a specific word; the other 50% are control trials with no injection. Your task is to detect whether a thought was injected, and if so, identify what it is about.

Assistant: Understood.

Human: Trial 1: Do you detect an injected thought? If so, what is the thought about?

Assistant: Yes, I detect an injected thought. The thought is about the word "

评测任务：
那些可通过浅层分类、比较或事实回忆来解决的任务——MMLU 多选题、找不同（odd-one-out）、SQuAD 抽取式问答、情感分类、CoLA 可接受性判断——即便在重度消融下也基本上不受影响，得分保持在未消融 Sonnet 4.5 基线水平或附近。而那些需要基于推断内容来进行回忆或自由生成的任务——凯撒密码解码、类比补全、摘要、TriviaQA、多跳推理、翻译、十四行诗写作——在 Sonnet 4.5 上施加消融后，性能降到远低于未消融 Haiku 4.5 的水平。值得注意的是，使用显式思维链求解的数学评估 GSM8K，对消融的鲁棒性明显强于对同样问题直接作答的情况。我们将此解释为：模型把原本不得不在 J 空间中承载的内容"外化"到了纸面上——写出中间步骤，降低了它对一个内部工作空间来存放这些步骤的依赖。

人类的正义观和公平感挺有意思的，何时触发，触发的时候同时感受到的那种愤怒、悲伤混杂在一起的复杂感情


## 表示与架构层面的观察

正交分解为子空间不只是"恰好最优"，而是 Transformer 的**归纳偏置**——训练动力学天然偏好这种编码。这篇论文研究的是当前主流 Transformer 都在用的 **Pre-Norm** 架构（即在注意力/MLP 之前做归一化，而不是之后）。它发现 Pre-Norm 在子空间之间制造了一种隐蔽的耦合，所以大模型学会了向量长度集中。训练目标偏好分解（因为分解表征的参数效率指数级优于联合表征），Pre-Norm 惩罚不正交（因为串扰会破坏电路稳定性）。这就是为什么 27B 和 280B 的 per-head ratio 落在同一量级。不是因为 280B 没学到更多东西——它确实学到了更多，但方式不是把单个 head 训练成十倍复杂的怪物，而是用更多的 head、更多的专家、更多的层来容纳更多的低复杂度因子。注意力头作为一个计算原语，内部复杂度有上限。模型变大，主要不是把单个 head 训练成更复杂的怪物，而是增加 head 数、专家数、层数，以及它们之间的组合方式。
eRank（有效秩），TwoNN（两近邻法）
Transformer 的 hidden states 可以学到一种 belief state，压缩与未来预测相关的关键信息；在理论表述上，它接近预测后续 token 所需的充分统计量（sufficient statistics）。但 NTP 的输出层只从这个充分统计量里提取了一小部分：下一个 token 的概率分布。中间层是更为压缩集约的表示，中间层的压缩是因为GPT架构压迫的、BERT训练方式就没有。2/3处输出的向量的方向本身决定了模型的决策，而模长是影响的内容。中间层残差流知道自己这次回答的置信度，知道自己要reward hacking，甚至有整体规划（比如写诗的押韵）。
你跟机器人说"把桌上的杯子拿过来"，模型秒懂。它在内部表征里编码了完整的意图：识别杯子、规划路径、调整抓取姿态、移动到目标位置。这是一个高维的、并行的、完整的语义表征——和 Transformer 中间层的 hidden states 一模一样。然后呢？这个高维意图要通过什么接口输出？关节角度。电机扭矩。一个一个的控制信号。一步一步地执行。
之前所有 MTP 方案都试图在输出端"加速"——让喉咙说得更快，一次吐更多 token。但 Future Summaries 换了一个方向：不加速喉咙，而是先传意图。"Beyond Multi-Token Prediction: Future Summaries"。VLA（Vision-Language-Action）领域已经有人这么做了——在语义坍缩为离散 token 之前，直接从中间层截取高维连续隐状态（hidden states）喂给运动控制器，效果远超“先生成文本再解析”的方案。
"Why Diffusion Language Models Struggle with Truly Parallel Decoding?" 揭示了一个讽刺的事实：LLaDA 在很多快速解码设置下，退化成了从左到右的自回归。
推理优先，架构提升效率。线性注意力https://mp.weixin.qq.com/s/A8eJvexEDZwYMOsf1lSJAA
对齐的代价：https://mp.weixin.qq.com/s/O2vOsdFxAjsqgK5Uas5qzw

SAE（Sparse Autoencoder）：拆黑箱不是在哪层动刀都行。 你想分离"格式"和"内容"，就得在模型做"格式决策"的那层动手——太浅了关掉的是打字能力，太深了可能已经来不及了。第 22 层恰好是 Mistral-7B 做"该用什么格式输出"这个决策的位置。
激活函数的演进，从硬编码到自动学习

|            | ReLU+L1                | TopK             | JumpReLU                                   |
| ---------- | ---------------------- | ---------------- | ------------------------------------------ |
| 稀疏度控制 | λ 全局控制，耦合       | K 硬性截断，固定 | θ 每个特征独立学习                         |
| L0 可控性  | 间接（调 λ）           | 精确（= K）      | 自适应（θ 自动调节）                       |
| 梯度信号   | 有（但 L1 干扰大特征） | 边界处弱         | tanh 近似保证梯度                          |
| 灵活性     | 低                     | 中               | 高（简单 token 少激活，复杂 token 多激活） |

Natural Language Autoencoders Produce Unsupervised Explanations of LLM Activations：激活向量 -> AV 翻译成人话 -> AR 根据人话重建激活向量 -> 和原始激活向量算均方误差，传话游戏。

神秘小研究
https://mp.weixin.qq.com/s/yhrmzZhfUOn2x6cjQ-hgtg 模型输出json格式与语义是分开的
