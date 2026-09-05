---
title: "扩散模型的后训练"
date: 2026-08-26
category: "生成模型"
tags:
  - "扩散模型"
  - "后训练"
  - "对齐"
description: "要理解diffusion/flow matching的后训练，最好的办法就是把它和你熟悉的LLM后训练做逐一映射。LLM后训练大致是：预训练 → SFT → 训练RM → RLHF(PPO)/DPO → 蒸馏/加速。生成式扩散/流匹配模型走的是几乎一样的路径，只是因为生成过程的数学结构不同（连续时间……"
---

# 扩散模型的后训练

## 概览
要理解diffusion/flow matching的后训练，最好的办法就是把它和你熟悉的LLM后训练做逐一映射。LLM后训练大致是：**预训练 → SFT → 训练RM → RLHF(PPO)/DPO → 蒸馏/加速**。生成式扩散/流匹配模型走的是几乎一样的路径，只是因为生成过程的数学结构不同（连续时间、多步、可微），衍生出了一批"LLM没有对应物"或者"LLM做不到"的独特技术。下面我按照这个类比框架，从头到尾系统讲一遍。


### 1. 后训练的整体类比地图

| LLM后训练阶段 | 目的 | Diffusion/Flow Matching对应阶段 |
|---|---|---|
| Continued Pretraining / SFT | 换数据分布、学新知识/新格式 | 领域微调、LoRA/DreamBooth、风格/主体定制、Latent Consistency Fine-tuning |
| 训练Reward Model | 把人类偏好变成可优化的标量信号 | 训练ImageReward/PickScore/HPSv2/美学评分器，或直接用GenEval/OCR/检测器等程序化reward |
| RLHF (PPO) | 用RL最大化reward，同时KL约束不跑偏 | DDPO、DPOK（把去噪过程建模成MDP，用policy gradient/PPO优化） |
| DPO / 直接对齐 | 跳过RM和RL，直接用偏好对优化 | Diffusion-DPO及一系列变体（D3PO、step-aware DPO、Inversion-DPO、BalancedDPO…） |
| （LLM暂无严格对应） | 利用生成过程可微，直接反传reward梯度 | ReFL、DRaFT/DRaFT-K、AlignProp、DRTune |
| GRPO（2025新范式，LLM推理模型标配） | Group-relative优势、去掉critic的高效RL | DDPO的GRPO化：Flow-GRPO、DanceGRPO、MixGRPO、BranchGRPO、TempFlow-GRPO… |
| 蒸馏/量化/投机解码（推理加速） | 降低推理成本 | 一致性蒸馏(CM/LCM)、渐进蒸馏、分布匹配蒸馏(DMD/DMD2)、对抗蒸馏(ADD/LADD) |
| 安全对齐/red teaming | 拒答、去毒 | 概念擦除/去NSFW/风格遗忘（concept erasing / unlearning） |

下面逐块展开。

---

### 2. 第一阶段：SFT类——监督微调 / 领域适配

这一阶段完全不改变训练目标的数学形式（还是标准的噪声预测/速度回归损失），只是**换数据**，就像LLM的continued pretraining + instruction SFT：

- **全参数微调 / LoRA微调**：在新的图像-文本数据集上继续用扩散损失训练，用于换风格、换领域（如医学影像、动漫风格）。
- **DreamBooth / Textual Inversion**：小样本主体定制，本质是极端数据稀缺场景下的SFT。
- **ControlNet/Adapter注入**：新增条件分支（边缘图、深度图、姿态等），冻结主干只训练新模块——类似LLM里插入LoRA adapter做参数高效微调。
- **像素空间后训练（Pixel-Space Post-Training）**：在latent space的模型微调时，把latent解码回像素空间并在输出图像分辨率上增加监督，用于弥补VAE解码带来的细节损失。
- **Latent Consistency Fine-tuning（LCF）**：允许在自定义数据集上微调预训练的LCM以支持少步推理，即在已经蒸馏成"快模型"之后，还能继续做SFT式的领域适配而不破坏少步推理能力。

这一层的定位就是"教会模型新东西"，还没有涉及"人类更喜欢哪个"这种偏好信号，所以严格来说只是LLM里SFT那一层，还没进入RLHF。

---

### 3. 第二阶段：训练Reward Model（把人类偏好变成标量）

和LLM RM训练一样：收集"同一个prompt生成的两张图，哪张更好"的偏好对，用Bradley-Terry模型训练一个打分网络（ImageReward、PickScore、HPSv2、Aesthetic Predictor等）。RLHF典型包含两阶段：先从成对偏好训练一个reward model，再用强化学习优化策略；给定条件c下的偏好对，Bradley-Terry模型定义偏好似然为奖励差的sigmoid。

**扩散领域的一个特殊之处**：除了"学出来的"reward model，还大量使用**程序化/可计算的reward**，比如GenEval的目标计数/空间关系检测器、OCR识别准确率（文字渲染）、CLIPScore（图文对齐）等，这些不需要人工标注就能算，极大丰富了RLHF可用的信号种类，这是LLM RLHF里相对少见的（LLM也有可验证奖励/RLVR，但图像领域更早、更广泛地用了这套思路）。

---

### 4. 第三阶段：对齐——三条并行技术路线

这是整个后训练体系里最丰富、也是过去两年发展最快的部分。可以分成三条并行的技术路线，其中第二条是LLM完全没有的"扩散模型特权"。

#### 4.1 路线A：把去噪过程建模为MDP，用经典策略梯度RL（对应LLM的PPO-RLHF）

RLHF典型上包含训练奖励模型和通过强化学习优化策略两个阶段。此前的工作把扩散过程重新表述为马尔可夫决策过程（MDP），DDPO和DPOK在最终时间步计算奖励并应用策略梯度方法来微调模型。具体做法：把"每一步去噪"看作MDP里的一个动作，整条去噪轨迹的最终图像获得一个reward，然后用REINFORCE/PPO类似的方式做策略梯度更新，同时加KL惩罚防止偏离原模型太远——这和InstructGPT的PPO-RLHF在形式上几乎一模一样。

**问题**：策略梯度方法如DDPO以高方差和不稳定著称，尤其在大规模场景下。为此PRDP提出改进：Deng等人提出了Proximal Reward Difference Prediction（PRDP），将RL目标重新表述为更稳定的监督式奖励差预测任务，不直接估计策略梯度，而是训练模型预测两张生成图像间的奖励差，并证明一个能完美预测这个差值的模型能有效地最大化原始RL目标。

#### 4.2 路线B：直接反传Reward梯度（LLM做不到，扩散模型的"特权"）

这是最能体现"扩散生成过程可微"这一特性的技术路线。许多reward model是可微的，比如ImageReward、PickScore、HPSv2，能提供解析梯度；这种情况下用RL反而会丢弃reward model里有价值的信息，因此有人提出让reward梯度端到端反传到扩散模型参数。

- **ReFL**：ReFL首次通过对某个随机选取时间步的一步预测图像 $r(c,\hat x_0)$ 评估奖励来反传梯度，从而绕开了完整去噪过程，是ImageReward提出的一种微调方法，把梯度回传限制在最后一个扩散步以降低计算成本。
- **AlignProp / DRaFT**：AlignProp和DRaFT则是在最终迭代去噪得到的图像 $x_0$ 上评估奖励。AlignProp通过对去噪过程进行端到端的奖励梯度反向传播，将扩散模型与下游奖励函数对齐。效果上，AlignProp的训练速度比DDPO快约25倍，例如在HPS v2数据集上AlignProp仅用48分钟就达到2.8分，而DDPO需要约23小时。为控制显存，会用LoRA和梯度检查点等技术降低内存开销。
- **DRTune**：为解决反传多步梯度的"深度-效率困境"，Deep Reward Tuning通过停止去噪网络输入端的梯度、只在部分选定步骤上训练，实现更高效的深度监督。
- **视频领域的延伸**：VADER把这一思路用在了视频扩散模型上；T2V-Turbo把reward梯度同时反传经过reward model和解码器，并把梯度应用在蒸馏出的一致性模型（一步生成）上，以避免对多步扩散模型做多步反传。

这条路线本质上是"可微RLHF"，只有当生成过程本身可微时才成立——这正是flow matching模型（ODE积分完全可微）天然适合的场景，也是LLM（离散token采样不可微）无法直接复制的能力。

#### 4.3 路线C：Direct Preference Optimization（DPO）系——扩散版的"跳过RM和RL"

和LLM里DPO的动机完全一致：RLHF的一个显著缺点是RL优化步骤（如PPO）需要大量计算资源，为解决这个问题，DPO提出绕过奖励建模阶段、无需强化学习。

推导上，DPO把最优策略重参数化为 $p_\theta^*(x_0|c)\propto p_{\theta_0}(x_0|c)\exp(r(c,x_0)/\beta)$，代入Bradley-Terry似然后消去显式的reward函数，得到DPO损失，这样就隐式优化了reward同时保持策略接近参考分布$p_{\theta_0}$，避免了显式奖励建模和RL的不稳定性。

扩散模型的核心难点在于：**图像 $x_0$ 的似然不是直接可算的**（不像LLM的token序列有精确的log概率），需要借助ELBO来近似：

- **Diffusion-DPO**：对于扩散模型，挑战在于如何定义生成图像 $x_0$ 上的似然；Diffusion-DPO通过利用扩散过程的证据下界（ELBO）来扩展DPO。Wallace等人研究了文生图扩散模型中的人类偏好学习，提出Diffusion-DPO，通过引入证据下界重新表述目标函数，实现可微且高效的优化过程。
- **一系列变体**：在时序奖励DPO方面，有工作从密集奖励视角引入DPO式目标中的时间折扣，优先考虑生成过程早期步骤以提升对齐效率；PRDP把RLHF重新表述为一个监督回归任务，允许在大规模prompt数据集上稳定微调，针对文本提示选取两个候选图像，训练扩散模型基于其去噪轨迹预测二者的奖励差；Liang等人提出了step-aware DPO；Inversion-DPO、BalancedDPO等则分别在如何精确计算轨迹似然、如何平衡多指标偏好上做改进。

#### 4.4 路线D（2025最新主流）：GRPO化——把LLM推理模型的"神器"搬进扩散/流匹配

这是当前最活跃的方向，直接把LLM推理模型（如DeepSeek-R1）用的GRPO搬到了图像/视频生成模型上。广泛使用的RLHF算法包括DDPO和GRPO变体（FlowGRPO、DanceGRPO、MixGRPO），DDPO通过把去噪过程建模为马尔可夫决策过程直接优化人类偏好奖励，GRPO变体则使用组相对优势（group-relative advantages）。

**Flow-GRPO是这条线的开创性工作，核心解决了一个关键矛盾**：flow matching的标准采样是**确定性ODE**，而RL探索需要**随机性**。Flow-GRPO首次把在线策略梯度强化学习整合进flow matching模型，核心是两个策略：(1) ODE-to-SDE转换，把确定性ODE转换成一个在所有时间步都匹配原模型边缘分布的等价随机微分方程（SDE），从而使统计采样成为可能，支持RL探索；(2) Denoising Reduction策略，在保留原始推理步数的同时减少训练时的去噪步数，显著提升采样效率而不牺牲性能。效果非常显著：在组合式生成任务上，RL微调后的SD3.5-M生成的物体计数、空间关系和细粒度属性几乎完美，GenEval准确率从63%提升到95%；在视觉文字渲染上，准确率从59%提升到92%，而且取得了实质性的人类偏好对齐提升，且几乎没有发生reward hacking。

后续一大批改进工作紧随而来（这块进展速度很快，2025下半年密集涌现）：
- FlowGRPO首先通过一种较为粗糙的基于轨迹的似然估计方式把GRPO适配到扩散模型，在文生图上取得不错效果，随后一系列工作对其进行改进；
- 有工作从距离优化的视角重新解释已有的基于SDE的GRPO方法，揭示其本质是一种对比学习形式，并提出Neighbor GRPO，完全绕开对SDE的需求；
- TempFlow-GRPO捕捉并利用flow-based生成中固有的时间结构，在人类偏好对齐和文生图基准上取得了SOTA性能；
- Smart-GRPO是首个针对flow-matching模型优化噪声扰动的强化学习方法，通过迭代搜索策略解码候选扰动、用奖励函数评估并将噪声分布向高奖励区域调整；
- Coefficients-Preserving Sampling（CPS）借鉴DDIM重新表述采样过程，为Flow-GRPO、Dance-GRPO等基于RL的优化器实现更快、更稳定的收敛。

**LLM RL框架不能直接照搬的原因**：GRPO类方法原本为LLM后训练设计，因为LLM文本生成过程不可微，policy gradient成为这些方法的基础，这不可避免地带来相当程度的随机性和方差；而flow matching模型和LLM的本质区别在于，前者的采样过程是连续可微的，后者是离散生成的，这个差异使得reward梯度可以流经整个生成轨迹——即为了提升reward，可以沿着中间图像latent反向传播reward梯度，并通过链式法则更新模型权重。这也解释了为什么diffusion/flow matching后训练能同时享有"policy gradient类方法"（更通用，reward不必可微）和"direct-gradient类方法"（更高效，但要求reward可微）两条路，而LLM基本只能走前者。

**其他值得了解的分支**：
- **DiffusionNFT**：在另一条线上，DiffusionNFT把negative-finetuning（NFT）适配到扩散和流模型上。
- **DPPO**：DPPO把PPO应用到扩散策略上，用于连续控制和机器人操作任务，证明了对policy-gradient方法进行细致适配可以在扩散框架下取得优异性能——说明这套后训练技术已经溢出到了具身智能/机器人领域。
- **Adjoint Matching（最优控制视角）**：Adjoint Matching把reward微调建模为随机最优控制问题，提出无记忆的flow matching方法以确保微调后的模型收敛到目标（tilted）分布，这是一条更理论化、把reward fine-tuning和最优控制理论联系起来的路线，特别适合flow matching模型。
- **LeapAlign等新工作**：研究如何让flow matching模型在任意生成步数下都能对齐人类偏好，通过构建两步轨迹（two-step trajectories）来解决GRPO类方法方差大、direct-gradient类方法需要多步反传的问题。

---

### 5. Flow Matching后训练的特殊性总结

把上面内容提炼一下，flow matching相比标准diffusion在后训练上有两个关键特性：

1. **确定性ODE ⇒ 探索能力差**：必须先做ODE-to-SDE转换引入随机性，才能像DDPM那样自然地支持policy gradient/GRPO探索（Flow-GRPO的核心贡献）。经典的DDPM方案作为score-based反向SDE的离散化，允许轨迹多样性和RLHF训练中丰富的探索；确定性的DDIM采样器则遵循概率流ODE，便于推理；训练时的高随机性对于有效探索奖励地形至关重要，但推理时更偏好确定性ODE采样以保证一致性和计算效率。
2. **连续可微 ⇒ 可以做"可微RLHF"**：direct-gradient方法（ReFL/DRaFT/AlignProp/DRTune及Adjoint Matching）能够绕开策略梯度的高方差问题，直接沿生成轨迹反传reward梯度，这是LLM离散token采样无法做到的。

---

### 6. 第四阶段：蒸馏/加速——扩散模型独有的重要后训练环节

LLM的"推理加速后训练"主要是量化、剪枝、投机解码，模型的生成步数本身不变（自回归一步一个token是刚性的）。但diffusion/flow matching的推理成本主要来自"多步迭代去噪/积分"，所以有一整套把"多步教师模型"蒸馏成"少步/一步学生模型"的后训练技术，这在LLM里几乎没有直接对应物：

- **一致性蒸馏（Consistency Distillation, CM/LCM）**：提出一阶段引导蒸馏方法，通过求解一个增强的概率流ODE，高效地把预训练的引导扩散模型转换成潜在一致性模型，把引导反向扩散过程看作求解一个增强概率流ODE，LCM直接在latent space预测其解，实现少步的超快推理。
- **分布匹配蒸馏（DMD/DMD2）**：DMD聚焦于匹配输出分布而非具体轨迹，去掉了回归损失，并实现了双时间尺度更新规则以显著提升训练稳定性；DMD优化生成器使得学生分布加噪后与数据分布加噪后的KL散度最小，通过对应的梯度更新生成器。
- **对抗蒸馏（ADD/LADD）**：Progressive Adversarial Diffusion Distillation采用分阶段训练和专门的latent空间判别器，提供针对1-8步推理优化的checkpoint，兼顾质量与模式覆盖。
- **蒸馏后仍可继续做偏好对齐**：值得注意的是，蒸馏和RLHF/reward微调并不互斥，可以叠加使用——例如T2V-Turbo、DOLLAR等工作，在ReFL通过一步预测$x_0$反传reward梯度、DRaFT-K把反传截断到最后K步的基础上直接在蒸馏后的少步/一步生成器上继续做reward微调，兼顾速度与质量对齐。
- **蒸馏模型的持续学习难题**：值得一提的是，虽然大量工作致力于在减少推理步数的同时保证生成内容质量，但对这些蒸馏模型继续微调时如何保持其少步推理能力仍是一个挑战，这催生了on-policy self-distillation等新方法，本质上是"如何在后训练阶段不破坏前一阶段后训练成果"的元问题——这和LLM里"RLHF之后再SFT容易灾难性遗忘对齐效果"是同一类问题。

---

### 7. 第五阶段：安全对齐类后训练（简述）

与LLM的safety RLHF/red teaming/拒答训练类似，扩散模型也有一整套"负向对齐"技术，用于擦除NSFW内容、擦除特定版权风格/人物概念、防止有害生成，通常通过在负样本/擦除目标上做定向的梯度下降（让模型"忘记"某个概念在特定prompt下的条件分布），或者在RLHF阶段把"安全性"作为reward的一个分量与美学、对齐度一起联合优化（类似BalancedDPO这种多指标平衡的思路）。这一块方法论上更贴近"负向微调"而非"正向对齐"，机制上和上面DPO/GRPO框架是共享的，只是reward/偏好数据换成了安全性标注。

---

### 8. 落地实践：一个后训练pipeline该怎么搭

结合上面的方法论，实践中一个典型的现代文生图/文生视频后训练流程大致是：

1. **基座**：一个预训练好的diffusion或flow matching模型（如SD3.5、FLUX）。
2. **数据/SFT**：如果要做垂类/风格定制，先用LoRA/DreamBooth在目标数据上做SFT。
3. **Reward准备**：根据任务选reward——通用美学/图文对齐用ImageReward/PickScore/HPSv2；组合式生成/文字渲染用GenEval/OCR等程序化reward；也可以多reward加权（拼接成BalancedDPO那种多指标方案）。
4. **选择对齐路线**：
   - reward可微且想要训练效率最高 → 走ReFL/DRaFT/AlignProp类direct-gradient方法，注意用LoRA+gradient checkpointing+截断反传步数控制显存；
   - 有大量偏好对但不想训练RM/不想上RL → 走Diffusion-DPO及变体；
   - 想要最强的对齐效果、reward可以不可微、能接受在线rollout开销 → 走GRPO类方法（Flow-GRPO/DanceGRPO/TempFlow-GRPO等），对flow matching模型记得先做ODE-to-SDE转换；
   - 要机器人/连续控制类任务 → 参考DPPO。
5. **加速**：如果需要少步推理，在对齐完成后（或对齐前，看具体pipeline）做一致性蒸馏/DMD/对抗蒸馏，必要时结合reward微调联合训练（如T2V-Turbo），并注意用self-distillation等手段保留少步推理能力。
6. **监控reward hacking**：RLHF训练可能出现不稳定的轨迹、较长的推理时间，并容易受到reward hacking的影响，务必保留KL正则、定期人工/多样化reward交叉验证，防止模型"钻空子"把reward刷高但视觉质量/多样性变差。

---

### 9. 一张图总结全景

```
预训练(Diffusion/Flow Matching基座)
        │
        ├─ SFT类：LoRA/DreamBooth/ControlNet/像素空间微调/LCF   ——领域&风格适配
        │
        ├─ Reward Model：ImageReward/PickScore/HPSv2/GenEval等  ——量化"好坏"
        │
        ├─ 对齐三路线（可组合）
        │     ├─ A. MDP+PPO类：DDPO/DPOK/PRDP           （类比LLM PPO-RLHF）
        │     ├─ B. Reward梯度直接反传：ReFL/DRaFT/AlignProp/DRTune/Adjoint Matching  （扩散/FM专属，因可微）
        │     ├─ C. Direct Preference：Diffusion-DPO及变体   （类比LLM DPO）
        │     └─ D. GRPO化在线RL：Flow-GRPO/DanceGRPO/MixGRPO/TempFlow-GRPO/CPS…（2025最新主流）
        │
        ├─ 蒸馏加速：一致性蒸馏(CM/LCM)/DMD/DMD2/对抗蒸馏(ADD/LADD)  （扩散专属加速后训练）
        │
        └─ 安全对齐：概念擦除/负向微调/多目标平衡（BalancedDPO类）
```

这套体系和LLM后训练最大的不同就在于：**因为生成过程是连续、多步、可微的**，diffusion/flow matching多出了一整条"直接反传reward梯度"的高效路线，以及一整套"多步蒸馏成少步"的加速后训练；而**因为flow matching的采样默认是确定性ODE**，做policy gradient/GRPO类探索之前，往往需要先把ODE转换成等价的SDE引入随机性，这是2025年这个方向最核心的技术突破点（Flow-GRPO及其一系列后续工作）。理解了这两点差异，你就能把LLM后训练的全部直觉几乎无缝迁移到diffusion/flow matching模型上了。
