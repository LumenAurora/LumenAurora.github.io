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

art("interpretability/attribution-graphs",
    "归因图、特征分解与 QK 归因：Transformer 可解释性方法入门",
    [("学习/可解释博文.md", None)], "机制可解释性",
    ["可解释性", "Transformer", "归因图", "SAE"],
    drops=[(1, 2)],
    intro="这是一份从零开始的 Transformer 可解释性方法说明书：把一次前向传播拆开，"
          "讲清楚归因图（attribution graphs）、特征分解与 QK 归因分别在做什么、"
          "彼此如何衔接。")

art("interpretability/interpretability-map",
    "可解释性研究的全景框架",
    [("经典方法/可解释性.md", None)], "机制可解释性",
    ["可解释性", "方法论", "因果干预"])

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

# ============ 研究方法论 ============
art("methodology/benchmark-writing",
    "Benchmark 论文写作：从心理测量学借一套方法论",
    [("论文之道/benchmark写作.md", None)], "研究方法论",
    ["Benchmark", "论文写作", "评测"])

art("methodology/analysis-paper",
    "分析类论文如何做得有趣",
    [("论文之道/分析类如何有趣.md", None)], "研究方法论",
    ["分析类论文", "论文写作", "novelty"])

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
