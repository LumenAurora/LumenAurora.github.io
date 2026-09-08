---
title: "机制可解释性学习路径总览"
date: 2026-09-08
category: "机制可解释性"
tags:
  - "可解释性"
  - "学习路径"
  - "导读"
  - "导航"
description: "机制可解释性是本站体量最大的一族（28 篇），大多来自同一份长笔记的章节切分，本是完整学习路径但原文平铺。本页把它们串成带前置依赖的阅读路线，并标出归因图三部曲（入门→构建→解剖）的连续递进与每篇在路线里的位置。"
---

# 机制可解释性学习路径总览

> 机制可解释性是本站体量最大的一族（28 篇），大多来自同一份长笔记的章节切分，本是完整学习路径但原文平铺。本页把它们串成带前置依赖的阅读路线，并标出归因图三部曲（入门→构建→解剖）的连续递进与每篇在路线里的位置。

## 一、这份导读在做什么

机制可解释性（MI）是本站体量最大的一族笔记（28 篇）。它们大多来自同一份长笔记的章节切分，彼此**本来就是一条完整学习路径**——但原文按章节平铺，缺少"先读哪篇、为什么"的导航。本页把 28 篇重新串成一条带前置依赖的阅读路线，并标出每篇在路线里的位置与价值。

**一句话总纲**：可解释性的研究对象是同一个东西——残差流；不同方法只是在问关于它的不同层次的问题。先把 `unified-methodology`（统一图景）读懂，后面所有方法都会自动归位。

## 二、推荐阅读顺序

### 阶段 0 · 先建立直觉（1 天）

- [机制可解释性是什么](./what-is-mi)：目标、手段与电路发现流水线。先看这篇，建立"我们在逆向什么"的框架。
- [Transformer 的条件线性](./conditional-linearity)：为什么注意力头对输入是线性变换——整套方法学的地基。
- [特权基](./privileged-bases)：为什么某些坐标轴天然可解释。
- [路径分解](./path-decomposition)：残差流如何被各组件读写。

> 这四篇是"入门与基础"。读不懂后面的方法，多半是这里没过关。

### 阶段 1 · 电路分析方法（核心技能）

- [电路分析入门](./circuit-foundations)：组件级因果追踪的基本单位。
- [路径级因果追踪](./path-patching-eap-acdc)：Path Patching / EAP / ACDC。
- [Causal Scrubbing 与 SAE](./sae-and-causal-scrubbing)：用稀疏特征做因果干预。
- [前沿方法与综合工作流](./circuit-methods-frontier)：把上述方法串成可复用的实验流水线。

### 阶段 2 · Anthropic 系统教程（重点，含归因图三部曲）

按以下顺序读，三部曲是连续递进的：

1. [Anthropic 可解释性系统（七层路径）](./anthropic-mi-system)：全局总览，先建立地图。
2. [替换模型与 Transcoder](./replacement-model-transcoder)：归因图的构建基石。
3. **归因图三部曲（务必连读）**：
   - [归因图入门：是什么 / 怎么衔接](./attribution-graphs)
   - [归因图构建：从替换模型到计算快照](./attribution-graph-deepdive)
   - [归因图解剖与因果配方](./attribution-graph-anatomy)
4. [工具链、验证与实践](./toolchain-validation-practice)：动手跑通。

### 阶段 3 · 直觉与心智图景

- [初学者的直觉：文献审查与修正](./intuition-self-review)
- [LLM 与 VLM 的直觉世界模型](./intuition-world-model)
- [LLM 与人类认知的深度类比](./cognitive-science-analogies)
- [训练过程的可解释性世界模型](./developmental-interpretability)

### 阶段 4 · 方法论与诊断（回到元层面）

- [可解释性方法论的统一图景](./unified-methodology)：**全站 MI 的方法论总纲，建议读完阶段 0–2 后回头精读**。它把残差流作为唯一本体论基底，画出各方法的逻辑依赖图。
- [研究残差流 trivial 吗](./residual-stream-trivial)：回应"这活是不是太 trivial"的常见疑虑。
- [从观察到好故事](./observation-to-story)：好研究 = 动听故事 + 无可指摘实验。
- [机制可解释性的「松散」诊断](./mi-looseness-diagnosis)：为什么 MI 感觉不成体系，以及如何给自己定位。
- [VLM 七轴穷举框架](./vlm-seven-axis) 与 [VLM 可解释性学习路线](./vlm-learning-roadmap)：VLM 专项入口。

### 阶段 5 · 跨域桥接

- [扩散模型的可解释性](./diffusion-interpretability)
- [行为可解释性](./behavioral-interpretability)
- [注意力分析](./attention-analysis)

## 三、如果你只想挑一条线

- **想快速判断某个 MI 论文值不值得读**：先 `unified-methodology` → `mi-looseness-diagnosis` → `observation-to-story`。
- **想动手做电路实验**：阶段 0 → 阶段 1 → 阶段 2 的归因图三部曲 + 工具链实践。
- **做 VLM 可解释性**：阶段 0 → `vlm-seven-axis` → `vlm-learning-roadmap`，再补 `intuition-world-model`。
- **做扩散模型可解释性**：阶段 0 的线性/特权基基础 → `diffusion-interpretability`。

## 四、相关导读

本站其他导读枢纽，读完本路线后可按需延伸：

- 研究方法论总览 → [研究方法论总览](/notes/methodology/hub)
- 领域综述导读 → [领域综述导读](/notes/surveys/hub)
- 机器学习理论精读路径 → [机器学习理论 · 精读路径总览](/notes/ml-theory/roadmap)
- 随笔总览 → [随笔总览](/notes/essays/hub)
- 研究品味 → [什么是「有趣」的研究](/notes/research-taste/what-is-interesting)
