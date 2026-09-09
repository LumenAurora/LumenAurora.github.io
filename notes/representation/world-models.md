---
title: "世界模型：VLA、JEPA 与 WAM"
date: 2026-08-26
category: "表征与世界模型"
tags:
  - "世界模型"
  - "具身智能"
  - "JEPA"
description: "世界模型就是大模型套壳，相当于现在难点就是在于一方面大模型如何灌进物理先验以及处理多模态异构性信息、这是大模型训练他们那边的事，另一方面是怎么把大模型用在具身上、如何衔接如何通信如何处理异构性，归根结底还是通信与标准的问题，LLM统一为token，diffusion统一为像素空间。还有的问题就是数据……"
---

# 世界模型：VLA、JEPA 与 WAM

世界模型就是大模型套壳，相当于现在难点就是在于一方面大模型如何灌进物理先验以及处理多模态异构性信息、这是大模型训练他们那边的事，另一方面是怎么把大模型用在具身上、如何衔接如何通信如何处理异构性，归根结底还是通信与标准的问题，LLM统一为token，diffusion统一为像素空间。还有的问题就是数据问题。主要是人的行动本质是序贯决策问题，但是又没办法用语言形容；不是那种生图属于生成一个样本。
主要的难点是如何引入动作作为条件，实现action conditioned next state prediction，让机器人因果式地理解做了这个动作会导致环境发生什么变化。两种思路，一种是我们先想好未来的目标，然后反推动作（WAM）；另一种是我们先做动作，再看一看后果（AC-WM）。
## 数学化分类目前模型
**WAM（World Action Model，世界动作模型）** 是具身智能（embodied AI）“大脑”侧当前与 VLA、JEPA 并列的重要范式。它把**世界动态预测**和**动作生成**统一到一个模型里，目标是联合建模未来状态与动作，而不是像标准 VLA 那样只学“观测 → 动作”的反应式映射。

#### 与 VLA、JEPA/世界模型的对比
- **VLA（Vision-Language-Action）**：  
  $$
  p(a \mid o, l)
  $$
  直接从当前观测 $o$ 和语言指令 $l$ 生成动作 $a$。语义泛化强（继承 VLM/LLM 先验），但**不显式建模**“动作如何改变世界”，物理推理弱，对未见物理交互泛化差。

- **JEPA / 纯世界模型（World Model, WM）**：  
  更强调在 latent 空间预测未来状态，如 $p(z_{t+1} \mid z_t, a_t)$ 或 $p(o' \mid o, a)$。  
  学到“世界如何变”，可用于规划/模拟，但本身**不是可直接执行的策略**，需要额外 planner 或 policy 才能出动作。JEPA 风格偏 representation learning，避免像素重建，更抽象。

- **WAM**：  
  统一两者，目标是联合分布  
  $$
  p(o', a \mid o, l)
  $$
  （或序列形式 $p(o_{t+1:t+k}, a_{t:t+k} \mid o_{\le t}, l)$）。  
  动作被解释为“导致未来世界变化的原因”，未来状态预测反过来约束动作的物理合理性。可更好利用无动作标注的大规模视频数据，提升物理常识、零样本泛化和数据效率。

简单说：VLA 像“看图说话然后动手”；世界模型/JEPA 像“想象世界会怎样变”；WAM 像“一边想象未来世界，一边生成与之对齐的动作”。

#### 严格数学定义（来自系统 survey）
考虑具身 agent：时刻 $t$ 观测 $o \in O$（视觉、本体感觉等）、语言 $l \in L$，输出动作 $a \in A$，下一观测记为 $o'$。

WAM 是统一预测状态建模与动作生成的具身基础模型，目标**联合分布** $p(o', a \mid o, l)$，而非仅 $p(a \mid o, l)$。关键边界是：未来状态预测必须是 policy 的一部分（而不是外部模拟器或仅辅助 backbone）。

两种主要架构分解：
1. **Cascaded WAM（级联）**：  
   $$
   p(o', a \mid o, l) = p(a \mid o', o, l) \, p(o' \mid o, l)
   $$
   先预测/生成未来状态（或计划），再从该未来推导动作。模块清晰，但两阶段耦合质量是瓶颈。可进一步分 **Explicit**（像素/视频/flow/深度/4D 等显式载体）和 **Implicit**（latent features、future tokens、masks 等）。

2. **Joint WAM（联合）**：  
   直接在共享表示空间中联合建模 $p(o', a \mid o, l)$，状态预测与动作生成共同优化。更紧耦合。常见实现：
   - **Autoregressive**：统一 token 空间（图像/语言/动作共享词表），因果 left-to-right 生成，或多头路由。
   - **Diffusion / Flow-matching**：单引擎或多引擎 diffusion，联合去噪未来视觉 token + 动作；或 parallel generation。

序列形式（常见于 autoregressive 实现）可写为：
$$
P(o_{1:T}, a_{1:T} \mid \ell) = \prod_t P(o_t \mid \ell, o_{1:t-1}, a_{1:t-1}) \, P(a_t \mid \ell, o_{1:t}, a_{1:t-1})
$$
损失通常是世界预测损失（像素/latent 重建、token CE、FVD 等）+ 动作损失（CE / L1 / flow matching / RL 目标）的加权和，有时加 latent action、一致性或 distillation 项。

**学习的是什么**：
- 物理世界动力学先验（从大规模视频/egocentric 数据中学“世界如何在动作/语言干预下演化”）。
- 动作与未来状态的对齐（video-action alignment）：动作要能解释/导致预测的未来变化。
- 语义 grounding + 物理 plausibility，从而支持零样本/少样本泛化、跨 embodiment 迁移、从纯视频（无动作标签）预训练后用少量机器人数据微调。
- 数据来源：机器人遥操作轨迹、便携人类演示（UMI 风格）、仿真、互联网/egocentric 视频。视频预训练是核心优势（可继承 video foundation model 如 Wan、Cosmos 的物理先验）。

#### 算法架构与实现路线
- **Backbone**：常从预训练 **video / world model**（I2V、video DiT、VAE latent 等）起步，而非纯 VLM；或统一 multimodal transformer。
- **生成方式**：
  - Autoregressive joint token prediction（共享词表，masked attention 防 error compounding）。
  - Joint Video-Action Diffusion Transformer（DiT）：同时预测未来 latent 视觉 token 和动作（NVIDIA DreamZero 等典型）。
  - Cascaded：先 video prediction / latent plan，再用 inverse dynamics 或 action head 解码动作。
- **推理时**：常只预测压缩的 latent future 或 action chunk，不必完整解码视频；支持 closed-loop 或 open-loop chunk。
- 代表工作/系统：DreamZero（NVIDIA，强调 zero-shot）、WorldVLA、RynnVLA、Cosmos Policy、VPP、UniPi 系列、各种 Diffusion-based Joint WAM 等。Survey 有完整 taxonomy（Cascaded vs Joint，再分 explicit/implicit、AR/diffusion）。

#### 优势与挑战
**优势**：更强物理常识与泛化；更好利用无标签视频；可解释性（可检查预测的未来）；数据效率更高；适合长程、接触丰富、未见任务。

**挑战**：推理延迟（尤其 diffusion steps，需 distillation/异步/少步）；3D/空间 grounding（单目视频先验不足）；长程 credit assignment 与 error compounding；多模态物理状态（触觉、力等）；数据混合比例；评估协议（需同时测 visual fidelity、physical commonsense、action plausibility + 真实任务成功率）。

**总结**：WAM 是 VLA 的“物理增强版”或“世界模型 + 动作”的统一体。它沿用大模型（transformer/diffusion）的 scaling 路线，但把核心目标从纯动作预测扩展到**联合未来状态-动作建模**，更贴近“大脑”需要预测行动后果的需求。与 JEPA 的区别在于 JEPA 更偏纯预测表征，而 WAM 强制把动作生成绑在预测上，直接可执行。当前领域快速演进，Fudan/Shanghai AI Lab 等的 survey（arXiv:2605.12090）是目前最系统的定义与分类来源。

**是的，这一直觉大体正确，但“只是换训练目标 + 编排”这个说法还是低估了实际差异。** 底层生成引擎确实还是 **Transformer（AR）和 Diffusion/Flow-matching（尤其 DiT）** 那一套，scaling 路线也没变。真正的长进更多体现在**先验来源、目标耦合方式、数据利用范式和推理时的结构约束**上，而不只是 loss 多加一项。

#### 1. 底层架构：确实还是同一套
- **VLA**：多数从 **VLM/LLM backbone**（AR next-token 或 + action expert/diffusion head）起步，目标 $p(a \mid o, l)$。
- **WAM**：多数从 **video / world foundation model backbone**（Wan、Cosmos、视频 DiT、I2V 等）起步，目标变成联合 $p(o', a \mid o, l)$ 或序列形式。

核心组件几乎一样：
- Transformer blocks / DiT（adaLN 注入条件）
- VAE latent 压缩
- 离散 token 或连续 latent
- AR 因果生成，或 diffusion/flow matching 联合去噪
- Action chunk、FAST/BEAST 类 action tokenization 等

DreamZero 这类典型 Joint WAM，就是把预训练视频 DiT（如 Wan 14B）直接改成**同时 denoise 未来视频 latent + 动作 token** 的 monolithic 模型，没有单独的 inverse dynamics 模块。Cascaded 则是先预测 future（video/flow/latent），再用 IDM 或 action head 解码动作。

所以从“算子/层/优化器”角度看，确实没跳出 Transformer + Diffusion 范式。

#### 2. 真正多出来的东西（不止换目标 + 调度）
前文所述的“换训练目标 + 模型调度编排”抓住了表面，但实际差异更深：

| 维度 | VLA 典型 | WAM 典型 | 实质差异 |
|------|----------|----------|----------|
| **预训练先验** | 静态 image-text / VLM 语义 | **视频动力学 + 物理先验**（大规模 internet/egocentric video） | 最大差别之一。WAM 直接继承“世界如何随时间/干预演化”的 spatiotemporal prior，而不是事后从机器人数据里硬学物理。 |
| **训练目标** | 主要 $p(a \mid o, l)$，有时加辅助 future prediction | **联合** $p(o', a \mid o, l)$，world loss + action loss 强耦合 | 不只是多一个 loss，而是强制动作成为“解释/导致未来变化”的原因，形成物理一致性约束。 |
| **架构耦合** | 观测 → 动作（reactive） | Cascaded（future plan → action）或 Joint（共享表示/联合生成） | 有明确 taxonomy：Explicit/Implicit planning，AR shared vocab vs Multi-stream DiT / MoT（Mixture-of-Transformers）等。 |
| **数据范式** | 重度依赖成对 robot demo + language | **视频预训练（无动作标签）→ 少量 robot 数据对齐**；可利用 UMI 人类演示、仿真、ego video | 数据飞轮完全不同，数据效率和对开放世界的泛化潜力更大。 |
| **推理时结构** | 直接出 action chunk | 常预测 compressed latent future 或 interleaved，再出 action；有 causal masking 防 error compounding；蒸馏/异步/少步加速 | 编排确实重要（latency 是 WAM 当前痛点），但编排服务于“用预测未来约束动作”。 |
| **可解释性/规划** | 黑盒映射 | 可检查预测的未来视频/latent，支持 imagination / MPC 风格 | 更接近 model-based。 |

**关键边界**（survey 定义）：未来状态预测必须**进入 policy 路径**（是生成动作的一部分或强条件），而不是外部模拟器、纯辅助 loss，或只用来预训练 backbone 然后扔掉。否则就还是 VLA 或 “WM-for-VLA”。

#### 3. 为什么这比“换目标”更有意义？
- **归纳偏置变了**：VLA 的语义很强，但物理推理弱（“看到红杯子就抓”，但不显式知道抓了之后世界会怎样、接触力会如何）。WAM 把动力学作为一等公民，动作必须能解释预测的未来变化，所以对未见物理交互、扰动、长程任务更鲁棒。
- **零样本/泛化证据**：DreamZero 等强调 zero-shot policy；对比实验显示很多 WAM 在视觉/语言扰动下比纯 VLA 更稳，部分原因就是视频先验 + 显式动力学。当然 hybrid（VLA + 部分 video objective）也能接近，说明“怎么注入动力学”比标签重要。
- **数据效率**：视频数据海量且便宜，机器人成对数据昂贵。WAM 路线天然适合 “pretrain to imagine, fine-tune to act”。
- **不是纯编排**：Joint 模型里 future 和 action 在同一个 denoising/AR 过程里互相条件，梯度直接耦合；Cascaded 里 future 是 plan，action 是 inverse dynamics。这改变了优化景观和 error 传播方式，而不只是 pipeline 顺序。

#### 4. 局限与当前现实
这一怀疑也有道理：
- **没有全新底层算法**：没有跳出 Transformer/Diffusion 的 scaling 范式（和 LLM/VLM/视频生成同一条路）。
- **推理成本高**：视频 DiT 多步去噪慢，实时控制困难，所以有 Fast-WAM、只在训练时预测 future、推理时只出 action、蒸馏、异步 horizon 等工程优化。
- **耦合质量是瓶颈**：Cascaded 两阶段容易 mismatch；Joint 训练更难、对数据混合敏感。
- **很多工作其实是 continuum**：有的是 VLA + 强 future auxiliary，有的是纯 WAM，中间 hybrid 很多。标签有时营销成分。

**总结一句话**：  
底层是同一套 Transformer + Diffusion，**换目标 + 编排**是表面，**真正的长进是把视频世界模型的动力学先验直接变成 policy 的核心路径，并强制动作与未来状态联合建模**。这改变了先验来源、数据飞轮、物理一致性和泛化方式，而不只是 loss 工程或 pipeline 重排。它更像是 VLA 的“物理增强版”或“可执行的世界模型”，而不是全新架构革命。  

目前领域还在快速收敛（Cascaded vs Joint、AR vs DiT、如何高效注入、多模态物理状态等），hybrid 很可能是最终赢家。若想深入某个具体实现（DreamZero 的 joint denoise 细节、WorldVLA 的 shared vocab、或 Cascaded 的 IDM），可进一步展开。


## JEPA 全面深度解析：从零到精通

### 一、JEPA 是什么？先给一个直觉定位

JEPA（Joint Embedding Predictive Architecture，联合嵌入预测架构）不是某一个具体模型，而是**一类自监督学习的架构范式**——由 Meta 首席AI科学家 Yann LeCun 系统性提出。它的核心主张极其简单却颠覆性：

> **不要在像素/token空间做预测，而要在"抽象表示空间"里做预测。**

一个预测器模块预测y的表示（从x的表示出发），预测器可能依赖于一个潜变量z，能量函数就是表示空间中的预测误差。这句话浓缩了JEPA的全部精髓。

---

### 二、历史脉络与谱系（Genealogy）

要理解JEPA，必须理解它是"自监督学习三十年演化"的最终汇合点。这里有三条历史线索最终交汇：

#### 2.1 线索一：Siamese网络（1993, LeCun本人）
最早的源头可以追溯到LeCun 1993年与Bromley等人提出的"孪生网络"（Siamese Network，用于签名验证）——这是"用两个共享权重的编码器比较两个输入"这一思想的起点，这也是JEPA"双编码分支"结构的直系祖先。

#### 2.2 线索二：自监督表示学习的三大范式演化

学术界公认自监督图像/视频表示学习经历了三个阶段：

**(a) 不变性方法 / 对比学习（Invariance-based / Contrastive）**
在这些方法中，模型试图对同一图像的不同视图产生相似的嵌入。这些不同的视图是手工构造的，即我们熟悉的图像增强——旋转、缩放、裁剪。代表作：SimCLR、MoCo、对比预测编码（CPC, van den Oord et al. 2018）。
这些方法擅长产生高语义层级的表示，但问题是它们引入了强偏置，可能对某些下游任务有害。

后来出现了"非对比"（non-contrastive）的改进版本——BYOL（Bootstrap Your Own Latent）、Barlow Twins、VICReg——它们不再需要负样本对，而是靠正则化手段防止表示坍缩。这是JEPA训练法的直接技术基础。

**(b) 生成式方法（Generative / Reconstruction-based）**
以MAE（Masked Autoencoders, He et al. 2022）为代表：随机遮盖图像块，训练模型在**像素空间**重建被遮盖内容。这类方法不需要人工设计的数据增强，但代价是模型被迫花费容量去建模不可预测的低层细节（纹理噪声等）。

**(c) 联合嵌入预测方法（Joint-Embedding Predictive, JEPA）**
JEPA被明确设计为"融合前两者优点、规避各自缺点"的第三条路：I-JEPA试图同时改进生成式方法与联合嵌入方法。概念上它类似生成式方法，但关键区别在于：不同于生成式方法在像素级重建被破坏的输入，I-JEPA用其引入的预测器在表示空间中进行预测，这被称为"抽象预测"，这使模型学到更强大的语义特征。

#### 2.3 线索三：能量based模型（Energy-Based Models, EBM）——LeCun的理论老本行
LeCun长期倡导用"能量函数"统一看待各种学习问题（而非概率模型）。JEPA被明确定义为一种EBM：能量简单地就是表示空间中的预测误差，像任何EBM一样，JEPA可以用对比方法训练，但正如前面指出的，对比方法在高维空间中往往变得非常低效。

#### 2.4 汇流点：2022年LeCun的立场论文
LeCun的《通往自主机器智能之路》提出了一个以联合嵌入预测架构为中心的六模块认知架构（感知、世界模型、代价模块、短期记忆、行动者和配置器）。该论文是近期AI研究中被引用最多的立场论文之一。JEPA是这篇论文的技术核心（另有更宏大的"自主智能"认知蓝图，包含Configurator等模块，属于愿景层面，本文聚焦JEPA本身）。

#### 2.5 后续家族谱系时间线

| 时间 | 模型 | 领域 | 关键贡献 |
|---|---|---|---|
| 2022.06 | LeCun立场论文 | 理论 | 首次提出JEPA/H-JEPA概念框架 |
| 2023 | I-JEPA | 图像 | 首个落地的JEPA实现（CVPR 2023） |
| 2023.07 | MC-JEPA | 图像+光流 | 在共享编码器内联合学习光流和内容特征，将自监督光流估计作为内容学习的辅助任务 |
| 2024.02 | V-JEPA | 视频 | 扩展到视频，通过在特征空间中预测视频片段的被遮盖区域，学习时空表示 |
| 2025.06 | V-JEPA 2 | 视频+机器人 | 在超过100万小时的互联网视频与图像数据集上预训练，实现零样本机器人规划 |
| 2025.11 | LeJEPA | 理论+通用 | 从第一性原理推导最优嵌入分布，而非依赖停止梯度、教师-学生网络等临时方案 |

此外还派生出T-JEPA（轨迹相似度）、TD-JEPA（强化学习零样本表示）、应用于EEG/ECG生理信号的Hierarchical-JEPA等一大批跨模态变体，说明JEPA已成为一种通用方法论而非单一模型。

---

### 三、理论基础

#### 3.1 自监督学习的"能量视角"统一框架

LeCun把所有自监督学习方法看作**能量函数设计问题**：对兼容的(x,y)对赋低能量，对不兼容的赋高能量。目标是给不兼容的输入分配高能量（大标量值），给兼容的输入分配低能量（小标量值）。

在这个框架下，各种架构的区别只是"y是如何被表示、预测是在哪个空间进行"：
- **生成式架构**：y是原始像素，预测器要重建完整细节（能量=像素重建误差）
- **JEPA**：y先经过编码器变成 $s_y$，预测器只需在 $s_x \to s_y$ 的表示空间做预测（能量=表示空间预测误差）

#### 3.2 JEPA的通用数学形式

原始论文给出的通用架构如下：x和y两个变量被送入两个编码器，产生两个表示sx和sy。这两个编码器可能不同，它们不要求拥有相同架构，也不要求共享参数，这使得x和y在性质上可以不同（例如视频和音频）。一个预测器模块从x的表示预测y的表示，预测器可能依赖于一个潜变量z。

数学表达（我补充规范化写法）：
```
s_x = Enc_x(x)          # 上下文/输入编码
s_y = Enc_y(y)          # 目标编码（通常是Enc_x的EMA版本）
ŝ_y = Pred(s_x, z)      # 预测器在表示空间预测目标表示
Energy = D(ŝ_y, s_y)   # 通常是L2距离/余弦距离
```
关键点：JEPA在无法轻易用来从x预测y的意义上不是生成式的，它仅仅捕捉x和y之间的依赖关系，而不显式生成y的预测。

#### 3.3 为什么理论上能行？——核心洞察

**洞察1：现实世界不是完全可预测的，所以不应该在像素空间强求预测**
现实世界并非完全可预测。一段视频中，风吹树叶的具体摆动方式、地毯纹理的精确像素噪声，本质上是不可预测的随机细节。若强迫模型在像素空间重建它们（如MAE、VideoMAE的做法），模型会被迫浪费大量参数容量去"猜测"这些无关紧要且本质随机的细节，反而稀释了对**语义结构**（物体是什么、如何运动、相互关系如何）的学习。而在语义表示空间中，这些不可预测的低层噪声大概率已经被编码器"抽象掉"了，预测器只需要对稳定的高层语义结构建模。这正是I-JEPA可视化实验的证据：这个世界模型是语义性的，它预测的是未见区域的高层信息，而非像素级细节，研究者训练了一个随机解码器将I-JEPA预测的表示映射回像素空间，作为草图。模型正确捕捉了位置不确定性，并生成了带有正确姿态的高层次物体部件。

**洞察2：避免"表示坍缩"需要满足的四个准则**
非对比训练JEPA的理论核心是防止一个平凡但灾难性的解——编码器把所有输入都映射到同一个常数向量（这样预测误差永远为零，但表示毫无信息量，即"坍缩"，collapse）。LeCun论文明确给出防坍缩的四原则：这类非对比训练的基本原则是：(1) sx应对x最大程度地有信息量；(2) sy应对y最大程度地有信息量；(3) sy应能从sx容易地被预测；(4) z应具有最小的信息含量。准则1、2、4共同防止能量的坍缩。实现这四条准则的具体正则化技术包括VICReg和Barlow Twins这类非对比准则。

**洞察3（更前沿）：为什么应该是各向同性高斯分布？——LeJEPA的严格证明**
2025年LeCun与Balestriero的LeJEPA工作把这个"为什么能行"的问题从经验直觉提升为**数学定理**：作者首先证明各向同性高斯分布是模型嵌入分布的唯一最优选择，用以最小化下游任务上的最坏情况预测风险。通过对线性和非线性评估场景的全面分析，作者证明各向同性高斯分布是嵌入分布的唯一最优选择。对于任何各向异性的嵌入，总存在某个下游任务会受到不利影响（更高的估计偏差/方差），这一点通过分析和模拟研究得到了定量证明。

这解释了"为什么JEPA能行"的深层原因：**一个好的通用表示，本质上应该让特征在各维度上均匀、独立、无冗余地散布（各向同性高斯），这样才能保证对任意未知的下游线性/非线性探针都具有最小的最坏情况风险**——这正是"表示学习应该追求什么"这一根本问题的首个严格数学答案，而不再是靠VICReg/BYOL/对比学习等一堆经验性启发式拼凑出来的效果。

#### 3.4 与生成式/对比式方法的理论对比总结

| 维度 | 对比学习(SimCLR等) | 生成式(MAE等) | JEPA |
|---|---|---|---|
| 预测目标空间 | 表示空间（但依赖负样本+数据增强不变性） | 像素/token空间 | 表示空间 |
| 是否需要人工数据增强 | 需要（强偏置来源） | 不需要 | 不依赖直接的像素级重建或对手工数据增强的强烈依赖 |
| 计算开销 | 需要处理多个增强视图 | 需要解码器重建全部细节 | 计算高效，不涉及应用更密集数据增强产生多视图的开销，目标编码器只需处理一个视图，上下文编码器只需处理上下文块 |
| 防坍缩机制 | 负样本对/大batch | 天然无坍缩问题（重建任务本身约束） | 需专门设计（VICReg/EMA/停止梯度/SIGReg） |

---

### 四、算法架构详解（逐层拆解，注重细节）

#### 4.1 通用JEPA的组件清单

一个完整JEPA系统包含以下必要模块：

1. **上下文编码器（Context/x-Encoder）** $Enc_x$：处理"已知/可见"部分输入
2. **目标编码器（Target/y-Encoder）** $Enc_y$：处理"待预测/被遮盖"部分输入。**关键设计**：这两个编码器架构相同但**参数不共享**，目标编码器的参数是上下文编码器参数的**指数滑动平均（EMA）**，而非梯度反传更新
3. **预测器（Predictor）**：一个相对"窄而浅"的网络（通常是小型Transformer），输入上下文表示+位置信息（掩码token），输出对目标表示的预测
4. **潜变量 z（可选）**：捕捉预测中的不确定性/多模态性
5. **能量/损失函数**：预测表示与真实目标表示之间的距离（通常是L1/L2）
6. **防坍缩正则项**：VICReg/Barlow Twins/SIGReg等

#### 4.2 I-JEPA（图像版）——最经典的落地实现

**输入切分**：I-JEPA将图像切分为一个上下文块（context block）和若干目标块（target blocks），用上下文块去预测目标块。每个块由多个图像patch组成。

**具体架构流程**（结合多个来源整合细节）：

```
输入图像 → 切成不重叠的小patch（类似ViT）
    ↓
① 用"multi-block masking"策略采样：
   - 4个目标块（target blocks）：随机大小、大长宽比区间的矩形块
   - 1个上下文块（context block）：覆盖图像大部分区域，但会移除与目标块重叠的部分
    ↓
② 上下文编码器（ViT）: 只处理"可见的上下文patch" → 得到上下文表示序列
    ↓
③ 目标编码器（ViT，EMA更新，不接收梯度）: 处理完整图像（或目标区域）→ 得到目标表示
    ↓
④ 预测器（轻量Transformer）: 输入 = [上下文表示 + 每个目标位置的可学习mask token+位置编码]
                              输出 = 对应位置的预测表示
    ↓
⑤ 损失：预测表示 vs. 目标编码器给出的真实表示 的L2距离，仅在被mask的位置计算
```

技术细节确认：I-JEPA用一个ViT编码未被遮盖的上下文patch，用另一个ViT预测被遮盖目标patch的编码。目标表示由目标编码器提供，它是上下文编码器的指数滑动平均（EMA）版本。上下文编码器是一个Vision Transformer（ViT），只处理可见的上下文patch。

**Multi-block masking的设计动机（为什么重要）**：另一个提升I-JEPA语义特征质量的设计选择是遮盖足够大的输入图像块。如果遮盖的目标块太小太分散，模型只需靠局部纹理插值就能"作弊"预测成功，学不到高层语义；只有遮盖大块连续区域，模型才被迫理解物体整体、场景布局等抽象概念。

**HuggingFace教程给出的组件命名**：Target Encoder (y-encoder)：编码目标图像，目标块由其输出经掩码产生。

**效率优势的实证证据**：I-JEPA模型比同类模型所需的迭代次数少约5倍，聚焦于对高阶表示施加损失，已被证明能将训练样本效率提升1.5到6倍。该架构计算高效且用途广泛，在视觉、遥感和强化学习任务中都表现出色。

#### 4.3 V-JEPA（视频版）——从空间扩展到时空

V-JEPA由Adrien Bardes、Quentin Garrido、Jean Ponce、Xinlei Chen、Michael Rabbat、Yann LeCun、Mahmoud Assran和Nicolas Ballas在Meta AI/NYU发表于TMLR 2024，将I-JEPA框架从图像扩展到视频，证明联合嵌入预测架构能自然地扩展到时空数据。

**核心问题转变**：像VideoMAE、VideoMAEv2这类像素重建方法，训练解码器重建被遮盖patch的精确RGB值。这一目标把所有像素级变化都视为同等重要——这正是V-JEPA要规避的问题（洞察1的具体应用）。

**架构组件**（三网络结构）：V-JEPA的架构由三个相互连接的网络组成：上下文编码器、目标编码器和预测器。目标编码器处理完整视频片段，而上下文编码器处理这些片段的被遮盖版本。在上下文编码器之后，预测器生成缺失视频patch的token。

**视频特有的处理细节**：
- 视频被切成**tubelet**（时空立方体patch，而非单纯2D patch），编码器把视频"patchify为一系列大小为T×H×W的tubelet序列"
- **Masking策略**：默认策略是多块连续遮盖（multi-block contiguous masking），随机混合短程小块与长程大型3D时空块，通常每个视频片段会移除高达90%的tubelet
- 采样策略可能在因果块和非因果块之间交替，以实现更灵活的上下文/目标划分；连续块遮盖强制模型建模局部和非局部依赖关系
- **预测器规模**：窄型Transformer，例如12层、宽度384，同时接收可见token和mask token
- **防坍缩**：通过显式正则项（方差/协方差，如VJ-VCR）或教师目标机制（EMA或静态目标）来控制坍缩风险

**下游使用方式**：冻结编码器协议下，常用带可学习CLS token的交叉注意力池化进行下游探测。

#### 4.4 V-JEPA 2——规模化与走向具身智能

V-JEPA 2 在V-JEPA基础上做了四项关键工程升级（原文称为"四个额外的关键要素"）：

**位置编码升级——从绝对位置到3D-RoPE**：
为了编码视觉Transformer中的相对位置信息，V-JEPA 2使用RoPE（旋转位置编码）替代Bardes等人(2024)所用的绝对sincos位置编码，通过将特征维度切分为三个近似相等的段（分别对应时间、高度、宽度轴），对每段分别应用1D旋转，研究发现使用3D-RoPE而非绝对sincos位置编码有助于稳定最大规模模型的训练。

**数据规模**：在超过100万小时互联网视频构成的视频与图像数据集上预训练一个动作无关（action-free）的联合嵌入预测架构，利用100万小时互联网规模视频和100万张图像进行预训练。

**性能指标**：V-JEPA 2在运动理解任务（Something-Something v2 top-1准确率77.3%）上表现强劲，在人类动作预判任务（Epic-Kitchens-100 recall-at-5达39.7）上取得超越以往任务专用模型的最先进性能。在与大语言模型对齐后，V-JEPA 2在多个视频问答任务上于80亿参数规模取得了最先进的表现（例如PerceptionTest上84.0，TempCompass上76.9）。

**训练的"两阶段"设计（核心训练流程细节）**：V-JEPA 2采用两阶段训练方法。编码器和预测器首先通过自监督学习在视觉数据上预训练，利用海量自然视频来引导物理世界理解与预测能力的形成；随后在少量机器人数据上进行微调，使得无需大规模专家机器人示范数据（这类数据难以大规模采集）即可实现高效规划。

第二阶段具体做法：通过对少于62小时的无标注机器人视频（来自Droid数据集）进行后训练，得到一个潜在的、条件于动作的世界模型V-JEPA 2-AC。研究者将V-JEPA 2-AC零样本部署在两个不同实验室的Franka机械臂上，实现了基于图像目标规划的物体抓取与放置——且完全没有在这些环境中采集任何机器人数据，也没有做任何任务特定的训练。

#### 4.5 LeJEPA——把架构简化到"理论最优"

LeJEPA代表了JEPA架构演化的最新、也是理论上最"干净"的一步：

**动机**：不同于依赖临时方案（如停止梯度、教师-学生网络或复杂增强策略），LeJEPA从第一性原理推导出最优嵌入分布，并引入一种新的正则化方法来强制实现该分布。

**核心技术——SIGReg（Sketched Isotropic Gaussian Regularization）**：LeJEPA引入了Sketched Isotropic Gaussian Regularization（SIGReg），这是一种新颖的目标函数，将学到的嵌入约束到最优的各向同性高斯分布，从而最小化下游预测风险。SIGReg是一种切片正则化方法，通过随机投影高效地将一维边缘分布匹配到各向同性高斯分布，仅需极少的超参数调节。

**架构简化的意义**：这与以往JEPA变体如I-JEPA相比是一种根本性转变——I-JEPA依赖预测器网络、停止梯度和教师-学生设置来经验性地防止坍缩，而LeJEPA让这些都变得多余。通过直接强制实现非退化的各向同性高斯分布，SIGReg从构造上就消除了坍缩问题。结果令人瞩目：LeJEPA无需预测器、无需教师、无需停止梯度即可达到最先进性能，极大简化了整个训练流程。

**工程优势**：LeJEPA具有单一权衡超参数、线性时间和内存复杂度、跨超参数/架构（ResNet、ViT、ConvNet）/领域的稳定性、无启发式（无停止梯度、无教师-学生、无超参数调度器），且实现代码仅需约50行、对分布式训练友好。经验验证覆盖10多个数据集、60多种架构。

---

### 五、训练过程详解

#### 5.1 前向传播的完整流程（以I-JEPA为原型，可推广到其他JEPA变体）

```
Step 1: 采样一批图像 x
Step 2: 对每个样本，采样masking策略：
        - 生成 M 个目标块（如I-JEPA中M=4），得到掩码 {m_1, ..., m_M}
        - 生成 1 个上下文块，并从中挖去与所有目标块重叠的区域
Step 3: 目标编码器（no gradient, EMA权重）:
        s_y = Enc_y(完整或全部区域的图像) 
        然后根据目标掩码位置，取出对应的目标表示 s_y^(i) for i=1..M
Step 4: 上下文编码器（有梯度）:
        s_x = Enc_x(仅上下文块的patch)
Step 5: 对每个目标块 i:
        用预测器，输入 [s_x, mask_token_with_positional_embedding_i]
        输出预测 ŝ_y^(i) = Predictor(s_x, position_i)
Step 6: 计算损失：
        L = (1/M) Σ_i  ||ŝ_y^(i) − s_y^(i)||_2^2   （通常用L1/smooth-L1也可以）
Step 7: 反向传播只更新 Enc_x 和 Predictor 的参数（通过梯度下降）
Step 8: 更新 Enc_y 的参数为 Enc_x 参数的EMA：
        θ_y ← τ·θ_y + (1-τ)·θ_x     （τ通常接近1，如0.996~0.9999，并随训练逐渐增大）
```

#### 5.2 为什么用EMA目标编码器而不是共享参数？（防坍缩的关键机制之一）

如果上下文编码器和目标编码器共享参数并都接收梯度，模型极易学到"平凡解"：把一切都映射为常数，预测误差恒为0（坍缩）。EMA机制（源自BYOL等非对比学习方法）让目标编码器**滞后于**上下文编码器缓慢演化，切断了目标表示对当前梯度的直接依赖，形成一种隐式的自举（bootstrap）稳定机制，同时结合停止梯度（stop-gradient，即目标分支不参与反向传播）共同抑制坍缩。

#### 5.3 非坍缩正则化的两条技术路线

**路线A：显式统计正则（VICReg/Barlow Twins风格）**
针对准则(1)(2)(4)（$s_x$、$s_y$需最大信息量，z需最小信息量），显式在损失中加入：
- **方差项**：约束每个表示维度的batch内标准差不低于某阈值（防止所有样本坍缩到一点）
- **协方差项**：约束不同维度之间去相关（防止维度冗余、信息坍缩到低维子空间）
- **不变性项**：即预测误差本身（对应准则3）

**路线B：分布匹配正则（LeJEPA的SIGReg）**
不再是启发式的方差/协方差约束，而是直接对表示的边缘分布做统计检验，强制匹配到理论证明的最优分布——各向同性高斯，从数学上一次性同时满足"防坍缩+最优可分性"两个目标，无需手工调节多个正则项的权重系数。

#### 5.4 V-JEPA/V-JEPA2 训练的额外细节

- **Mask-Denoising目标**：V-JEPA的目标是预测被随机丢弃部分的学习表示……任务的元架构由编码器Eθ构成……损失仅施加在被遮盖patch的预测上，以此防止表示坍缩。
- V-JEPA2训练分两阶段：先在大规模无动作标签视频上做纯自监督预训练（学通用物理直觉），再在少量机器人轨迹数据上做动作条件化的后训练（学会将动作信号接入世界模型，从而支持基于模型的规划，即Model Predictive Control式的"想象-选择最优动作序列"）。

---

### 六、应用全景

#### 6.1 计算机视觉基础任务
I-JEPA/V-JEPA学到的冻结表示可直接用于：图像分类（线性探针评估）、目标检测、深度估计等，且无需使用手工设计的视图数据增强即可学到强大的现成语义表示，学到的表示可以用于许多不同的应用，而无需大量微调。

#### 6.2 视频理解与动作预判
V-JEPA 2能够对世界将如何演变做出预测，在根据上下文线索预判动作方面达到新的最先进水平；在Something-Something v2、Epic-Kitchens-100等基准上取得SOTA。

#### 6.3 具身智能 / 机器人规划（最受关注的应用方向）
V-JEPA 2是首个在视频上训练、能实现最先进视觉理解与预测的世界模型，可在新环境中实现零样本机器人控制。研究者在62小时的Droid机器人数据集上训练V-JEPA 2，随后将其部署在新环境中的机械臂上；通过将任务指定为目标图像，模型能完成够取、抓握、拿取-放置等任务；由于是任务无关的，它可以在无需大量机器人数据或任务专用示范的情况下训练。这正是LeCun长期倡导的"世界模型驱动规划"愿景的首次实证：模型在"脑内"用JEPA预测器模拟不同动作序列的后果，再挑选出能让终态表示最接近"目标图像表示"的动作序列执行，是一种基于潜空间模型预测控制（Latent MPC）的路线。

#### 6.4 跨模态、跨领域的泛化应用
JEPA作为通用方法论，已被移植到诸多非视觉领域：
- **视觉-语言**：VL-JEPA将联合嵌入原理扩展到视觉-语言领域，通过预测连续文本嵌入而非自回归生成token，在参数量减少50%（16亿参数）的情况下取得与经典视觉语言模型相当的性能，同时原生支持开放词汇分类、文本到视频检索和视觉问答。
- **轨迹相似度计算**：T-JEPA，相比依赖手工数据增强方案的对比学习框架，JEPA在嵌入空间中自动化采样过程，并利用新颖的预测机制聚焦于捕捉复杂数据模式和潜在语义。
- **强化学习零样本迁移**：TD-JEPA，将时序差分学习与JEPA式潜在预测表示结合。
- **生理信号（脑电/心电）**：Hierarchical-JEPA应用于ECG，以及EEG领域的V-JEPA变体通过滑动多通道时间窗口构建输入体、3D卷积分块、领域特定遮盖和基于ViT的编码器，产生语义上有意义、生理学可解释的EEG嵌入，用于异常检测和概念发现。
- **导航世界模型**：Navigation World Models等将JEPA思想用于机器人/自动驾驶场景理解。
- **光流估计**：MC-JEPA将光流预测与内容表示学习统一在同一个共享编码器架构中。

---

### 七、总结：JEPA体系的核心哲学

将全文串联，JEPA的思想脉络可以浓缩为一条逻辑链：

1. **世界不可完全预测**（洞察）→ 所以不该强迫模型在像素空间做精确重建
2. **应在表示空间预测**（架构设计）→ 用EMA目标编码器+预测器实现，规避对比学习对数据增强/负样本的依赖
3. **表示空间预测面临坍缩风险**（技术挑战）→ 需要VICReg/Barlow Twins/SIGReg等机制强制表示保持信息量
4. **最优表示应满足各向同性高斯分布**（理论终点，LeJEPA的贡献）→ 把整个领域从"经验炼丹"提升为"有证明保证"的科学
5. **学到的抽象世界模型可用于规划**（终极目标）→ V-JEPA2-AC在机器人上的零样本部署，初步验证了LeCun"用世界模型代替纯生成式序列预测通向AGI"的核心信念。

这也是为什么LeCun反复强调JEPA而非扩大版LLM才是通向更接近人类智能系统的路径——因为它从架构根源上解决了"该预测什么、在哪个空间预测"这一自监督学习最核心的问题。

---

## WAM 的输入/输出、数据集、标签、损失函数

---

### 一、输入（Inputs）

以 DreamZero 为代表的主流 WAM，其输入由三路信号组成：

**Inputs**: Visual context（经过 VAE 编码）、language instructions（经过 text encoder 编码）、以及 proprioceptive state（本体感知状态，即关节角度等）。

具体拆解：

| 输入通道 | 形式 | 处理方式 |
|---------|------|---------|
| 视觉观测 $o$ | 当前相机帧（单帧或多帧拼接） | VAE 编码为 latent |
| 语言指令 $l$ | 自然语言字符串 | T5/CLIP 等 text encoder |
| 本体状态 $s$ | 关节角度、末端执行器状态 | 线性投影为 state token |

任务指令通过 cross-attention 注入，robot states 和 noisy actions 则被嵌入为 action tokens。

---

### 二、输出（Outputs）

**Outputs**: 对未来视频帧和机器人动作的**联合自回归预测**（joint autoregressive prediction of future video frames and robot actions）。

以 DreamZero-SO101 为例，具体来说：

给定单帧相机观测和自然语言任务描述，模型联合预测：**24 步未来 6-DOF 关节动作**（shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper）以及 **33 帧未来视频**（展示预测的任务执行过程）。两个模态在单次前向传播中用 flow matching 共同去噪，因此模型内部是自洽的——预测的动作和预测的视频描述的是同一段想象的 rollout。

---

### 三、数据集：需要什么数据，标签长什么样

这是 WAM 最关键的创新点之一——**数据需求的非对称性**。

#### 3.1 主数据集：带动作标签的机器人轨迹

DreamZero-DROID 的训练数据：**DROID 数据集（Distributed Robot Interaction Dataset）**，共约 **75k episodes，带有语言标注**（language annotations）。

DROID 是最异构的公开机器人数据集之一，DreamZero 用它来验证 WAM 在多样化、开源数据上的有效性。

这类数据的标签包括：
- **连续动作序列**：每时间步的关节角度 / 末端执行器位姿
- **RGB 视频帧序列**：任务执行过程的完整视频
- **自然语言任务描述**：对当前 episode 的语言 annotation

#### 3.2 关键优势：可使用无动作标签的视频

**Latent action 方法**（如 CoLA-World、LAWM）在预训练阶段**完全不需要显式机器人动作标签**，而是学习抽象的 latent token，其物理含义通过 world model 的预测损失来落地。

在"仅小比例数据含有动作标签"的设定中，WAM 只需要 **5% 的视频包含动作标签**，其余均为无标签的纯视频轨迹，模型仍可以有效训练。

具体的 mask 策略：对于无动作标签的视频，在训练时**mask 掉 action loss**，用预训练 RLA 编码器生成的 latent 来监督共享 backbone 的学习，proprioceptive 输入替换为可学习的 default token。

#### 3.3 数据多样性是关键

数据多样性实验表明：**500 小时多样化训练数据**的 task progress 达 50%，而重复性数据只有 33%，说明多样的状态-动作对应关系对于鲁棒的 inverse dynamics 学习至关重要。

---

### 四、损失函数（Loss Functions）

这是 WAM 与 VLA 的核心分水岭，以下从简单到复杂依次展示。

#### 4.1 基础版：Fast-WAM 的 Joint Flow Matching Loss

训练目标是对 **action chunk 和 future video latents 的联合 flow matching 损失**：

$$\mathcal{L} = \mathcal{L}_{act} + \lambda \cdot \mathcal{L}_{vid}$$

其中 $\mathcal{L}_{act} = \mathcal{L}_{FM}(\text{action chunk})$，$\mathcal{L}_{vid} = \mathcal{L}_{FM}(\text{future video latents})$。

具体实现细节：action expert hidden dim 为 1024，action horizon 为 32，经过 4x temporal downsampling 后 future video horizon 为 9 帧，推理时使用 10 个 action denoising steps，优化器为 AdamW，学习率 1e-4。

#### 4.2 标准版：通用 WAM 损失结构

WAM 的训练包含两个 flow matching 目标：video prediction loss $\mathcal{L}_{vid}$（Eq.9）和 action prediction loss $\mathcal{L}_{act}$（Eq.13），完整目标函数为：

$$\mathcal{L}_{\text{WAM}} = \mathcal{L}_{\text{vid}} + \lambda_{\text{act}} \cdot \mathcal{L}_{\text{act}}$$

其中 $\lambda_{act}$ 用于平衡视频预测目标和动作预测目标。

对于视频生成模块：遵循标准 diffusion 训练范式，在每个训练步骤中，噪声水平 $\tau_v$ 从 $[0,1]$ 均匀采样，将模型暴露在所有噪声水平下，强迫它学习生成未来帧所需的完整去噪轨迹。

#### 4.3 扩展版：VT-WAM（多模态）的三流 Loss

如果把触觉传感也并入，损失函数扩展为：

VT-WAM 对 visual、tactile 和 action token 采用**联合 flow matching 目标**，每个专家预测对应模态的 velocity field：

$$\mathcal{L}_{\text{Flow}} = \lambda_v \mathcal{L}_v + \lambda_t \mathcal{L}_t + \lambda_a \mathcal{L}_a$$

其中 $\mathcal{L}_v = \mathbb{E}\|\hat{f}^v - f_v^*\|^2$，$\mathcal{L}_t = \mathbb{E}\|\hat{f}^t - f_t^*\|^2$，$\mathcal{L}_a = \mathbb{E}\|\hat{f}^a - f_a^*\|^2$，各项分别为视觉、触觉和动作 token 预测 velocity field 与 flow matching target 之间的 MSE。

#### 4.4 三阶段版：Efficient-WAM 的分阶段训练损失

训练分三个阶段。**Stage 1**：用 video flow matching + 知识蒸馏损失联合训练 compact video expert：

$$\mathcal{L}_{\text{stage-1}} = \mathcal{L}_{\text{video-FM}} + \lambda_{\text{distill}} \mathcal{L}_{\text{distill}}$$

其中 $\mathcal{L}_{\text{distill}}$ 显式地从完整 WAN 模型迁移中间隐层表示和时序运动线索。

**Stage 2**：冻结 video branch，附加 action expert，用联合损失训练：

$$\mathcal{L}_{\text{stage-2}} = \mathcal{L}_{\text{action-FM}} + \lambda_v \mathcal{L}_{\text{video-FM}}$$

确保 future-imagination branch 保持对齐的同时 action expert 学习可执行控制。**Stage 3**：两个 expert 端到端 co-train，用相同联合目标做统一 fine-tuning。

---

### 五、一张表总结全貌

| 维度 | 内容 |
|------|------|
| **输入** | 视觉帧（VAE latent）+ 语言指令（text encoder）+ 本体状态（joint token） |
| **输出** | 未来视频帧序列 $\hat{o}'$ + 动作 chunk $a_{1:H}$，**单次前向联合预测** |
| **数据集** | 机器人操控轨迹视频（DROID, AgiBot 等），~75k episodes 起步 |
| **必须标签** | RGB 视频帧序列 + 语言标注；动作标签**仅需覆盖部分数据（最低 5%）** |
| **核心损失** | $\mathcal{L} = \mathcal{L}_{video\text{-}FM} + \lambda \cdot \mathcal{L}_{action\text{-}FM}$，两者都是 **Flow Matching（MSE on velocity field）** |
| **辅助损失** | 知识蒸馏 loss（Efficient-WAM）、触觉 flow loss（VT-WAM）、distractor-consistency loss（OA-WAM）等 |
| **优化器** | AdamW，lr ≈ 1e-4，混合精度 |

---

**核心结论**：WAM 的数据标签需求比 VLA 实际上**更宽松**——因为视频部分不需要动作标签，而有了视频生成任务作为额外的自监督信号，少量带动作标签的数据就能撬动很强的物理泛化能力。这才是 WAM 数据飞轮的真正逻辑所在。


---

## 一、WAM 能直接控制机器人吗？

**简短答案：能，但有严重代价，而且"能"的程度取决于任务类型。**

WAM 的高推理开销仍然是限制其在真实世界机器人系统中部署的主要挑战，单次推理步骤比其他方案慢至少 4.8 倍。

这不是小问题。机器人控制对实时性有硬性要求，Fast-WAM 已经是做了大量优化后的结果，才勉强达到 190ms 延迟。对于需要高频闭环控制的任务（比如接触丰富的灵巧操作），这个延迟根本不够用。

所以 WAM **目前在工程上主要扮演的角色是"大脑"而非全栈控制器**——它负责高层语义理解、任务规划和动作 chunk 生成，而不是直接输出关节级别的 torque 指令。

---

## 二、大脑-小脑架构：为什么必须分层？

最近的研究采用了由高层推理模型和低层动作模型构成的两层架构来实现具身人形机器人。这种分层设计受到人类大脑功能组织的启发：大脑皮层负责逻辑推理和决策，而小脑主管精细运动控制和协调。

这种范式倡导层级协作：上层大脑（通常是 LLM）负责慢速的高层感知、逻辑推理和任务分解；下层小脑（通常是轻量网络）处理快速动作执行和实时响应。

这个分层不是审美选择，而是由物理约束决定的：

| 层级 | 频率要求 | 负责内容 | 典型实现 |
|------|---------|---------|---------|
| 大脑（WAM/VLA） | 1-10 Hz | 任务理解、动作 chunk 规划 | Transformer + Diffusion |
| 小脑（低层控制器） | 100-1000 Hz | 关节 torque、平衡、接触力 | RL policy / MPC |

小脑通过运动控制和动作生成将决策转化为具体动作，使用运动控制算法和反馈控制系统来从大脑卸载低层控制。关键技术包括模型预测控制（MPC）、力与柔顺控制，以及实时响应优化。

#### 具体实例：HEX（人形机器人）

HEX 采用分层架构进行人形机器人全身操作，包含高层 VLA 策略和低层基于 RL 的全身控制器。高层策略接受视觉语言上下文和本体感知状态作为输入，产生与任务相关的动作。这些输出直接控制手臂和手部行为，同时作为低层控制器的中间指令。低层控制器以更高的控制频率运行，生成保持平衡、动力学可行的全身运动，以在行走和操作期间稳定执行。

#### 具体实例：NeuroVLA（三层架构）

采用系统级仿生设计：高层模型规划目标，自适应小脑模块使用高频传感器反馈来稳定运动，仿生脊髓层执行极速动作生成。

这说明"小脑"本身也可以继续分层——小脑 + 脊髓，分别处理中频和高频控制。

---

## 三、大脑和小脑之间的接口问题

这是最容易被忽略但最关键的工程问题：**大脑输出什么，小脑接受什么？**

目前有三种主流接口方案：

#### 方案 A：直接输出关节角度 / EEF 位姿（Action Chunk）

大脑（WAM/VLA）直接输出一段时间内的关节角度序列（如未来 32 步），小脑做轨迹插值和 PD 控制执行。这是最简单的方案，但对物理约束建模能力要求高，在高动态场景（跳跃、接触力控制）下容易失败。

#### 方案 B：Latent Action / 语义子目标

LeVERB 提出了一个用于人形机器人全身控制的分层 VLA 框架，从合成渲染的运动学演示中学习潜在动作词汇，并使用经过强化学习训练的全身控制器来执行动力学层面的指令。

WholeBodyVLA 同样针对闭环人形机器人移动操作，从无动作标签的以自我为中心视频中学习统一的潜在动作，并将其与面向运动控制的控制策略相结合。

这类方案的核心思想是：大脑不输出具体关节角度，而是输出**语义化的 latent 子目标**，让小脑自己去解析如何实现。好处是解耦了语义规划和物理执行，小脑可以做接触力控制、平衡调整等大脑不擅长的事情。

#### 方案 C：RoboOS 式的"操作系统"调度

RoboOS 包含三个主要组件：用于高层决策的具身大脑模型、用于执行各种机器人技能的小脑技能库，以及用于协调多智能体操作的实时共享内存。

这是最重度的工程化方案，大脑和小脑通过类操作系统的调度层通信，支持多机器人、多任务的并发协调。

---

## 四、机器人异构性怎么解决？

这是具身智能最难的工程问题之一，因为不同机器人的**关节数、动作空间维度、观测模态**完全不同，一个模型很难直接迁移。目前有四条技术路线：

#### 路线 1：Soft Prompt / 本体嵌入（X-VLA）

X-VLA 引入了一种软提示机制——本体感知特定的可学习嵌入，引导统一的 Transformer 骨干网络进行有效的多领域策略学习。所得架构 X-VLA-0.9B 在六个仿真平台和三个真实世界机器人上实现了最先进的泛化能力。

本质是：**Transformer 骨干共享，但每个机器人有自己专属的 learnable token 作为"身份证"**，告诉模型"我是什么本体"。这些 token 经过训练后编码了机器人的运动学特性。

#### 路线 2：Universal Action Space / VQ-VAE 动作离散化

共享的 VLM 从各种数据源中提取可迁移的特征；输出 token 被转换为通用动作，表示为向量量化码，其中每个码捕捉不同机器人之间的通用原子行为；Gumbel Softmax 选择的通用动作随后通过不同的 head 被转化回具体指令，每个 head 编码了各机器人的本体特定特征。

这套方案的关键洞察是：**把动作离散化为一个跨本体共享的原子行为码本**，让"抓取"这个语义在所有机器人上都映射到同一个 token，然后由各机器人专属的 MLP head 翻译成具体的关节指令。

#### 路线 3：Latent Alignment（潜在空间对齐）

跨本体学习旨在通过学习统一的表示空间来桥接运动学差异，从而合成一个能够控制多种机器人的统一策略。

第一阶段：使用带有进度感知对齐和本体对抗目标的 VQ-VAE 从异构机器人数据中学习统一的动作 motif，以确保跨本体一致性。第二阶段：多模态预测器使用冻结的基础编码器从视觉和语言输入中推断这些 motif。第三阶段：推断出的 motif 作为流匹配策略的结构性引导，使 Diffusion Transformer 能够通过少样本迁移生成本体特定的动作。

#### 路线 4：相机坐标系动作空间（EEF Delta）

以相机坐标系为参照的相对末端执行器动作，将增量表达在相机坐标系而非机器人特定的关节空间中，使单一策略能够在无需重新训练的情况下潜在地控制形态不同的机器人。

这是最轻量的方案：**不学机器人的关节，而是学末端执行器在视觉坐标系下的 delta 运动**。因为相机坐标系对所有机器人都是统一的，所以天然具有跨本体迁移性。代价是需要 IK（逆运动学）求解器将 EEF 指令转换回关节角度。

---

## 五、整体系统架构总结

```
┌─────────────────────────────────────────────────────┐
│               大脑层（WAM / VLA）                     │
│  输入：RGB + 语言指令 + 本体状态                       │
│  输出：动作 chunk / latent 子目标（1-10 Hz）           │
│  异构性解决：Soft Prompt / Universal Action / EEF     │
└──────────────────────┬──────────────────────────────┘
                       │ 接口：关节角度序列 / latent token
┌──────────────────────▼──────────────────────────────┐
│               小脑层（RL Policy / MPC）               │
│  接受大脑的动作 chunk，做轨迹插值和物理执行             │
│  负责：平衡控制、接触力控制、实时闭环（100-1000 Hz）   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              执行层（关节控制器）                      │
│  PD 控制 / Torque 控制 → 电机驱动                     │
└─────────────────────────────────────────────────────┘
```

**核心矛盾一句话**：大脑（WAM）解决"做什么"和"大致怎么做"，小脑（RL）解决"精确地执行"——两者的时间尺度、控制频率、优化目标完全不同，不能合并，只能分层接口化。异构性问题则通过在大脑层做语义抽象（Soft Prompt / Universal Action）来绕开，而不是试图在关节级别做对齐。

这一判断已经很接近本质了，但我觉得还可以再往下打一层——前文所述的"通信与标准"这个结论是对的，但背后的原因比表面看起来更深刻，而且有一个关键的不对称性被遮蔽了。

---

### 一、上述判断框架先做精确化

上述逻辑链是：

```
世界模型 ≈ 大模型套壳
         ↓
真正的难点分两侧：
  左侧（训练侧）：物理先验 + 多模态异构性
  右侧（部署侧）：大模型如何用于具身、衔接与通信
         ↓
归根结底是通信与标准问题
  LLM → token 统一
  Diffusion → 像素/latent 空间统一
```

这个框架基本成立，但有两个地方需要被拆穿。

---

### 二、被遮蔽的关键不对称性

#### Token 统一 ≠ 物理统一

LLM 用 token 统一是**成功的**，因为语言本身就是离散的、符号化的、组合性的——token 是语言的自然表达单位，两者有本体论上的同构性。

但物理世界根本不是 token 的。物理有几个语言没有的性质：

| 性质 | 语言 | 物理世界 |
|------|------|---------|
| 对称性 | 无 | 有（平移、旋转、时间不变性） |
| 守恒律 | 无 | 有（动量、能量守恒） |
| 连续性 | 离散 token | 连续微分流形 |
| 因果结构 | 弱（语义因果） | 强（接触力、碰撞、摩擦） |
| 单位与量纲 | 无 | 有（力/位移/质量不可混淆） |

**把物理世界 tokenize 本质上是在用错误的归纳偏置做表示学习**。Token 空间不尊重旋转等变性，不保证动量守恒，不知道 1N 力和 1mm 位移的本质区别。

这就是为什么即使给大模型喂再多机器人视频，它对接触力学的理解依然是统计相关性而非物理因果——**先验缺失不是数据量的问题，是归纳偏置（inductive bias）的问题**。

#### Diffusion 的像素空间统一也不是真正的物理统一

Diffusion 在像素空间生成未来帧，看起来比 token 更"物理"——但像素是**观测空间**，不是**状态空间**。

两者的差别：
- 状态空间：$q \in \mathbb{R}^n$（关节角度、质心位置），服从拉格朗日动力学
- 观测空间：$o \in \mathbb{R}^{H \times W \times 3}$，是状态的高维、有损、视角相关投影

Diffusion 预测的未来帧可以看起来物理合理（视觉一致），但内部没有任何机制保证它满足刚体动力学方程。这就是为什么视频生成模型会出现"看起来对但实际上违反物理"的幻觉帧——它在优化感知真实性，不是物理真实性。

---

### 三、"通信与标准"的问题拆解

所谓归根结底是通信与标准的问题，这是对的，但这个问题有三个层次，难度递增：

#### 层次 1：数据格式标准——相对容易，已有进展

Open-X Embodiment、LEROBOT 数据集格式、DROID——这些是数据层面的标准化尝试，统一存储格式、标注格式、坐标系定义。这层问题基本可工程化解决。

#### 层次 2：接口协议标准——正在攻克，但有物理约束

类比：
- TCP/IP 解决了网络通信标准
- USB 解决了物理接口标准
- POSIX 解决了 OS 接口标准

具身智能需要的等价物是：**大脑输出格式 ↔ 小脑输入格式的标准协议**。

但这里有一个 TCP/IP 没有的难题：**数字协议的包是同构的，但物理动作不是**。

"拿起杯子"这条指令对 UR5 机械臂和对人形机器人 LEAP 手的含义，在关节空间里是完全不同的张量。无法定义一个像 IP 包头那样固定的物理动作协议，因为不同本体的状态空间维度、关节拓扑、动力学参数根本不同——这是不可消除的物理异构性。

目前的解法是**在语义层做统一，在执行层保留异构**：
- EEF delta（末端执行器增量）：在笛卡尔空间统一，绕开关节空间差异
- Latent action：用 VQ-VAE 学一个跨本体的语义动作码本，让"抓取"这个语义对所有机器人映射到同一个 code
- Soft prompt / 本体嵌入：backbone 共享，但每个机器人有专属 learnable token 告诉模型自己的运动学结构

**本质上是在找一个"物理不变量"作为通信层**——跨本体不变的语义动作表示。但这个不变量不像 IP 协议那样可以手工定义，必须被学出来，而且学出来的东西不可解释。

#### 层次 3：物理先验标准——最难，目前基本未解

这才是真正的硬骨头。物理先验不是数据问题，是**模型归纳偏置问题**。

历史上有三条路：

**路线 A：神经网络硬编码物理结构**
用 Lagrangian Neural Networks、Hamiltonian Neural Networks，把能量守恒、动量守恒编进网络结构本身。但这类模型只在低维、简单系统上有效，scaling 极差，无法处理接触不连续性（碰撞瞬间动力学突变）。

**路线 B：用仿真器作为物理先验来源**
Isaac Sim、MuJoCo、Genesis 等物理仿真器天然满足物理约束，用它们生成合成数据做预训练。问题是 sim-to-real gap 没有根本解决，接触力学的仿真精度仍然是瓶颈。

**路线 C：涌现物理理解（目前 WAM/大模型走的路）**
用足够多的真实视频，希望物理规律从统计规律中自然涌现。这条路的问题就是一开始就直觉到的——它学到的是物理的**表象**（视觉相关性），不是物理的**机制**（因果结构）。

---

### 四、真正的未解问题是什么

把上面三层合并，具身智能的核心未解问题可以精确表达为：

> **如何设计一个表示空间，使得它同时满足：**
> 1. **语义可组合性**（像 token 一样可以被语言模型理解和生成）
> 2. **物理等变性**（尊重旋转/平移对称性、满足守恒律）
> 3. **跨本体不变性**（同一语义动作在不同机器人上可以被正确解码）
> 4. **实时可计算性**（推理延迟 < 10ms，满足低层控制频率需求）

**这四个约束目前没有任何一个方法能同时满足。** 现有方法都是在这四个约束之间做 trade-off：

| 方法 | 语义组合 | 物理等变 | 跨本体 | 实时性 |
|------|---------|---------|-------|-------|
| VLA（token） | ✅ | ❌ | ⚠️ | ✅ |
| WAM（video diffusion） | ⚠️ | ⚠️ | ❌ | ❌ |
| LNN/HNN | ❌ | ✅ | ❌ | ✅ |
| EEF delta | ❌ | ⚠️ | ✅ | ✅ |
| Latent action | ⚠️ | ❌ | ✅ | ⚠️ |

---

### 五、一句话的本质判断

前文所述："归根结底是通信与标准的问题"——更精确的表述是：

> **具身智能的核心矛盾是：物理世界的不变量（对称性、守恒律、接触动力学）与当前大模型的表示空间（token/像素latent）之间存在本体论不匹配（ontological mismatch）。通信与标准问题是这个矛盾的工程表现，而不是根本原因。根本原因是我们还没有找到一种表示，能让物理先验和语义先验在同一个空间里被统一表达和学习。**

## 异构性问题
LLM 用 token 统一了语言，Diffusion 用像素统一了视觉生成——但**没有任何东西统一了物理**。这才是具身智能最硬的那块骨头。

这是目前具身智能/机器人基础模型领域最核心的难点之一。结合最新研究进展，确保答案是准确且前沿的。这一困惑完全抓住了这个领域最核心的痛点。**这个问题目前并没有被"优雅地"解决**，更多是通过几条并行的技术路线在"绕开"或"缓解"它，而不是像LLM的token序列那样有一个天然统一的表示。目前主流的思路梳理如下：

### 1. 显式统一动作空间——"填表格"式的暴力对齐

最直接的思路是人工设计一个足够大的"通用动作向量"，把不同本体的动作硬塞进去。比如清华的RDT-1B：研究者把各种机器人的动作嵌入到一个统一空间里，这个空间包含了机器人所有主要的物理量，维度为128。对于具体某个机器人，原始动作向量的每个元素会根据其物理含义填入统一动作向量的对应位置，其余位置则做padding。

类似地，最新的JoyAI-RA采用了"相机坐标系下的末端执行器表示"：用相机坐标系而不是机器人自身的基座坐标系或关节空间来表达动作，带来的好处是能保证一致的物理语义——同一个动作向量无论机器人基座朝向或运动学构型如何，都编码相同的空间位移和旋转。这类方法本质上是**牺牲一些表达精度，换取跨本体的"接口兼容性"**，但仍然需要人工设计映射规则，扩展性有限。

### 2. 隐式/学习出来的统一动作空间——让模型自己发现"通用动作语言"

比起人工设计，更前沿的做法是让模型自己学出一个隐空间来表示动作，而不是依赖显式的关节角/末端位姿标签。ICML 2026的一篇工作LAC-WM很有意思，它直接对比了这两种思路：实验结果表明，显式的动作条件化会导致不同本体之间产生"互不相通"的动作表示，限制了模型迁移到新机器人时的下游性能。而采用统一隐动作空间后，LAC-WM的下游性能会随着预训练本体数量的增加而正向提升，相反显式动作空间的模型则会随着预训练本体增多而性能下降。这其实很反直觉——**越"精确"地描述动作，反而越难泛化**，因为不同本体的关节定义本身就是"伪概念"，只在各自坐标系内有意义。

同样的思路也体现在Universal Actions等工作中：用向量量化的编码本表示原子级的通用动作，一个共享的VLM输出对这些抽象编码的类别分布，再由轻量级的、本体专属的解码头把它转换成具体机器人指令，这种解耦带来了对新机器人的快速适配和更稳健的跨本体策略迁移。

### 3. 更彻底的路线——干脆绕开"动作"，统一到"物理状态"或"视觉"层面

这是我觉得最有意思、也更接近前文所述的"范式统一"的方向：既然动作空间没法统一，那就统一预测目标本身——**预测世界如何变化，而不是预测关节该怎么转**。

- **视频/视觉作为通用接口**：WoW这类世界模型直接在像素空间做预测，模型无需任何微调就能在UR5、Franka工业臂、仿真环境、并联运动学臂、灵巧手等一系列多样化的具身硬件平台上遵循指令，这证明了模型能学到一种与具体运动学和动力学解耦的、embodiment-agnostic的物理交互表示。这里动作只是"条件"，真正统一的是对世界状态演化的建模，具体怎么执行留给下游的小型控制器去解决。

- **几何/粒子表示统一状态与动作**：2025年11月的一篇工作更极端，把机器人手和物体全都表示成3D粒子点云，动作定义为粒子位移场：核心想法是把不同本体和物体都表示为3D粒子，动作表示为末端执行器的粒子位移场，这种状态-动作抽象统一了跨本体的数据和控制。作者认为可迁移的结构不在于各个本体的关节空间，而在于它们所参与的物理交互本身——这跟前文所述的LLM统一范式的思路很像：**找到一个比表面形态更底层的共性**（LLM找到的是"token序列"，机器人领域在尝试找"3D几何交互"或"像素演化"）。

### 4. 用海量数据和多样性"硬堆"出泛化能力

另一条思路不追求结构上的完美统一，而是相信"量大就能泛化"，类似LLM的scaling law思路。上述粒子世界模型的实验发现：增加训练本体的多样性能提升对未见过的手的泛化能力，恰当地结合仿真和真实世界数据的效果优于单独使用任一数据源，同一个学到的模型能够对具有不同运动学结构和自由度的机器手实现有效控制。

同时，人类视频被当作一种"万能本体"来疯狂扩充数据多样性，比如Being-H0.5：构建了超过35000小时的大规模语料库UniHand-2.0，涵盖跨本体的物理控制和通用视觉-文本理解，并用统一动作空间把人手运动和多种机器人本体统一起来，通过统一的序列建模训练所有异构监督信号。人类数据量大且天然多样，可以作为"本体多样性"的廉价来源，弥补机器人真实数据稀缺的问题。

### 坦率地说：这个问题还没有被真正解决

我不想过度美化现状。业内综述也承认：对全新机器人本体（形态、相机配置）的零样本泛化能力仍然有限，像RT-1-X这样的预训练模型在面对新机器人时仍需要针对该本体做微调，技能迁移的效果要好于物体身份迁移，这仍是通用化的关键瓶颈。另一篇最新综述也指出，跨本体泛化在多本体训练确实能提升同分布内表现的同时，真正的零样本组合和外推泛化仍是一个未解决的问题，需要进一步的架构突破。

总体来看：目前机器人领域没有找到LLM级别的"token"式统一表示，而是在多条战线上同时推进——
1. 工程上"暴力对齐"（统一动作向量、统一坐标系）；
2. 让模型自己学出隐式的通用动作/技能空间，而不是依赖人工定义的物理量；
3. 把统一的层次上移，从"动作"退到更底层、更物理的"状态演化"（视频/几何/粒子），本体差异被压缩到最后一层轻量的解码器里；
4. 靠海量多样本体数据硬堆规模效应。

这几条路线目前是互相补充、共同推进的关系，而不是某一个已经"解决"了问题。某种意义上，机器人领域的"GPT时刻"可能不会来自单一的统一动作token，而更可能来自类似WoW、粒子世界模型这种**把统一层级下沉到物理世界本身**的方向——因为物理规律（几何、接触、动力学）比任何一种关节定义都更加"本体无关"，这跟语言的token序列是所有语言任务共同底层结构，是一个道理。

## 不可言说问题
这触及了当前具身智能/世界模型研究的核心矛盾。这一直觉是对的，这确实是当前具身智能/世界模型领域最核心的矛盾之一。目前学界已经不再指望"把动作硬翻译成语言token"这条路，而是分化出几条明显绕开语言符号瓶颈的路线。下面按代价从高到低梳理现状：

### 1. 承认问题：为什么强行向语言对齐代价高

标准VLA（Vision-Language-Action）范式最初确实是把动作也变成文本token来处理——比如把导航动作编码成数字字符串直接塞进语言模型的词表unlike NWM which encodes navigation actions (translation and rotation deltas) as specialized continuous vectors, we directly represent actions as standard text tokens (i.e. numerical strings)。这种做法简单粗暴，但正如前述，把连续、高频、小脑级的运动信号硬塞进离散符号空间，本质上是在做一次有损压缩，而且这个压缩basis（语言）根本不是为运动控制设计的。

### 2. 路线一：动作头不再"说话"，只用语言做条件——Flow Matching / Diffusion Policy

现在主流VLA（如π0）不再让动作离散token化，而是把语言/视觉的隐藏状态仅仅作为**条件**，让一个独立的连续生成模块（flow matching）直接在动作空间里去噪生成轨迹：π₀ addresses it with the first flow-matching action head for VLAs. Built on a 3B-parameter PaLIGemma backbone, the model processes image and language tokens through the VLM then uses the resulting hidden states to condition a flow-matching network that generates action chunks. The action head consists of Transformer layers that jointly attend to VLM features and noisy action tokens, iteratively denoising over K=10 flow steps.

这里的关键设计哲学是：语言只负责"高层语义grounding"（这是个什么任务、目标物体是什么），而**运动本身完全不经过符号化**，保留在连续几何空间里训练，从而eliminates quantization error, preserves the Euclidean geometry of actions, and naturally handles multimodal distributions。这相当于把"可言说的"（任务语义）和"不可言说的"（运动执行）显式拆成两个子系统，只在接口处对齐，而不是强行共享同一token空间。

### 3. 路线二：连动作标签都不要——从无标注视频中学"隐动作"

更激进的做法是承认人类动作数据根本没法标注（无法给"小脑协调"贴标签），于是转向无监督的**latent action**：LAPA先用VQ-VAE从视频帧对之间学出离散的"隐动作"表示，再让VLA去预测这个隐动作，最后才用少量机器人数据把隐动作映射到真实动作空间：We first train an action quantization model leveraging VQ-VAE-based objective to learn discrete latent actions between image frames, then pretrain a latent VLA model to predict these latent actions from observations and task descriptions, and finally finetune the VLA on small-scale robot manipulation data to map from latent to robot actions. 结果是it outperforms the state-of-the-art VLA model trained with robotic action labels on real-world manipulation tasks——说明"不可言说"的运动信息本身可以自监督地从像素变化中被压缩出来，完全不需要语言或人工标注做中介。

不过这条路也有隐患：如果视频里有大量与任务无关的背景运动（distractor），学出来的隐动作可能会退化，LAPO struggles to learn latent actions useful for pre-training and that simple BC or IDM are more effective，所以这不是免费的午餐，仍是活跃的研究问题。

### 4. 路线三：彻底放弃"对齐"这个框架——JEPA式世界模型（LeCun路线）

这可能最接近期望的答案。JEPA的核心哲学就是不做跨模态的符号对齐，而是让所有模态各自的编码器学到一个共享的、非语言的**预测性latent空间**，在这个空间里做"预测下一状态"而不是"生成像素"或"生成文字"：Joint Embedding Predictive Architectures (JEPA) were proposed as non-generative predictive models that compare predictions in representation space rather than input space. For world model learning, JEPA is attractive because planning requires accurate predictions of how different actions lead to different future states, rather than photorealistic observation synthesis.

V-JEPA系列已经证明这条路可行：V-JEPA 2, pre-trained on over one million hours of video through self-supervised spatiotemporal representation learning, predicts masked spatio-temporal regions entirely in a learned latent space without any pixel reconstruction. The resulting representations achieve 77.3% top-1 accuracy on Something-Something v2 and, critically for world modeling, can be post-trained for robotic action-conditioned planning on Franka robot arms using fewer than 62 hours of unlabeled robot video. 注意这里"fewer than 62 hours"——说明底层的物理/运动理解绝大部分是从海量无标签视频里自监督学出来的，语言介入的对齐成本被压到极低。

甚至有工作专门验证了这个猜想：把一个通用多模态预训练模型直接用来做世界建模，发现world modeling capabilities emerge primarily from general multimodal pretraining rather than domain-specific data. Adding unsupervised video data yields the largest gain, outperforming scaling in-domain NWM data alone. More strikingly, when we vary the ratio of domain-specific data while keeping total training data fixed, performance saturates at just 1% in-domain data. This suggests that the core capability is acquired from general pretraining, and in-domain data just helps the model to learn the specific task format. This also implies that to build better world models, we do not necessarily have to collect large-scale action-conditioned data。这其实是对上述问题的一个正面回答：**跨模态对齐所需的"语言标注量"可以极小**，因为真正的动力学知识早已隐含在纯视觉/视频的自监督表示里，语言只是最后一层薄薄的接口。

### 5. 路线四：混合架构——语言管"任务"，JEPA latent管"物理"

最新的工作试图把上述几条路缝合起来，例如VLA-JEPA：用JEPA在latent空间做无语言的状态转移预测（这部分对应前文所述的"小脑"），然后接一个flow-matching动作头把latent state转成连续轨迹，语言只在VLM那一层做任务理解：We introduce VLA-JEPA, a JEPA-style pretraining framework that sidesteps these pitfalls by design. The key idea is leakage-free state prediction: a target encoder produces latent representations from future frames, while the student pathway sees only the current observation -- future information is used solely as supervision targets, never as input. By predicting in latent space rather than pixel space, VLA-JEPA learns dynamics abstractions that are robust to camera motion and irrelevant background changes.

### 6. 这仍是未完全解决的难题

这条路目前有几个公认的开放问题：
- **表征坍缩（collapse）**：如果只用latent prediction loss，模型很容易学到"把所有输入映射成同一个常数向量"这种trivial解，end-to-end JEPA training with only latent prediction losses can admit trivial constant representations, making collapse prevention a central design issue，需要额外的正则化（VCReg、SIGReg等）来防止。
- **理论保证缺失**：there is currently no theoretical framework explaining how JEPAs generalize as a world model framework in real-world action planning. As the action planning is conducted in the latent space whereas the planned actions are to be evaluated in the input-level downstream tasks, provable guarantees on downstream generalization is of vital importance.
- **信息泄漏/走捷径**：latent action容易"抄近路"而不是真的学到有意义的动作语义，这是VLA-JEPA、Delta-JEPA等工作专门要解决的问题。

**总结上述问题**：目前的解法不是"把运动也变成可言说的语言"，而是反过来——**承认运动是不可言说的，把它留在一个纯粹自监督、非符号的connectionist latent空间里（JEPA/latent action），语言仅仅作为一个高层任务接口，在极少的对齐点上介入**。这本质上是LeCun一直在强调的"世界模型不该建立在语言之上"的立场，也是目前最有希望绕开VLM高昂对齐成本的方向，但表征坍缩、理论保证、跨embodiment泛化等问题都还没有定论，是一个非常活跃的研究前沿。

## 数据问题
下面按该问题最常见的意图来回答：前文所述的**世界模型（world model）**更像是“能预测世界如何随时间演化、并且（最好）能在动作作用下可交互地演化”的模型——用于机器人/自动驾驶/可交互生成环境/物理仿真与规划，而不只是“生成一段看起来像真的视频”。这一点在机器人综述里常用的定义是：世界模型是“**在动作条件下预测环境如何演化的预测性表示**”。

---

### 先给结论：世界模型“缺不缺数据”，答案是“既缺，也不只是缺”
**1）不缺“原始视频/图像”的数量，但缺“能让模型学会因果与可控”的数据形态。**  
互联网视频很多，甚至已经能训练出很强的“视觉生成器/视觉模拟器”。OpenAI 在 Sora 的技术报告里就把方向描述为：**规模化训练视频生成模型可能通向通用物理世界模拟器**，并强调它把不同分辨率/时长的视觉数据统一成“时空 patches（类似 token）”来做大规模训练。  
但这类“纯观测（passive）视频”往往缺少明确动作、力、接触、控制信号，学到的更容易是“长得像”而不是“可被动作稳定操控地演化”。

**2）在机器人/具身智能里，确实很缺“交互数据（observation, action, feedback）”。**  
机器人数据贵在：要硬件、要人、要安全流程、要覆盖多场景多任务。DROID 论文开篇就直说：大规模多样机器人操作数据集很难建，成本高，因此现有通用策略常常仍局限在少量受控环境里；它们用 12 个月、跨多地收集了约 **76k 轨迹 / 350 小时**的真实机器人交互数据，并且每条 episode 包含多视角、深度、标定与语言注释。  
这已经算“大”，但和 LLM 的互联网文本规模相比仍是小巫见大巫。

**3）更关键的是：世界模型面对的是“长时闭环（closed-loop）一致性”难题，而不仅是数据规模。**  
在机器人里，action-conditioned 的视频预测世界模型很有潜力，但很多方法**慢、且长时滚动会因误差累积而漂**，导致作为训练环境不稳定。近期一些工作把“能稳定跑很久”当核心指标来攻（例如宣称能稳定交互到分钟级）。  
这说明：就算数据量上来，“可长期物理一致 + 可控”仍是硬指标。

---

### 世界模型到底需要怎样的数据？（为什么不像 LLM 只吃文本就行）
把世界模型拆开看，可以发现它至少要同时学三件事：

1) **感知/表征**：从像素、点云、声音、触觉、关节状态里抽取“状态”。  
2) **动力学/因果**：在给定动作下，状态怎么变。  
3) **渲染/观测生成**：状态怎么变回下一帧/多模态观测（否则无法对齐真实传感器数据、也难以作为仿真器使用）。

因此它天然会“吃很多种数据”。下面用“数据类型 → 解决什么问题 → 例子”来解释。

#### A. 纯观测数据（互联网视频/图片/音频）：学“外观 + 粗动态 + 常识先验”
- **优点**：便宜、规模巨大、覆盖人类活动与场景多样性。  
- **缺点**：通常没有动作标签、没有力与接触信息、因果可控性弱。  
- **例子**：DeepMind 的 Genie 明确写的是：从**无标注互联网视频**无监督训练出“可交互环境”，并通过“潜在动作（latent action）”让用户逐帧交互，即使训练时没有 ground-truth 动作标签。  
- **例子**：Sora 把不同视觉数据统一为 patches 做大规模训练，强调“视频生成模型作为世界模拟器”的方向。

> 直觉：这类数据更像“读很多书和看很多纪录片”，能形成丰富印象，但不等于就能开叉车或拧瓶盖。

#### B. 第一人称/带动作意图的观测数据（egocentric）：更接近“具身视角”
- **价值**：第一人称视角更贴近机器人/人类操作时的视觉分布，常包含手-物交互线索。  
- **例子**：Ego4D 是大规模第一人称视频数据集与基准，官方材料强调其规模达 **3,600+ 小时**并包含多种任务与（部分）音频相关基准。

#### C. 真正关键：带动作的交互轨迹数据（obs-action sequence）
这是“把世界模型从会编视频，拉到能做控制/规划”的分水岭。

- **机器人领域（开源在快速补齐）**  
  - Open X-Embodiment（OXE）：DeepMind 博文称其汇集了 **22 种机器人形态、100 万+ episodes、500+ skills、15 万+ tasks**，核心目标就是让一个模型跨机器人迁移。  
  - DROID：强调真实环境“in-the-wild”操作数据，成本高但能带来更强泛化；并提供多相机、深度、标定、语言等信息。

- **自动驾驶（往往是公司私有数据 + 合成数据）**  
  - Wayve 的 GAIA-1 明确是 **video + text + action** 输入的生成式世界模型，并在扩展版本里披露训练集是 **2019–2023 年在伦敦采集的约 4,700 小时私有驾驶数据**；它把“像 LLM 一样的 next-token 预测”迁移到了视频 token 上，并讨论 scaling。  

#### D. “结构化/几何/物理”辅助数据：深度、分割、LiDAR、轨迹图、姿态、力/触觉……
关于"为什么有这么多种数据"，这里是核心原因之一：  
**像素里缺少可辨识的尺度、可分解的物体与接触关系、以及真实几何。**所以工程上会用更多“结构化通道”把隐藏状态显式化，让模型更像在学物理而不是在学贴图。

- NVIDIA 在 Cosmos 的新闻稿里就把“可控合成数据/可控生成”建立在这些结构化输入上：Cosmos Transfer 可以 ingest **分割图、深度图、LiDAR 扫描、姿态图、轨迹图**来生成可控的照片级视频，用于大规模合成数据。  
- 在自动驾驶长尾上，NVIDIA 的 Cosmos-Drive-Dreams 页面也强调：真实世界里**采集与标注安全关键边缘案例很贵且难**，合成数据管线用可控、多视角、时空一致的视频生成来补长尾，并展示从野外视频自动预测 HDMap/深度、甚至生成 LiDAR 的思路。  

#### E. 合成数据（simulation / synthetic）：补“长尾罕见事件 + 危险场景 + 覆盖率”
LLM 从互联网文本里能自然覆盖大量“罕见但被写下来”的事件；物理世界里，很多关键长尾（事故、极端天气、罕见接触形变）在真实采集上要么危险要么概率极低，因此会强依赖合成数据工厂。

- NVIDIA 的相关材料把 Cosmos 与 Omniverse 结合，定位就是“物理 AI 的合成数据与仿真/后训练平台”。  

---

### 为什么 LLM “吃互联网文本”就成功，而世界模型不能简单复制？
从“信息形态”角度看，互联网文本对学习世界规律有天然优势：

1) **文本是人类压缩过的世界模型**：人类已经把因果、动机、抽象关系写进了语言（“因为…所以…”，“如果…就…”）。模型学 next-token，等价于在学一种高度结构化的世界描述。  
2) **视频/传感器数据带宽极高但信息密度未必高**：大量像素变化与纹理对“物理可控性”贡献不大；真正关键的是可分解对象、接触、力、约束与动作后果。  
3) **世界模型需要“闭环可控”**：LLM 生成错一句话，后果通常可控；世界模型若在长时滚动里漂移，策略就会学会“利用模拟器漏洞”。因此很多研究把“长时一致性/稳定交互”当作主要瓶颈。  

这也是业界路线越来越像这样：  
**用海量观测视频学通用视觉先验 → 再用相对小但高价值的交互数据（动作/力/多传感器）做对齐与可控化 → 再用合成数据补长尾与覆盖**。相关工作甚至尝试在“中等规模真实交互数据”上训练交互式世界模拟器，再在模拟器里生成更多示范来训练策略。  

---

### “世界模型缺什么数据”更精确的说法：缺的是“能把相关变量钉死”的数据
如果把“缺数据”具体化，通常缺在这些维度（比“多拍点视频”更关键）：

- **动作标注/控制接口**：没有动作，就很难把相关性变成因果（Genie 用 latent action 是一种折中）。  
- **接触与力学信号**：触觉、力矩、关节电流、夹爪接触等，对操作任务至关重要，但互联网几乎没有。  
- **多视角+标定**：单目视频很难恢复真实尺度与遮挡后的三维一致性；机器人数据集常显式提供多相机与标定。  
- **长尾与反事实（counterfactual）**：比如“同一场景下，如果方向盘打 10° vs 20°会怎样”。真实采集很难系统覆盖，所以合成数据与可控生成很重要。  

---

### 现在世界模型的数据路线，正在变得更像“多模态 token + 动作 token + 合成数据工厂”
一个很能代表趋势的例子是 NVIDIA Cosmos 3：Axios 报道里强调它训练数据包含多模态 token（图像、真实与合成视频、环境音频、文本）以及**人和机器人动作数据**，并指出“动作数据”使其区别于普通视频生成器——目标是建模机器如何移动，而不仅是画面如何变化。  
再配合 Cosmos Transfer 这类“吃分割/深度/LiDAR/轨迹图”的模型，用于把仿真结构化输出变成照片级可控数据，形成“数据工厂”。  

---

### 实用小结（把三个问句一一对上）
**Q1：目前世界模型真的缺数据吗？**  
- **缺**：机器人/具身/真实可控交互数据（动作、力、触觉、多传感器标定、长尾边缘案例）。DROID/OXE 这类努力正在补，但量级仍远小于文本世界。  
- **不完全缺**：纯互联网视频/图片规模很大，足以训练强生成器（Sora/Genie 方向），但这不自动等价于“可做闭环控制的世界模型”。  

**Q2：需要怎样的数据？**  
- 至少要把 **观测（多模态）+ 动作（可控）+ 结构化几何/物理辅助信号 + 长尾覆盖（合成）** 组合起来；不同应用（机器人/驾驶/游戏）权重不同。  

**Q3：为什么有这么多种数据？**  
- 因为世界模型要解决的是“部分可观测系统的因果动力学 + 可渲染观测”，像素本身不够把关键状态（尺度、接触、约束、可控因子）钉住；多种数据是在用不同通道把隐藏变量显式化，并补齐长尾与可控性。  

---

要理解这件事的本质，最贴切的类比：

- **LLM = 从人类写下的“世界摘要（文本 token）”里学规律**  
- **世界模型 = 从高带宽传感器流里同时学“世界状态 + 世界规律 + 可控接口（动作）”**  

所以世界模型看起来“数据种类多、还总说缺数据”，本质不是大家更挑剔，而是它要学的那部分（可控因果动力学）在公开互联网里天然就更稀缺、更难对齐、更难评测。
