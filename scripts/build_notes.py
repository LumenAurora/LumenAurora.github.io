# -*- coding: utf-8 -*-
"""
把 Obsidian 私人笔记转换为博客文章。

职责：
  1. 按映射表挑选源文件（只选知识类 / 客观 insight 类）
  2. 剔除敏感行段（未发表研究、私人信息、审稿人代号、AI 对话痕迹等）
  3. 清理 Obsidian 专有语法（wikilink / callout / 高亮）
  4. 规范化标题层级、注入 frontmatter
输出：notes/<category>/<slug>.md
"""
import os
import re
import sys
import time
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_ROOT = Path(r"D:\1A数据文件夹\大学\计算机\人工智能")
OUT_ROOT = ROOT / "notes"

# ---------------------------------------------------------------- 文章映射表
# drops: 需删除的行区间 [(start, end)]，1-indexed 闭区间
# drop_regex: 整行匹配该正则即删除
A = []


def art(slug, title, srcs, category, tags=None, drops=None,
        drop_regex=None, intro=None, sections=None, replace=None):
    """replace: [(正则, 替换串)]，用于对原文做定点改写（润色措辞、脱敏、去对话体）。

    与 drop_regex 的区别：drop_regex 整行删除；replace 保留该行但改写其中词句。
    """
    A.append(dict(slug=slug, title=title, srcs=srcs, category=category,
                  tags=tags or [], drops=drops or [], drop_regex=drop_regex or [],
                  intro=intro, sections=sections, replace=replace or []))


# ============ 机制可解释性 ============
# ---- 基础长文系列（由 学习/可解释学习.md 按章节拆分，构成一条学习路径）----
art("interpretability/what-is-mi",
    "机制可解释性是什么：目标、手段与电路发现流水线",
    [("学习/可解释学习.md", (1, 81))], "机制可解释性",
    ["可解释性", "机制可解释性", "电路发现", "入门"],
    drop_regex=[r"^如果你还想了解.*$"],
    intro="从「想让人类理解 AI 为什么这么做」这一朴素愿望出发，区分广义可解释性与"
          "机制性可解释性，并给出这一领域的三层目标（科学认知 / 安全保障 / 工程操控）、"
          "常用技术手段，以及「电路发现」的五步流水线。")

art("interpretability/conditional-linearity",
    "Transformer 的条件线性：为什么线性代数能解剖模型",
    [("学习/可解释学习.md", (82, 135))], "机制可解释性",
    ["可解释性", "条件线性", "注意力", "残差流"],
    intro="注意力头的输出是 `A·X·W_V·W_O`：只要把注意力模式 A 「冻结」，"
          "整个头对输入 X 就是一次纯线性变换。本文解释这个反直觉的事实，"
          "以及它如何成为归因分析、路径叠加与整套可解释性方法学的地基。")

art("interpretability/privileged-bases",
    "特权基：为什么 Transformer 的某些坐标轴是可解释的",
    [("学习/可解释学习.md", (136, 315))], "机制可解释性",
    ["可解释性", "特权基", "非线性", "旋转不变性"],
    intro="向量空间的坐标轴本来是任意贴上去的，但非线性操作（逐元素激活、Softmax）"
          "会打破旋转对称性，从而「挑出」某些特殊方向 —— 这就是特权基。"
          "本文说明它为何让逐神经元分析重新变得有意义。")

art("interpretability/path-decomposition",
    "路径分解：把 Transformer 展开成一串虚拟权重",
    [("学习/可解释学习.md", (316, 543))], "机制可解释性",
    ["可解释性", "路径分解", "虚拟权重", "Induction Head"],
    intro="利用残差流的线性性，可以把一整个（去除 MLP 的）Transformer 展开成"
          "「路径之和」：先合成虚拟权重，再解剖 QK 电路与 OV 电路，"
          "最后用 skip-trigram 与 Induction Head 两个真实例子走完全流程。")

# ---- 电路分析方法系列（学习/可解释学习.md 544-1410 拆分）----
art("interpretability/circuit-foundations",
    "电路分析入门：从先备知识到 Logit Lens 与激活修补",
    [("学习/可解释学习.md", (544, 729))], "机制可解释性",
    ["可解释性", "电路分析", "Logit Lens", "激活修补"],
    intro="电路分析是机制可解释性的核心工具箱。本篇先铺垫先备知识 —— "
          "Transformer 三件套、QK 与 OV 电路、什么是「电路」、叠加与多语义性、"
          "以及观察与干预的根本区别；再讲最朴素的透视镜 Logit Lens / Tuned Lens，"
          "以及电路分析的基石：激活修补（activation patching）。")

art("interpretability/path-patching-eap-acdc",
    "路径级因果追踪：Path Patching、EAP 与 ACDC",
    [("学习/可解释学习.md", (730, 929))], "机制可解释性",
    ["可解释性", "Path Patching", "EAP", "ACDC", "因果干预"],
    intro="在激活修补的基础上，如何更细粒度、更高效、更自动化地定位电路？"
          "本篇讲三种递进的方法：把因果追踪下沉到路径级的 Path Patching、"
          "用梯度近似把开销降低约三个数量级的 Attribution Patching（EAP）、"
          "以及自动化的电路发现 ACDC。")

art("interpretability/sae-and-causal-scrubbing",
    "验证与破解叠加：Causal Scrubbing 与稀疏自编码器",
    [("学习/可解释学习.md", (930, 1125))], "机制可解释性",
    ["可解释性", "SAE", "稀疏自编码器", "Causal Scrubbing", "叠加"],
    intro="找到候选电路之后，如何严格验证它？又该如何处理「一个神经元对应多个概念」的叠加问题？"
          "本篇讲严格验证电路假设的 Causal Scrubbing、破解叠加的关键工具稀疏自编码器（SAE），"
          "以及把 SAE 与因果干预结合起来的 Sparse Feature Circuits。")

art("interpretability/circuit-methods-frontier",
    "电路分析前沿：Transcoder、DAS 与综合工作流",
    [("学习/可解释学习.md", (1126, 1410))], "机制可解释性",
    ["可解释性", "Transcoder", "DAS", "工具链", "选型"],
    intro="本篇覆盖穿透 MLP 黑盒的 Transcoder 与 Cross-Layer Transcoder、"
          "基于因果抽象的分布式对齐搜索（DAS），"
          "并给出把这些方法串起来的综合工作流、工具与上手路径，以及一份方法选型速查表。")

# ---- Anthropic 系统教程（学习/可解释学习.md 1411-3547 拆分）----
art("interpretability/anthropic-mi-system",
    "Anthropic 的可解释性系统：从黑盒到玻璃盒的七层路径",
    [("学习/可解释学习.md", (1411, 2131))], "机制可解释性",
    ["可解释性", "Anthropic", "归因图", "SAE", "初学者"],
    drops=[(1, 17)],  # 删除源文件开头的文档标题与 Obsidian 目录导航（网页 TOC 无用，且锚点已剥离）
    intro="一份以 Anthropic 工作为线索、面向初学者的机制可解释性系统导览：从残差流视角、"
          "QK/OV 分解、Induction Head，到 Superposition、稀疏自编码器、Circuit Tracing 与 "
          "QK Attribution，最后汇总技术栈、应用案例与学习路线图。")

art("interpretability/replacement-model-transcoder",
    "替换模型与 Cross-Layer Transcoder：把 MLP 和 Attention 拆开看",
    [("学习/可解释学习.md", (2132, 2359))], "机制可解释性",
    ["可解释性", "替换模型", "Transcoder", "CLT", "LORSA"],
    intro="Anthropic 近年把「直接分析神经元」推进为「用训练好的替换模型替代原组件」："
          "MLP 被 Cross-Layer Transcoder 替代、Attention 被 Multi-Token Transcoder / LORSA 替代，"
          "最终得到 Complete Replacement Model。本文讲这套替换思想的动机、架构与学到的内容。")

art("interpretability/attribution-graph-deepdive",
    "归因图构建：从替换模型到完整计算快照",
    [("学习/可解释学习.md", (2360, 2893))], "机制可解释性",
    ["可解释性", "归因图", "Jacobian", "IOI", "计算图"],
    intro="归因图（attribution graph）把一次前向传播展开成节点（特征）与边（特征间因果效应）的计算图。"
          "本文保姆级拆解其生成算法（前向收集激活 → 反向 Jacobian 追踪 → 后处理可视化），"
          "并以 IOI 任务为例走通，最后补全 QK Attribution 这块拼图。")

art("interpretability/toolchain-validation-practice",
    "工具链工作流、验证体系与动手实践",
    [("学习/可解释学习.md", (2894, 3209))], "机制可解释性",
    ["可解释性", "工具链", "验证", "因果干预", "实践"],
    intro="把前述替换模型、归因图等方法串成端到端工作流，并讨论「什么算被解释了」这一根本问题："
          "从重建保真度、归因图内在一致性，到因果干预测试的金标准，最后给出哲学总结与本地动手路线。")

art("interpretability/attribution-graph-anatomy",
    "归因图的解剖与因果干预配方",
    [("学习/可解释学习.md", (3210, 3547))], "机制可解释性",
    ["可解释性", "归因图", "因果干预", "注意力", "CoT"],
    intro="聚焦归因图本身的精确含义：节点到底是什么、边到底度量什么、归因图的完整构成，"
          "以及「注意力分析」一词在不同粒度下究竟指什么。最后给出一个可执行的因果证明配方"
          "（Teacher-Forcing 局部干预 + Attention Knockout + Path Patching + 双向验证）。")

# ---- 直觉与心智图景 / 方法论 / 专项 / 诊断（学习/可解释学习.md 3544-5933 拆分）----
art("interpretability/intuition-self-review",
    "初学者的可解释性直觉：文献审查与修正",
    [("学习/可解释学习.md", (3544, 3712))], "机制可解释性",
    ["可解释性", "直觉", "残差流", "文献审查", "初学者"],
    drops=[(1, 1)],  # 删除源文档标题（已由 H1 承载）
    intro="一份对初学者常见可解释性直觉的文献审查：残差流是不是「草稿纸」、注意力层与 MLP "
          "如何分工、模型「嘴上说不出」的隐知识、CoT 的忠实性、世界模型与表征几何、"
          "多语义性与叠加、电路视角、静态/动态框架——逐条核对文献，标出哪些直觉正确、"
          "哪些需要精化、哪些一开始就是盲区。")

art("interpretability/intuition-world-model",
    "LLM 与 VLM 的直觉世界模型：给研究者的心智图景",
    [("学习/可解释学习.md", (3713, 3930))], "机制可解释性",
    ["可解释性", "世界模型", "表征", "VLM", "心智模型"],
    drops=[(1, 1)],
    intro="把对 LLM / VLM 的直觉组织成一幅完整的心智图景：残差流作为工作记忆空间、"
          "特征的几何学、注意力头与 MLP 的精细分工、隐状态里的「内部现实」、"
          "CoT 与计算深度的动态图景，以及 VLM 特有的直觉图景与跨模态鸿沟。")

art("interpretability/unified-methodology",
    "可解释性方法论的统一图景：以残差流为主干",
    [("学习/可解释学习.md", (3943, 4243))], "机制可解释性",
    ["可解释性", "方法论", "残差流", "统一框架", "SAE"],
    drops=[(1, 1)],
    intro="为什么可解释性的方法让人感觉「不统一」？本文以残差流为唯一本体论基底，"
          "把方法归到四个层次问题：残差流里存着什么（特征/表征）、这些特征长什么形状"
          "（流形/几何）、如何翻译成人话（解码）、谁写进去又怎么流动（电路），"
          "并画出各方法的逻辑依赖图。")

art("interpretability/residual-stream-trivial",
    "研究残差流，到底 trivial 不 trivial？",
    [("学习/可解释学习.md", (4248, 4341))], "机制可解释性",
    ["可解释性", "残差流", "研究品味", "随笔"],
    drops=[(1, 1)],
    intro="「研究残差流」听起来像是最 trivial 的入门活，却又让人感觉深不见底。"
          "本文分三层回应：为什么不 trivial（认知/结构/下游价值）、为什么这种「trivial 感」"
          "本身值得尊重、以及真正的问题在于你在研究哪个层次。")

art("interpretability/cognitive-science-analogies",
    "LLM 计算过程与人类认知的深度类比",
    [("学习/可解释学习.md", (4342, 4593))], "机制可解释性",
    ["可解释性", "认知科学", "类比", "System 1/2", "工作记忆"],
    drops=[(1, 1)],
    intro="用一个为可解释性研究者构建直觉的认知科学框架，把 LLM 计算过程与人类认知类比："
          "双过程理论、层间动态 ↔ 感知层级、注意力 ↔ 工作记忆门控、残差流 ↔ 全局工作空间、"
          "CoT ↔ 问题求解理论，并明确哪些类比会误导你。")

art("interpretability/developmental-interpretability",
    "训练过程的可解释性世界模型：从随机初始化到对齐模型",
    [("学习/可解释学习.md", (4594, 4866))], "机制可解释性",
    ["可解释性", "训练动力学", "预训练", "SFT", "RLHF", "发育"],
    drops=[(1, 1)],
    intro="把一次训练看成模型的「发育史」：预训练从混沌到有序的相变序列、Grokking、"
          "归纳头的形成、SFT 改变接口不改变底层、RLHF/RLVR 真正改变模型「想要什么」，"
          "最后给出各阶段的可解释性视角统一表。")

art("interpretability/vlm-seven-axis",
    "VLM 可解释性研究的七轴穷举框架",
    [("学习/可解释学习.md", (4867, 5186))], "机制可解释性",
    ["VLM", "可解释性", "研究框架", "方法论", "穷举"],
    drops=[(1, 1), (197, 274)],  # 标题 + 删除「生成 5 篇可投稿级论文 idea」私有研究方向
    intro="把一篇 VLM 可解释性论文看成在七个轴上各取一个值的组合：研究对象、分析粒度、"
          "研究问题、研究方法、目标现象、验证任务、对比维度。本文给出七轴定义、组合矩阵与"
          "评估研究价值的速查表，并附一份从穷举到精选的新手 SOP。")

art("interpretability/observation-to-story",
    "从观察到好故事：可解释性研究的方法论",
    [("学习/可解释学习.md", (5187, 5495))], "机制可解释性",
    ["可解释性", "研究方法", "研究品味", "方法论", "证据金字塔"],
    drops=[(1, 1)],
    intro="好研究 = 动听的故事 + 无可指摘的实验。本文给出从观察到好故事的系统性路径："
          "五层过滤器（反常 / 认知杠杆 / 必然性链条 / 可行性 / So What）、如何训练「研究嗅觉」"
          "（反事实阅读、审稿人模拟、领域地图、失败考古），以及可解释性特有的证据金字塔与 7 步流水线。")

art("interpretability/vlm-learning-roadmap",
    "VLM 可解释性学习路线与资源建议",
    [("学习/可解释学习.md", (5496, 5640))], "机制可解释性",
    ["VLM", "可解释性", "学习路线", "资源", "ARENA"],
    drops=[(1, 1)],
    intro="一份面向 VLM 机制可解释性的系统学习路线：先打牢 MI 基础，再进入 VLM 专项必读论文，"
          "补全工具链，按 ARENA 教程系统化动手设计实验，并保持跟踪前沿会议与社区。")

art("interpretability/mi-looseness-diagnosis",
    "机制可解释性的「松散」：一个精确的诊断",
    [("学习/可解释学习.md", (5641, 5933))], "机制可解释性",
    ["可解释性", "研究品味", "学习力学", "统一框架", "随笔"],
    drops=[(1, 1)],
    intro="机制可解释性常让人感觉「松散」、不成体系。本文精确诊断这种松散：它是否真是问题、"
          "松散之下是否藏着统一性、学习力学（learning dynamics）又能如何帮助「收紧」它，"
          "以及你该如何在松散中给自己定位。")

art("interpretability/attribution-graphs",
    "归因图、特征分解与 QK 归因：Transformer 可解释性方法入门",
    [("学习/可解释博文.md", None)], "机制可解释性",
    ["可解释性", "Transformer", "归因图", "SAE"],
    drops=[(1, 2)],
    intro="这是一份从零开始的 Transformer 可解释性方法说明书：把一次前向传播拆开，"
          "讲清楚归因图（attribution graphs）、特征分解与 QK 归因分别在做什么、"
          "彼此如何衔接。")

# 原 interpretability/interpretability-map（整文件 1:1 映射自 经典方法/可解释性.md，未打磨思维流 dump）
# 已合并进 interpretability/unified-methodology（源 学习/可解释学习.md 3943–4247，已覆盖其全部观点），
# 由 interpretability/roadmap 承接「全景框架」的导读角色。故删除该 art() 条目。

art("interpretability/diffusion-interpretability",
    "扩散模型的可解释性",
    [("学习/扩散模型可解释性.md", None)], "机制可解释性",
    ["可解释性", "扩散模型", "表征"],
    drops=[(1, 1)],
    drop_regex=[r"^好，这需要多方向同时搜索.*$"])

art("interpretability/behavioral-interpretability",
    "行为可解释性：模型想到什么，与它说出什么",
    [("学习/行为可解释.md", None), ("学习/可解释.md", None)], "机制可解释性",
    ["可解释性", "行为可解释", "VLM", "CoT"],
    sections=["行为层面的可解释性", "表示与架构层面的观察"])

art("interpretability/attention-analysis",
    "注意力分析方法梳理",
    [("论文笔记/注意力分析.md", None)], "机制可解释性",
    ["可解释性", "注意力"])

# 机制可解释性学习路径总览（串联 28 篇的导航枢纽；替代原 interpretability-map 的「全景框架」角色）
art("interpretability/roadmap",
    "机制可解释性学习路径总览",
    [("drafts/interpretability-roadmap.md", None)], "机制可解释性",
    ["可解释性", "学习路径", "导读", "导航"],
    intro="机制可解释性是本站体量最大的一族（28 篇），大多来自同一份长笔记的章节切分，"
          "本是完整学习路径但原文平铺。本页把它们串成带前置依赖的阅读路线，"
          "并标出归因图三部曲（入门→构建→解剖）的连续递进与每篇在路线里的位置。")

# ============ 生成模型 ============
art("generative/diffusion-models",
    "扩散模型：从变分下界到采样加速",
    [("学习/扩散模型.md", None)], "生成模型",
    ["扩散模型", "生成模型", "SDE"])

art("generative/diffusion-post-training",
    "扩散模型的后训练",
    [("学习/扩散模型后训练.md", None)], "生成模型",
    ["扩散模型", "后训练", "对齐"])

art("generative/flow-and-gradient",
    "梯度流与流匹配",
    [("学习/梯度流.md", None)], "生成模型",
    ["流匹配", "梯度流", "生成模型"])

art("generative/deep-generative-models",
    "深度生成模型概览",
    [("学习/深度生成模型.md", None)], "生成模型",
    ["生成模型", "概览"])

# ============ 表征与世界模型 ============
art("representation/ssl-representation",
    "自监督表征学习：从零到精通",
    [("学习/表征学习.md", None)], "表征与世界模型",
    ["表征学习", "自监督", "对比学习"])

art("representation/world-models",
    "世界模型：VLA、JEPA 与 WAM",
    [("学习/世界模型.md", None)], "表征与世界模型",
    ["世界模型", "具身智能", "JEPA"])

art("representation/implicit-models",
    "隐式模型（Implicit Models）全面讲解",
    [("方向与道路/小众网络.md", None)], "表征与世界模型",
    ["隐式模型", "DEQ", "深度均衡模型"])

art("representation/autoregressive-internals",
    "自回归大模型的内部机制",
    [("学习/深入自回归大模型.md", None)], "表征与世界模型",
    ["自回归", "LLM", "内部机制"])

# ============ 后训练与推理 ============
art("post-training/post-training",
    "大模型后训练：SFT、RLHF 与 RLVR",
    [("学习/大模型后训练.md", None)], "后训练与推理",
    ["后训练", "SFT", "RLHF", "对齐"])

art("post-training/post-training-techniques",
    "后训练技术谱系",
    [("论文之道/后训练技术.md", None)], "后训练与推理",
    ["后训练", "技术谱系"])

art("post-training/beyond-attention",
    "注意力之外的架构探索",
    [("学习/attention之外.md", None)], "后训练与推理",
    ["架构", "注意力", "线性注意力"])

# ============ 强化学习 ============
art("rl/rl-principles",
    "强化学习纲要",
    [("学习/RL.md", None)], "强化学习",
    ["强化学习", "策略优化"])

art("rl/rl-book-of-ai",
    "从零开始：RL、监督学习与最优控制的严格区分",
    [("学习/RL book of AI.md", None)], "强化学习",
    ["强化学习", "最优控制", "入门"])

art("rl/why-human-rl",
    "人为什么靠「RL」学会打麻将",
    [("学习/Why Human.md", None)], "强化学习",
    ["强化学习", "认知科学", "类比"])

art("rl/rl-vs-supervised",
    "强化学习与监督学习的根本区别",
    [("模型大全/答疑.md", None)], "强化学习",
    ["强化学习", "监督学习", "辨析"])

# ============ 数学基础 ============
art("math/sde-primer",
    "随机微分方程入门：从直觉到量化金融与 Diffusion",
    [("数学/SDE.md", None)], "数学基础",
    ["SDE", "随机过程", "扩散模型"])

art("math/math-for-learning",
    "学习理论背后的数学",
    [("学习的数学.md", None)], "数学基础",
    ["学习理论", "数学", "优化"])

art("math/math-interpretation",
    "深度学习中的数学概念解读",
    [("数学/数学解读.md", None)], "数学基础",
    ["数学", "梯度", "深度学习"])

# ============ 机器学习理论（由 资料/understanding ML 按章节拆分，构成一条理论课本路径）============
# 源文档首行「本笔记采用AI辅助」为生产方法说明，不在任何行区间内，自动不发布。
SRC_UML = "资料/understanding ML/understanding ML讲解笔记.md"

art("ml-theory/math-viewpoint",
    "以数学观之：机器学习理论背后的数学工具对应关系",
    [(SRC_UML, (2, 32))], "机器学习理论",
    ["机器学习理论", "数学基础", "线性代数", "概率", "初学者"],
    intro="机器学习理论（尤其是泛化界、PAC 框架）常被误以为需要很深的数学。本文先建立「数学工具 ↔ 理论概念」的对应关系："
          "线性代数、概率论、不等式各在理论中扮演什么角色，以及为什么说「换术语」只是表象、底层结构一致。"
          "帮初学者在正式进入证明前先校准工具箱。")

art("ml-theory/ch2-world-model-framework",
    "第二章（一）：从世界模型到形式化框架",
    [(SRC_UML, (35, 443))], "机器学习理论",
    ["机器学习理论", "统计学习框架", "形式化", "初学者"],
    intro="第二章回答一个根本问题：机器学习理论到底在证明什么？本文先建立整章的「世界模型」——"
          "区分世界与样本、区分真实规律 f 与学习者的猜测 h，再给出统计学习框架的形式化定义"
          "（X、Y、f、D、S、h 各是什么），把模糊的「学」变成可讨论的数学对象。")

art("ml-theory/ch2-risk-and-erm",
    "第二章（二）：真实风险、经验风险与 ERM",
    [(SRC_UML, (444, 725))], "机器学习理论",
    ["机器学习理论", "经验风险最小化", "ERM", "Loss"],
    intro="有了形式化框架，就可以定义「模型到底好不好」：真实风险（期望损失）与经验风险（训练误差）。"
          "本文讲清二者的区别，并引出经验风险最小化（ERM）——用「局部世界」（训练集）估计「真实世界」"
          "为何如此自然又如此合理。")

art("ml-theory/ch2-overfitting-inductive-bias",
    "第二章（三）：过拟合的本质与归纳偏置",
    [(SRC_UML, (726, 1066))], "机器学习理论",
    ["机器学习理论", "过拟合", "归纳偏置", "泛化"],
    intro="ERM 看似无懈可击，却埋着过拟合的危机：把训练集背下来，训练误差为零但真实误差爆炸。"
          "本文用经典反例讲清过拟合本质，并引出机器学习的真正解药——归纳偏置（inductive bias）："
          "你必须事先带一点偏见，才能从有限样本学到可泛化的规律。")

art("ml-theory/ch2-finite-generalization-proof",
    "第二章（四）：有限假设类的泛化保证（完整证明）",
    [(SRC_UML, (1067, 2054))], "机器学习理论",
    ["机器学习理论", "泛化界", "有限假设类", "Union Bound", "证明"],
    intro="整章的高潮：有限假设类下，ERM 选出的假设能以高概率近似最优。本文逐步拆解证明——"
          "Realizability 与 i.i.d. 两个假设、坏模型如何「骗过」训练集、Union Bound 如何控制「可坏模型不止一个」、"
          "最后反推出样本复杂度，并逐参数解读公式，把它压缩成可机械复现的证明模板。")

art("ml-theory/ch2-extensions-exercises",
    "第二章（五）：延展、层次塔与习题",
    [(SRC_UML, (2055, 3186))], "机器学习理论",
    ["机器学习理论", "Uniform Convergence", "习题", "抽象层次"],
    intro="证明之后，本章还埋下 Uniform Convergence 的伏笔、辨析「finite H 只是新手版本」等常见错觉，"
          "用抽象层次塔梳理整章逻辑，并逐题解析课后习题（记忆分类器、经验风险的无偏性、Axis-Aligned Rectangles 等），"
          "最后把第二章压缩成可长期记住的自动反应。")

art("ml-theory/ch3-pac-definition",
    "第三章（一）：PAC 学习——从「能泛化」到「可学习」",
    [(SRC_UML, (3189, 3700))], "机器学习理论",
    ["机器学习理论", "PAC", "可学习性", "定义"],
    intro="第二章只证明「某个算法在有限类上能泛化」；第三章把问题升级为「学习问题本身是否可学习」。"
          "本文给出 PAC 学习的正式定义，逐层解读量词顺序、两层随机性、ε 与 δ 的语义，"
          "并解释为什么不能要求 ε=0、δ=0。")

art("ml-theory/ch3-sample-complexity-agnostic",
    "第三章（二）：Sample Complexity 与 Agnostic PAC",
    [(SRC_UML, (3701, 4168))], "机器学习理论",
    ["机器学习理论", "Sample Complexity", "Agnostic PAC", "Realizability"],
    intro="把第二章的有限类定理重新解释为 PAC 样本复杂度，再迈出关键一步：删掉 Realizability 假设，进入 Agnostic PAC——"
          "世界不再有确定的 f，而是直接定义联合分布 D over X×Y。本文讲清这一「世界模型」升级为何必要，"
          "以及它如何让理论更贴近真实。")

art("ml-theory/ch3-bayes-agnostic-pac",
    "第三章（三）：Bayes Optimal Predictor 与 Agnostic PAC",
    [(SRC_UML, (4169, 4812))], "机器学习理论",
    ["机器学习理论", "Bayes", "Agnostic PAC", "误差分解"],
    intro="如果知道整个分布 D，最佳决策是什么？本文给出 Bayes Optimal Predictor 及其证明，并把它作为理论最优基准。"
          "随后给出 Agnostic PAC 的正式目标，展示它如何自然地把机器学习的三个误差来源（近似 / 估计 / 不可知）分开，"
          "并解释为什么 Agnostic PAC 自动包含普通 PAC。")

art("ml-theory/ch3-general-loss",
    "第三章（四）：General Loss 抽象化与 Proper/Improper Learning",
    [(SRC_UML, (4813, 5320))], "机器学习理论",
    ["机器学习理论", "Loss", "General Loss", "Proper Learning"],
    intro="「分类」只是外壳。本文把 Loss 抽象成任务自己定义的「什么叫犯错」，得到 True Risk / Empirical Risk 的最终形式，"
          "使回归等任务自然进入框架；进而定义 General Agnostic PAC，并区分 Proper Learning 与 Improper Learning——"
          "二者真正区分的是「你允许哪些候选解」。")

art("ml-theory/ch3-proof-tools-exercises",
    "第三章（五）：证明工具箱、习题与极限压缩",
    [(SRC_UML, (5321, 6783))], "机器学习理论",
    ["机器学习理论", "证明工具", "习题", "Measurability"],
    intro="第三章真正值钱的是可迁移的证明工具：量词审计、区分三种「未知」、pointwise→expected 优化等六个工具，"
          "以及 Measurability 等技术细节。本文逐题解析习题（Sample Complexity 单调性、无限 H 照样可学、"
          "Concentric Circles、i.i.d. 的必要性、No-Free-Lunch），最后把第三章压缩成「八句话」并预测第四章会做什么。")

art("ml-theory/ch4-motivation-representative",
    "第四章（一）：动机与 ε-representative sample",
    [(SRC_UML, (6786, 7092))], "机器学习理论",
    ["机器学习理论", "Uniform Convergence", "ε-representative", "ERM"],
    intro="第二章只证明「固定一个 h」时经验风险逼近真实风险；但 ERM 选出的 h_S 依赖训练集，不是固定的。"
          "本文讲清这个漏洞为何致命，并引入 ε-representative sample——训练集「足够代表世界」时，ERM 的 h_S 也近似最优。"
          "这是 Uniform Convergence 故事的真正起点。")

art("ml-theory/ch4-core-lemma-uc-finite",
    "第四章（二）：核心引理、Uniform Convergence 定义与有限类证明",
    [(SRC_UML, (7093, 7760))], "机器学习理论",
    ["机器学习理论", "Uniform Convergence", "Lemma 4.2", "有限假设类"],
    intro="Lemma 4.2 证明：只要 Uniform Convergence 成立，ERM 就泛化。本文给出证明全貌与「为什么偏偏用 ε/2」的直觉，"
          "再定义 Uniform Convergence 本身，并证明有限假设类天然满足它（取补集、并事件、Union Bound 三步）。")

art("ml-theory/ch4-hoeffding",
    "第四章（三）：Hoeffding 不等式及其完整证明",
    [(SRC_UML, (7761, 8640))], "机器学习理论",
    ["机器学习理论", "Hoeffding", "集中不等式", "证明"],
    intro="固定一个 h 时，经验风险与真实风险的差距由 Hoeffding 不等式控制。本文从直觉讲到有限样本版「大数定律」，"
          "再从头拆开证明 Hoeffding（中心化、指数化、凸性、Hoeffding's Lemma、选择 λ、上下尾），"
          "把它压缩成可复现的模板。")

art("ml-theory/ch4-back-to-ml-union-bound",
    "第四章（四）：放回机器学习、Union Bound 与样本复杂度",
    [(SRC_UML, (8641, 9037))], "机器学习理论",
    ["机器学习理论", "Union Bound", "样本复杂度", "Agnostic PAC"],
    intro="把 Hoeffding 放回机器学习，用 Union Bound 从固定 h 升级到整个有限 H；反解样本复杂度，得到 Agnostic PAC 的样本复杂度界。"
          "本文还解释一个反直觉的点：第二章是 1/ε，第四章却变成 1/ε²——二者解决的是本质不同的任务。")

art("ml-theory/ch4-toolbox-applicability",
    "第四章（五）：证明工具箱与 Uniform Convergence 的适用边界",
    [(SRC_UML, (9038, 10052))], "机器学习理论",
    ["机器学习理论", "证明工具箱", "适用边界", "Discretization"],
    intro="把第四章证明提炼成可迁移的工具箱（坏事件概率、data-dependent selection 警惕 pointwise bound、"
          "finite class→Union Bound、经验平均→集中、优化指数界参数、数清 error budget），"
          "并明确适用边界：H 无限、loss 不有界、数据不独立时各会怎样崩。")

art("ml-theory/ch4-discretization-exercises",
    "第四章（六）：Discretization、习题与极限压缩",
    [(SRC_UML, (10053, 10804))], "机器学习理论",
    ["机器学习理论", "Discretization", "习题", "极限压缩"],
    intro="无限类能否先粗暴离散化？Remark 4.1 的 Discretization Trick 给出一种思路。本文解析习题 1"
          "（高概率趋零 ⇔ 期望趋零）、习题 2（Loss Range 推广），最后用世界模型与抽象层次塔收束第四章，"
          "并做极限压缩与对后续的前瞻。")

# ============ 研究品味（由 论文之道/分析类如何有趣.md 二次编排为系列）============
# 该源文件内容极长（两千余行），且混杂对话体、私人指代与重复章节，不适合 1:1 发布；
# 改为人工合成的五篇定稿（drafts/），按「定义 → 范本 → 选题 → 新时代 → 句法」组织。
art("research-taste/what-is-interesting",
    "什么是「有趣」的研究：五个可操作的维度",
    [("drafts/research-taste-what-is-interesting.md", None)], "研究品味",
    ["研究品味", "分析方法", "novelty", "选题"],
    intro="顶会分析论文的「惊讶感」通常来自四件事同时发生：选中承重信念、用极简实验让隐含预测与现实冲突、排除廉价解释、把冲突压缩成能生成新预测的新概念。本文把「有趣」拆成五个可度量、可追求的维度，并区分「有趣的结果」与「好课题」这两个常被混为一谈的概念。")

art("research-taste/classic-analyses",
    "顶会分析论文做对了什么：七篇范本拆解",
    [("drafts/research-taste-classic-analyses.md", None)], "研究品味",
    ["研究品味", "分析方法", "论文写作", "范本"],
    intro="列举七篇获奖或成为方法论范本的顶会分析论文，重点不是模仿题目，而是抽取「认知更新是如何被制造出来的」——它们共同的可复用结构，以及背后的共用技术栈（最小反事实、负对照、打破相关性、从终点到动态、相关升级到干预、重定义测量对象）。")

art("research-taste/topic-generation",
    "如何自上而下地产生研究课题",
    [("drafts/research-taste-topic-generation.md", None)], "研究品味",
    ["研究品味", "选题", "研究方法", "复利"],
    intro="最有效的起点不是「选一个新模型看看」，而是建立领域的承重信念地图，再用固定的「问题生成算子」系统地派生课题。本文给出因果—评测链条、承重假设的识别、八类算子、替代机制矩阵、证据阶梯、研究飞轮与一页纸选题模板，并附 NeurIPS 2026 的贡献类型说明。")

art("research-taste/foundation-era",
    "大模型时代的「有趣」：六类识别问题与十条范本",
    [("drafts/research-taste-foundation-era.md", None)], "研究品味",
    ["研究品味", "大模型", "分析方法", "评测"],
    intro="深度学习时代的分析范式不能直接外推到大模型时代——研究对象从固定函数变成有隐藏变量、有反馈、推理时计算可变的闭环系统。本文重定义新时代的「有趣」（结构中心性、跨模型半衰期、资产复用性），并拆解十条近期范本，提炼新时代技术栈、课题生成算子、三条复利主线和选题评分表。")

art("research-taste/sentence-patterns",
    "分析类论文的 18 个句法骨架",
    [("drafts/research-taste-sentence-patterns.md", None)], "研究品味",
    ["研究品味", "论文写作", "句法", "选题"],
    intro="顶会分析论文常用一套「句法」把研究对象、机制变量、证据结构与行动结论黏合成可检验、可反驳、可行动的研究主张。本文给出 18 类句法骨架，每类附一篇对应范文，并点出三类常见卡点——缺可操控的 M、无反事实构造、「必要性」未写成条件句。")

# ============ 研究方法论 ============
art("methodology/benchmark-writing",
    "Benchmark 论文写作：从心理测量学借一套方法论",
    [("论文之道/benchmark写作.md", None)], "研究方法论",
    ["Benchmark", "论文写作", "评测"])

# 原 methodology/analysis-paper（整文件 1:1 映射）已重构为「研究品味」系列，见下方 research-taste/* 五篇合成文章。

art("methodology/idea-generation",
    "方法类论文的 Idea 生成框架",
    [("论文之道/故事线.md", None)], "研究方法论",
    ["Idea", "论文写作", "选题"])

art("methodology/algorithm-design",
    "AI 算法设计的底层逻辑：从生物启发到数学分析",
    [("论文之道/科学架构设计.md", None)], "研究方法论",
    ["算法设计", "方法论"])

art("methodology/method-paper",
    "方法类文章的实验观",
    [("论文之道/ai是工科——方法类文章.md", None)], "研究方法论",
    ["方法类论文", "实验设计"])

art("methodology/problem-scoping",
    "如何框定一个值得做的研究问题",
    [("论文之道/找问题类型研究.md", None)], "研究方法论",
    ["选题", "问题定义"])

art("methodology/reliability-benchmark",
    "可靠性 Benchmark 研究",
    [("论文之道/可靠性benchmark研究.md", None)], "研究方法论",
    ["Benchmark", "可靠性", "评测"],
    drop_regex=[r"^Critique Request.*$", r"^Identify specific ways.*$"])

art("methodology/review-dimensions",
    "审稿维度的系统梳理",
    [("审稿之法.md", (1, 184))], "研究方法论",
    ["审稿", "学术写作", "顶会"],
    intro="把 ICLR / ICML / NeurIPS 官方审稿表单的显性维度，以及实证研究揭示的"
          "隐性、元层面问题，整理成一份可检索的清单。既可用于投稿前预判审稿意见，"
          "也可用于审稿人自我校准评审角度。")

art("methodology/research-directions-map",
    "不动预训练，普通科研人员还能做什么：研究方向地图",
    [("想法/大模型能做的方法.md", (1, 467))], "研究方法论",
    ["研究方向", "领域地图", "PEFT", "RAG", "模型压缩"],
    intro="预训练基座动不了，可研究的空间依然很大 —— 这恰恰是当前的主战场。"
          "本文按 PEFT、提示工程、RAG、推理优化与压缩、数据工程、Agent、对齐与后训练、"
          "评测、多模态、可解释性、测试时策略、模型编辑、模型系统等方向，"
          "系统梳理每个方向的核心思想、硬件需求与科研切入点。")

art("methodology/training-free-inference-taxonomy",
    "推理时即插即用优化方法的完整分类体系",
    [("想法/大模型能做的方法.md", (468, 1331))], "研究方法论",
    ["推理优化", "Training-Free", "分类体系", "解码策略"],
    intro="不训练、只改推理过程，究竟能优化到什么程度？本文给出一份"
          " LLM / VLM 推理时 training-free 方法的完整分类框架：提示输入层、"
          "模型内部推理干预、解码策略、推理增强、后处理与验证、多模型协作、"
          "VLM 特有优化、计算效率与特殊场景，共九大类，并附开销—收益权衡。")

# ============ 领域综述 ============
art("surveys/icml-decade",
    "ICML 十年脉络",
    [("论文历史/ICML.md", None)], "领域综述",
    ["ICML", "领域综述"],
    drops=[(1, 3)],
    drop_regex=[r"^您说得非常对.*$", r"^\*\*根本性的定位问题\*\*.*$"])

art("surveys/cvpr-decade",
    "CVPR 十年谈",
    [("论文历史/CVPR十年谈.md", None)], "领域综述",
    ["CVPR", "计算机视觉", "领域综述"],
    # 注意：源文件整理自该视频。此归属曾由手工直接改到生成文件上，
    # 重建时被覆盖，因此固化在此处，避免再次丢失。
    intro="按年份梳理 CVPR 十年的技术主线与关注点迁移。"
          "整理自视频 https://www.bilibili.com/video/BV15yGC6LEVw")

art("surveys/gnn-evolution",
    "图神经网络的演进",
    [("论文历史/图神经网络.md", None)], "领域综述",
    ["图神经网络", "GNN", "领域综述"],
    drops=[(1, 1)])

art("surveys/time-series",
    "时间序列分析：方法脉络与现状",
    [("论文历史/时间序列分析.md", None)], "领域综述",
    ["时间序列", "领域综述"],
    drops=[(1, 1)])

art("surveys/transfer-learning-tta",
    "迁移学习族谱与 TTA 定位：从定义到大模型时代的生存现状",
    [("drafts/transfer-learning-tta.md", None)], "领域综述",
    ["迁移学习", "测试时适应", "域适应", "TTA", "分类体系"],
    intro="TTA 常被误读成一个独立范式，它其实是域适应在推理时约束下的极端形态——"
          "机器学习 → 迁移学习 → 域适应 → TTA。本文给出迁移学习的四层分类法"
          "（迁移什么 / 何种设定 / 技术路线 / 应用领域，重点展开 TTA 的 D1–D5 五个子类），"
          "用一张对比表钉死 TTA 与域泛化、标准 DA、SFDA、微调的边界，"
          "并分析大模型时代 TTA「感觉消失了」的三个原因、仍然不可替代的场景，以及它的现代新形态。")

art("surveys/nlp-to-llm",
    "从 NLP 到大模型",
    [("论文历史/NLP.md", None)], "领域综述",
    ["NLP", "大模型", "领域综述"])

art("surveys/anti-hallucination",
    "学界「抗幻觉」研究全史",
    [("方向与道路/学界嗨起来.md", None)], "领域综述",
    ["幻觉", "领域综述", "LLM"])

# ============ 随笔 ============
art("essays/complex-systems",
    "复杂系统与计算不可约",
    [("胡思乱想/复杂系统.md", None)], "随笔",
    ["复杂系统", "科学哲学"])

art("essays/embodied-intelligence",
    "具身智能：大脑做什么，小脑怎么做的",
    [("胡思乱想/具身智能.md", None)], "随笔",
    ["具身智能", "机器人"])

art("essays/big-questions",
    "尚未解决的开放问题",
    [("大问题.md", None)], "随笔",
    ["开放问题", "多模态", "因果性"])

art("essays/science-vs-engineering",
    "科学与工程的分野",
    [("科学工程/科学与工程.md", None)], "随笔",
    ["科学哲学", "工程"])

art("essays/hamming-compound",
    "复利思想与研究壁垒",
    [("方向与道路/大大大.md", None)], "随笔",
    ["研究方向", "复利"])

art("essays/lean-research",
    "以小博大的研究案例",
    [("方向与道路/小小小.md", None)], "随笔",
    ["研究方向", "算力", "案例"])

art("essays/choose-direction",
    "如何选择研究方向",
    [("方向与道路/选方向.md", None)], "随笔",
    ["研究方向", "选题"])

art("essays/path-forward",
    "路在何方",
    [("你还想学吗/路在何方.md", None)], "随笔",
    ["研究方向", "科研"])

art("essays/research-judgment",
    "大模型时代，顶会论文该怎么读",
    [("你还想学吗/大人，时代变了.md", None)], "随笔",
    ["论文阅读", "研究品味", "大模型", "初学者"],
    intro="传统深度学习时代读论文，学的是「模块怎么缝合」；大模型时代模块所剩无几，"
          "那读顶会还能学到什么？本文给出分析类、Benchmark 类、方法类论文各自的学法，"
          "以及一套读完即可自测的四问清单 —— 大模型时代的论文训练的是研究判断力，而非技术工具箱。")

art("essays/what-counts-as-research",
    "什么才算真正的科研贡献",
    [("方向与道路/意义在何.md", (1, 244))], "随笔",
    ["科研评价", "研究贡献", "机器人学", "算力约束"],
    intro="「轻量化研究到底有没有价值？」这个困惑，往往源于用 NLP / CV 的「刷点」框架"
          "去理解另一套评价体系。本文给出贡献的六种类型、机器人顶会审稿标准的权重排序，"
          "以及在有限算力下应该玩什么样的游戏。")

art("essays/science-as-vocation",
    "科学作为天职：韦伯《Science as a Vocation》要点",
    [("你还想学吗/叩开科学的门扉？.md", None)], "随笔",
    ["科学哲学", "韦伯", "学术志业", "阅读笔记"],
    intro="马克斯·韦伯 1917 年慕尼黑演讲的要点整理：以学术为业的外部风险、"
          "祛魅时代科学的意义、课堂上的价值中立，以及从事科学所需的激情、灵感与人格。")

# ============ 视觉语言模型 ============
art("vlm/visual-encoding",
    "VLM 视觉编码全解：从固定分辨率到原生分辨率",
    [("产业/VLM.md", None)], "视觉语言模型",
    ["VLM", "视觉编码", "AnyRes", "M-RoPE", "NaFlex", "动态分辨率"],
    drop_regex=[r"^好的，现在我有了充足的资料", r"上一轮回复中详细讲解"],
    intro="系统梳理视觉语言模型中「如何处理任意尺寸图像」这一核心工程问题：从固定分辨率的局限，"
          "到 AnyRes 切块、混合编码器、原生分辨率（NaViT / NaFlex / Qwen2-VL），"
          "再到视觉 Token 压缩的五大路线，并给出横向对比与选型指南。")

art("vlm/benchmarks",
    "VLM 评测基准梳理（以 GLM-5V-Turbo 为例）",
    [("产业/Bench.md", None)], "视觉语言模型",
    ["VLM", "Benchmark", "评测", "Agent"],
    intro="以一篇 VLM 技术报告为线索，梳理视觉编码器、RL 训练、多模态 Agent 各阶段常用的评测基准，"
          "并归纳出基础感知、跨模态对齐、多模态推理、多模态编码 / 工具使用、端到端 Agent 五大能力维度。")

art("vlm/architecture-evolution",
    "VLM 融合对齐的架构演进：从 CLIP 到 LLaVA 与原生多模态",
    [("论文笔记/视觉语言模型.md", None)], "视觉语言模型",
    ["VLM", "多模态", "CLIP", "LLaVA", "Q-Former", "架构演进"],
    drop_regex=[r"^!\[\["],
    intro="以「怎样把视觉信息融合进语言模型」为主线，梳理 VLM 的架构演进："
          "从双塔对比的 CLIP、引入 cross-attention 的 ALBEF / BLIP、"
          "用 Q-Former 做桥梁的 BLIP-2、极简投影的 LLaVA，一直到端到端的原生多模态，"
          "并给出各条路线的优缺点与当前社区共识。")

# ============ 工程与应用 ============
art("engineering/python-pytorch",
    "Python 与 PyTorch 工程基础",
    [("AI编程/代码能力.md", None)], "工程与应用",
    ["Python", "PyTorch", "工程基础", "自动微分"],
    drop_regex=[r"^!\[\[Pasted image"],
    intro="面向 AI 研究的工程入门：路径拼接、序列化、压缩包、PyTorch 数据管线与自动微分的本质"
          "（为什么标量求和才能反向传播），以及 Python 语法中容易混淆的点"
          "（*args / **kwargs、迭代器、装饰器等）。")

art("engineering/ai-in-finance",
    "AI 在金融领域的非平稳性难题与应对思路",
    [("量化AI/量化AI的大问题.md", None)], "工程与应用",
    ["量化金融", "非平稳性", "协整", "机制转换", "AI 应用"],
    intro="AI（无论是监督学习还是强化学习）隐含平稳性假设，而金融市场天生非平稳。"
          "本文梳理在金融中「寻找不变性」的几条出路：风格化事实、协整关系、机制转换、因果关系，"
          "以及元学习 / 序贯学习等方法论层面的适应策略。")

# ============ 二次编排（去对话体 / 措辞润色 / 脱敏后发布）============
# 这几篇原始笔记内容有价值，但夹杂对话体痕迹、网络用语或对同行的激烈评价，
# 因此通过 replace 做定点改写后再发布；必要处用 drop_regex 整行删除。
art("methodology/starting-research",
    "本科生如何开启科研：一份访谈整理的经验",
    [("drafts/starting-research.md", None)], "研究方法论",
    ["科研入门", "本科生", "科研经验", "研究方法"],
    intro="科研在论文纸面上看不到它究竟如何进行的。这份笔记整理自一次科研经验访谈，"
          "记录了一位本科生从「一年半颗粒无收」到「慢慢上道」的真实路径："
          "第一个项目为什么会失败、一次失败的答辩如何成为转折点、"
          "为什么应当尽早走完一个完整的科研循环，以及如何平衡学业与科研。")

art("methodology/real-research-vs-padding",
    "如何辨别真研究与跟风式工作：三个门槛",
    [("drafts/real-research-vs-padding.md", None)], "研究方法论",
    ["研究品味", "选题", "学术评价", "科研判断"],
    intro="一个方向会不会流于跟风，核心看三个门槛：理论门槛、落地门槛、可证伪门槛。"
          "本文用这三把尺子重新审视深度学习基础理论、新型架构、因果推理、高效优化，"
          "以及 AI Safety、AI for Science、垂直领域等常被误判的方向，"
          "最后给出避开跟风、做有价值工作的三条底线。")

art("essays/human-value-in-ai-era",
    "大模型时代，人不可替代的价值在哪里",
    [("你还想学吗/ai科研是什么东西.md", (202, 254))], "随笔",
    ["AI 与劳动", "人的价值", "大模型", "研究品味"],
    replace=[
        (r"你怀念的“以前绞尽脑汁设计特征的智力成果”", "所谓“绞尽脑汁设计特征的智力成果”"),
        (r"你说的", ""),
        (r"你一直吐槽的", "前文提到的"),
        (r"你之前吐槽的", "前文提到的"),
        (r"^你觉得", "认为"),
    ],
    intro="大模型淘汰的从来不是人的智力价值，而是「把智力浪费在执行层体力劳动」的那部分工作。"
          "本文梳理人在大模型时代真正不可替代的五件事：定义问题、构建底层理论、"
          "复杂系统的架构设计与风险兜底、价值观与对齐的顶层设计、跨学科的创造性融合。")

art("essays/bitter-lesson-inductive-bias",
    "苦涩教训再解读：为什么胜出的是 Attention 和扩散模型",
    [("你还想学吗/ai是个什么东西.md", None)], "随笔",
    ["苦涩教训", "归纳偏置", "架构演进", "初学者"],
    drop_regex=[
        r"^你这个类比简直绝妙.*$",
        r"^你这个\[doge\].*$",
        r"^你这句话总结得精准到.*$",
        r"^最后，再用你的幽默回敬一下：.*$",
    ],
    replace=[
        (r"^你的困惑在于", "困惑在于"),
        (r"^你的问题翻译过来就是", "这个问题翻译过来就是"),
        (r"^所以，你的\[doge\]表情用得太对了。因为", "因为"),
    ],
    intro="如果「越少的归纳偏置越好」，那为什么胜出的不是最朴素的残差 FFN，"
          "而是 Attention 和扩散模型？本文给出关键区分：苦涩教训追求的「少」，"
          "不是物理零件数的少，而是对目标功能预设的少 —— "
          "胜出的是那种能最高效地把算力转化为智能的、恰到好处的结构。")

# ---------------------------------------------------------------- 清洗规则
RE_WIKILINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
RE_HIGHLIGHT = re.compile(r"==([^=]+)==")
RE_CALLOUT = re.compile(r"^(\s*)>\s*\[!(\w+)\]([+-]?)\s*(.*)$")
RE_FM_DELIM = re.compile(r"^---\s*$")
# Obsidian 图片嵌入残留：形如 ![[Pasted image xxx.png]] 或剥离 wikilink 后的
# !学习/attachments/Pasted image xxx.png —— 图片不在仓库内，必须整行剔除
RE_EMBED_LEFT = re.compile(
    r"^!.*(?:Pasted image|attachments/|\.(?:png|jpe?g|gif|svg|webp))",
    re.IGNORECASE,
)
# AI 对话导出残留的检索引用标记，如 【turn2search10】【turn5fetch0】【turn18find0】
# 对读者是无意义的噪声，全局剥离
RE_TURN_MARK = re.compile(r"【turn\d+(?:search|fetch|find)\d+】")
# Obsidian / AI 导出残留的 HTML 锚点（目录导航用，网页上无功能且会让 TOC 链接失效），全局剥离
RE_ANCHOR = re.compile(r"<a\s+name=[^>]*>(?:\s*</a>)?")


def clean_wikilink(m):
    return m.group(2) or m.group(1)


def clean_callout(m):
    """Obsidian callout -> VitePress 容器"""
    indent, kind, fold, title = m.group(1), m.group(2).lower(), m.group(3), m.group(4).strip()
    mapping = {
        "note": "tip", "info": "info", "tip": "tip", "hint": "tip",
        "important": "tip", "warning": "warning", "caution": "warning",
        "danger": "danger", "error": "danger", "summary": "details",
        "abstract": "tip", "todo": "tip", "success": "tip",
        "question": "warning", "failure": "danger", "bug": "danger",
        "example": "details", "quote": "tip",
    }
    tag = mapping.get(kind, "tip")
    if tag == "details":
        return f"{indent}::: details {title or '展开'}"
    return f"{indent}::: {tag} {title}".rstrip()


def clean_text(lines, drop_regex, replace=None):
    out = []
    fm_started = False
    in_front = False
    seen_content = False
    for ln in lines:
        # 去掉源文件自带的 YAML frontmatter（仅当 --- 出现在文件最开头时才算）
        if RE_FM_DELIM.match(ln):
            if not fm_started and not seen_content:
                fm_started = True
                in_front = True
                continue
            elif fm_started and in_front:
                in_front = False
                continue
            else:
                out.append(ln)
                continue
        if in_front:
            continue
        # 图片嵌入残留整行剔除（不计入「已见正文」，避免污染 frontmatter 判定）
        if RE_EMBED_LEFT.match(ln.strip()):
            continue
        if ln.strip():
            seen_content = True

        # 剥离 HTML 锚点（Obsidian 目录导航残留，网页上无功能）
        ln = RE_ANCHOR.sub("", ln)
        if "</a>" in ln:
            ln = ln.replace("</a>", "")

        # 正则删除
        hit = False
        for rx in drop_regex:
            if re.match(rx, ln.strip()):
                hit = True
                break
        if hit:
            continue

        # 全局剥离 AI 对话导出的检索引用标记
        if RE_TURN_MARK.search(ln):
            ln = RE_TURN_MARK.sub("", ln)

        # 定点改写（润色措辞 / 脱敏 / 去对话体）
        for pat, rep in (replace or []):
            ln = re.sub(pat, rep, ln)

        # callout
        m = RE_CALLOUT.match(ln)
        if m:
            out.append(clean_callout(m))
            continue

        ln = RE_WIKILINK.sub(clean_wikilink, ln)
        ln = RE_HIGHLIGHT.sub(r"**\1**", ln)
        out.append(ln)
    return out


def demote_headings(lines):
    """所有 ATX 标题降一级（# -> ##）。

    笔记里习惯用 `#` 做分节，在站点上会和文章主标题抢层级，
    因此统一降级，再由 frontmatter 的 title 生成唯一的 H1。
    不依赖代码块状态（源笔记常有未闭合的代码围栏，跟踪围栏会错位），
    代价是代码块内的 `#` 注释也会多一个 '#'，对阅读无实质影响。
    """
    out = []
    for ln in lines:
        m = re.match(r"^(#{1,5})(\s+)(\S.*)$", ln)
        if m:
            out.append("#" * (len(m.group(1)) + 1) + m.group(2) + m.group(3))
        else:
            out.append(ln)
    return out


def make_description(lines, limit=110):
    """从正文抽取一段干净的摘要"""
    buf = []
    for ln in lines:
        s = ln.strip()
        if not s:
            if buf:
                break
            continue
        if s.startswith(("#", "!", "|", ">", "```", ":::", "---", "-", "*", "1.")):
            if buf:
                break
            continue
        if s.startswith("http"):
            continue
        s = re.sub(r"\$\$.*?\$\$", "", s)
        s = re.sub(r"\$.*?\$", "", s)
        s = re.sub(r"\*\*|\*|`", "", s)
        buf.append(s)
        if len("".join(buf)) > limit:
            break
    desc = " ".join(buf).strip()
    desc = re.sub(r"\s+", " ", desc)
    if len(desc) > limit + 40:
        desc = desc[: limit + 40].rstrip("，。、；：,;: ") + "……"
    return desc


def get_mtime(path):
    return datetime.datetime.fromtimestamp(os.path.getmtime(path))


def yaml_str(val):
    """把任意字符串安全写成 YAML 双引号标量（含冒号/反斜杠也不会破坏解析）。"""
    s = str(val).replace("\\", "\\\\").replace('"', '\\"')
    s = s.replace("\n", " ").replace("\r", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return '"' + s + '"'


# ============ 导读枢纽页（统整已发布内容）============
art("ml-theory/roadmap",
    "机器学习理论精读路径总览",
    [("drafts/ml-theory-roadmap.md", None)], "机器学习理论",
    ["机器学习理论", "导读", "学习路径"],
    intro="机器学习理论这 17 篇是对一本 Understanding ML 类教材的逐章精读，本是天然学习路径，"
          "缺的只是「章与章之间在升级什么」的导读。本页补上骨架：第二章在有限类 + Realizable 下"
          "证明 ERM 收敛（基线）→ 第三章升级为 PAC / Agnostic（去掉 Realizability）→ 第四章用 "
          "Uniform Convergence 把样本复杂度收束成可计算的界，并标出三篇习题章为可选附录。")

art("methodology/hub",
    "研究方法论总览",
    [("drafts/methodology-hub.md", None)], "研究方法论",
    ["研究方法论", "导读", "导航"],
    intro="研究方法论这 12 篇原本平铺在侧边栏，读者不知从哪进。本页把它们分成论文写作 / 评测与审稿 "
          "/ 方向与地图三条线，并标出阅读顺序，与顶部「研究品味」五篇构成同一主题的两种切面——"
          "研究品味教你怎么「选得好、写得有趣」，方法论教你怎么「做得扎实、经得起审」。")

art("surveys/hub",
    "领域综述导读",
    [("drafts/surveys-hub.md", None)], "领域综述",
    ["领域综述", "导读", "导航"],
    intro="领域综述这 7 篇是对几个领域「十年脉络 + 关键转折」的纵向梳理，不是教科书。本页按领域"
          "（视觉/多模态、图/序列、大模型能力与安全、会议生态）给一张索引，标出每篇适合在什么场景读，"
          "方便按研究方向挑读或在写 related work 前抓取叙事锚点。")

# ---- 关键性文章：AI 专业学习历程与方向地图（源：先路.md）----
# 脱敏：删除「吐槽」段（原 19-20 行，含对本校课程的主观评价）、
#       「基本功」段（原 83-84 行，含接码小店外链，敏感）；
#       用 replace 抹掉行内情绪标记 [捂脸]/[流泪]/[强]。
art("essays/roadmap",
    "先路：AI 专业学习历程与方向地图",
    [("先路.md", None)], "随笔",
    ["学习方法", "方向地图", "AI专业", "表示学习", "学习资源"],
    drops=[(19, 20), (83, 84)],
    replace=[(r"\[捂脸\]", ""), (r"\[流泪\]", ""), (r"\[强\]", "")],
    intro="一份持续更新的 AI 专业学习历程笔记。从「表示」这一元视角出发，把深度学习、生成模型、"
          "强化学习、自监督表征、可解释性等看似分散的方向收拢到同一条脉络里：模型在学什么表示、"
          "用什么方式对输入做变换、又受哪些归纳偏置约束。也记录自回归大模型的里程碑、AI 专业的护城河，"
          "以及如何读论文、选方向的实务反思。")

art("essays/hub",
    "随笔总览",
    [("drafts/essays-hub.md", None)], "随笔",
    ["随笔", "导读", "导航"],
    intro="随笔这 13 篇主题跨度大、平铺时显得零散。本页按科研心态与方向 / 科学哲学 / 技术与社会"
          "三条线重组，并标出每篇适合在什么心境下读；随笔偏「道」与心态，方法论偏「术」与流程，"
          "二者搭配可覆盖从方向焦虑到具体执行的完整链路。")

# slug 顶层目录 -> 对应 category（用于校验二者是否一致）
DIR_TO_CATEGORY = {
    "interpretability": "机制可解释性",
    "generative": "生成模型",
    "representation": "表征与世界模型",
    "post-training": "后训练与推理",
    "rl": "强化学习",
    "math": "数学基础",
    "methodology": "研究方法论",
    "surveys": "领域综述",
    "essays": "随笔",
    "vlm": "视觉语言模型",
    "engineering": "工程与应用",
    "ml-theory": "机器学习理论",
    "research-taste": "研究品味",
}


def build():
    report = []
    for a in A:
        # slug 目录必须与 category 一致：目录决定 URL 与侧边栏归属，
        # category 只决定归档分组。二者不一致会导致侧边栏链接 404。
        top = a["slug"].split("/")[0]
        if a["category"] and DIR_TO_CATEGORY.get(top) != a["category"]:
            print(f"[不一致] {a['slug']} 的目录 '{top}' 与 category "
                  f"'{a['category']}' 不匹配（应放入 "
                  f"'{DIR_TO_CATEGORY.get(top)}' 以外的目录）")

        parts = []
        newest = None
        for idx, (rel, rng) in enumerate(a["srcs"]):
            # drafts/ 开头的源文件位于博客仓库内（人工重写的定稿），
            # 其余一律来自 Obsidian 笔记库
            src = (ROOT / rel) if rel.startswith("drafts/") else (SRC_ROOT / rel)
            if not src.exists():
                print(f"[缺失] {rel}")
                continue
            newest = max(newest or datetime.datetime.min, get_mtime(src))
            raw = src.read_text(encoding="utf-8", errors="replace").splitlines()
            if rng:
                raw = raw[rng[0] - 1: rng[1]]
            # 行区间删除（针对原始行号）
            drops = sorted(a["drops"], reverse=True)
            for (s, e) in drops:
                if idx == 0:
                    raw = raw[: s - 1] + raw[e:]
            body = clean_text(raw, a["drop_regex"], a["replace"])
            if a["sections"] and len(a["srcs"]) > 1:
                parts.append(f"\n## {a['sections'][idx]}\n")
            parts.extend(body)
            parts.append("")

        lines = demote_headings(parts)
        # 去掉开头空行
        while lines and not lines[0].strip():
            lines.pop(0)

        body_text = "\n".join(lines).strip()
        if len(body_text) < 200:
            print(f"[内容过短，跳过] {a['slug']} ({len(body_text)} 字符)")
            continue

        # 有人工撰写的 intro 时优先用它做摘要（比机器抽取的首段更凝练）；
        # 否则退回自动抽取。
        if a["intro"]:
            desc = re.sub(r"\s+", " ", a["intro"]).strip()
            if len(desc) > 150:
                desc = desc[:150].rstrip("，。、；：,;: ") + "……"
        else:
            desc = make_description(lines)
        date = (newest or datetime.datetime.now()).strftime("%Y-%m-%d")

        fm = ["---", f"title: {yaml_str(a['title'])}", f"date: {date}"]
        if a["category"]:
            fm.append(f"category: {yaml_str(a['category'])}")
        if a["tags"]:
            fm.append("tags:")
            fm += [f"  - {yaml_str(t)}" for t in a["tags"]]
        if desc:
            fm.append(f"description: {yaml_str(desc)}")
        fm.append("---")

        out = OUT_ROOT / f"{a['slug']}.md"
        out.parent.mkdir(parents=True, exist_ok=True)

        content = "\n".join(fm) + "\n\n"
        content += f"# {a['title']}\n\n"
        if a["intro"]:
            content += f"> {a['intro']}\n\n"
        content += body_text + "\n"
        out.write_text(content, encoding="utf-8")

        h1n = sum(1 for l in lines if re.match(r"^#\s+\S", l))
        report.append((a["slug"], len(body_text), h1n, date))
        print(f"[OK] {a['slug']:<48} {len(body_text):>7} 字符  H1×{h1n}  {date}")

    print("\n" + "=" * 70)
    print(f"共生成 {len(report)} 篇文章")
    multi = [r for r in report if r[2] > 0]
    if multi:
        print(f"\n以下 {len(multi)} 篇正文含额外 H1（建议检查）：")
        for r in multi:
            print(f"  - {r[0]}  H1×{r[2]}")


if __name__ == "__main__":
    build()
