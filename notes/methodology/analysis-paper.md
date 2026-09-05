---
title: "分析类论文如何做得有趣"
date: 2026-09-03
category: "研究方法论"
tags:
  - "分析类论文"
  - "论文写作"
  - "novelty"
description: "常用手段：空白图、零样本、零模型测试；对CoT临时更换、拼接；切断knock out来识别贡献，穷举变量式切断形成消融；对比，比较，Model Diffing（比较模型前后的表征差异）；合成环境进行受控测试，toy问题、原子问题进行分析（From f(x) and g(x) to f(g(x))……"
---

# 分析类论文如何做得有趣

- **新颖**：此前没人公开报告过；
    
- **惊讶**：事前概率低；
    
- **有价值**：可信以后会改变知识或行动。

- **荒诞**：正常人不会去尝试的方法，认为不符合一般直觉和常理的方法；诸如pass@128，RLVR主动干扰奖励

常用手段：空白图、零样本、零模型测试；对CoT临时更换、拼接；切断knock out来识别贡献，穷举变量式切断形成消融；对比，比较，Model Diffing（比较模型前后的表征差异）；合成环境进行受控测试，toy问题、原子问题进行分析（From f(x) and g(x) to f(g(x)): LLMs Learn New Skills in RL by Composing Old Ones）；与其自己解释，直接让模型自己解释，自己处理自己生成的内容（《What Characterizes Effective Reasoning?Revisiting Length, Review, and Structure of Co》研究者直接向模型（具体使用的是关闭了思考模式的 Claude 3.7 Sonnet）发送提示词（Prompt），要求其将思维链（CoT）转换为 Graphviz DOT 格式的代码）；steering vector处理推理时的麻烦；颠倒顺序；修改或者探讨术语定义；算法的性能比较，要进行分解，收敛速度与能力上限；反差，不忠实，模型说了不等于做了；加强技术和理论难度，比如深入更加细粒度的分析、更加底层几何的分析；合成数据，属性分解；反向说，反其道而行之；随机化，错误标签。
变量：模型规模，模型架构，模型训练方式，CoT长度，题目难度
## 一些问题方式
排列组合需要学习一些有趣的句式作为粘合方式
尽可能提更为具体的问题更好入手：为什么同样是进行VLM CoT这个课题，我问的问题是“为什么CoT会导致VLM在视觉空间推理任务上性能降低的分析类研究、分析得出推理动态的表征后可以做training-free的干预”“CoT是如何影响VLM处理视觉信息的”，我自己思考得举步维艰；而别人问的问题是“VLM CoT会不会主动回看图像、是什么驱使它回看图像，VLM CoT何时应该看图、也就是在推理动态表现出怎样的指标的时候应该看图呢”，就更好做呢？难道我前者的问题真的做不下去或者有问题吗，明明它们两个是同一领域甚至意义指向性都差不多的，无非是两种so what——要么是预判区分哪些题不需要开CoT也能答对，从而节省资源（这一块应该也有不少文献在做吧）；要么是不开CoT答不对的开了CoT原本没增益或者退化，我们用推理时即插即用的方法让它终于起到增益的作用。其实是两种流派，提抽象的问题只明确了领域、需要更多自下而上的部分、要详细研究case study进行探索和揣测，而提具象的部分则是基于了更为具体的现象、借助了经验中常见的行为和观测变量作为中间核心的机制变量、从而可以直接自上而下设计实验进行验证阶段、但是问题在于假说不一定成立。
对具体行为提为什么，尤其是这个为什么大家都采用了治标不治本的方式没有深入，《Wait, Wait, Wait... Why Do Reasoning Models Loop?》（大家想到的都是设置温度）
模型在训练中为何学到了这种方式而不是别的方式甚至更符合直觉的方式，比如模型学习了小领域有害数据后为何学到了全局坏人格而非局部坏人格，模型为何先学到了低频成分再学到高频成分
为什么有些问题对模型非常困难，《Why Is Spatial Reasoning Hard for VLMs? An Attention Mechanism Perspective on Focus Areas》
模型凭什么方法做到了这项能力、有没有被hack掉，《Vision Transformers Need More Than Registers》说VIT分类全靠看背景
模型在训练中到底学到了什么，训练改变了模型怎样的属性，将训练前与训练后的对比融合机制可解释
有些技术是否必要，是否有增益，技术能够增加什么不能够增加什么，探讨技术的能力边界（《Revisiting the Necessity of Lengthy Chain-of-Thought in Vision-centric Reasoning Generalization》）；
技术增益与否的原因是什么，xx的原因就是A不是B。其在视觉任务上的收益并不均匀：一些研究报道了显式中间推理带来的增益，而另一些则在感知密集的视觉问答任务中发现增益有限甚至下降。CoT对VLM性能贡献的机制究竟是什么？在我们研究的范围内，CoT收益并非来自扩展直接图像标记访问。但它们尚未说明在给定任务上CoT收益是否存在由什么决定（负贡献不够反直觉，所以必须要加上正贡献）；如果以前实验消融不充分，就更有可乘之机，《The Curriculum Is the Mechanism: Dissecting COCONUT's Latent Thought Gains on ProsQA》Coconut 的收益里相当一部分来自这个多阶段训练本身，而不是 latent thought 的表达能力——把 latent thought 换成无意义的 pause token、保留同样的 curriculum，性能也掉不了太多
怎样的训练方式更好，训练方式的比较，类似消融实验《Inference Scaling Laws: An Empirical Analysis of Compute-Optimal Inference for LLM Problem-Solving》（比较不同CoT推理算法在大小模型上的表现）
算法数学上的分类，算法可能隐含比表面更丰富的结构，《GRPO is Secretly a Process Reward Model》，《Your Language Model is Secretly a Q-function》（DPO隐含Q函数），《Your Language Model is Secretly a Reward Model》（DPO）
有些操作达成目的后可能会有意外的副作用，顾此失彼，A技术是否能在B操作下幸存，比如模型编辑之后有时会增加幻觉率、模型合并会意外破坏某些模型能力、RLVR使用后模型会增加泄露预训练学到的隐私信息的可能性《Reinforcement Learning on Benign Facts Amplifies Leakage of Memorized Private Data》
xx未必xx，我们原以为进行A就等同于进行B，但实际上二者并无关联。对齐输出未必对齐表征，《Logit Distance Bounds Representational Similarity》
颠覆以往的归因，幂律可能不来自数据，而来自softmax加交叉熵这套输出头本身《Universal One-third Time Scaling in Learning Peaked Distributions》
对比异同，《Same task, different circuits: disentangling modality-specific mechanisms in VLMs》
算一算trade off账单，提醒不要过火、三角权衡有上限，《Hallucinations Undermine Trust; Metacognition is a Way Forward》
建立联系，《Can vision transformers perform convolution?》
负贡献如果可以描述一个痛点或者困局也是可以的，《Safety Subspaces are Not Linearly Distinct: A Fine-Tuning Case Study》
某些能力是哪个阶段学会的，《Persona Features Control Emergent Misalignment》（LLM在预训练阶段已经学会了各种"人格"（personas），包括有毒的、讽刺的、邪恶的。窄域微调并非"教会"模型新行为，而是"唤醒"了这些已存在的人格表征。 一旦有毒人格被激活，模型就在所有领域表现出一致的恶意——因为人格是跨域一致的。）
机制可解释方面，信息在哪里储存，例如，“聊天模型是否在<end_of_turn>特殊标记中存储了关于用户提示的汇总信息？”
## 如何让人惊讶
反其道而行之：《The Surprising Effectiveness of Negative Reinforcement in LLM Reasoning》研究发现，在RLVR训练中，**单纯惩罚错误答案（负向强化），效果竟然可能优于或持平于强化正确答案（正向强化）**，这与“做对了就给糖吃”的主流认知完全相反。
随机化：《Spurious Rewards: Rethinking Training Signals in RLVR》研究发现，即使用**随机甚至错误**的奖励信号进行RLVR训练，也能在某些模型上显著提升数学推理能力。
## 分析类也能有模板？！
[Renfei Zhang | OpenReview](https://openreview.net/profile?id=~Renfei_Zhang2)
《Reinforcement Learning Improves Traversal of Hierarchical Knowledge in LLMs》这篇是说RL增益的根本原因是什么，这种比较困难，因为命题比较大所以要跨领域跨模型做很多实验，而且这一块有很多人探究过，要跟前人工作区分开来、不大新鲜，证明不是来自于其他原因是非常困难的、因为RL这个process涉及的能力改变非常复杂，所以想要证无就要收紧一些口径、不要制造过多的可能，参见《LLMs Get Lost In Multi-Turn Conversation》。与其努力证明“不是其他原因”，不如提出一个**可被清晰定义和验证的新机制**。**将现象“解构”而非仅“报告”**：将一个大的现象（性能下降）拆解成更细粒度的、可解释的组成部分（能力 vs. 可靠性）能让你的归因论证更有层次感和说服力。
《Reinforcement Learning on Benign Facts Amplifies Leakage of Memorized Private Data》这篇是说RL对安全问题的副作用，类似于那种涌现性不对齐的口吻，这种一般好做一些，因为副作用通常而言前人没有注意到过、天然有反直觉之感，而且安全问题只要存在就有问题、不需要大规模实验，这也就是证有不证无。
## 常青树领域
争议领域：RL能不能增长模型的能力？
不可能三角，trade off：对齐，efficiency
## 实验设计
《Are VLMs Seeing or Just Saying? Uncovering the Illusion of Visual Re-examination》：构建长相类似但是细节不同导致答案不同的AB图对，让模型在A图下生成完毕，然后拼接更换为B图+A图答案+反思语句，还有就是新启一轮然后用户要求再看看图片。
## 包装手法
### 信息论
VA-IB 是 V-Skip 的理论核心，它将多模态 CoT 压缩任务重新表述为一个信息论优化问题。传统的文本压缩仅关注语言层面的冗余，而 VA-IB 引入了视觉约束，要求压缩后的推理链 $\hat{C}$ 必须同时满足两个条件：
*   **充分性（Sufficiency）：** 保留足够的语义信息以预测正确答案 $A$，即最大化互信息 $I(\hat{C}; A)$。
*   **锚定性/接地性（Anchoring/Grounding）：** 保持与视觉输入 $V$ 的高度依赖关系，以防止幻觉，即最大化条件互信息 $I(\hat{C}; V | Q)$。
### 心理学
在训练时，人类常依赖显式推理来理解原理，而在执行时则专注于动作，无需有意识地回想那些原理，正如司机在驾驶时不再复述交通规则。类似地，Aux-Think 在训练时将 CoT 作为一种辅助信号，引导模型内化推理模式。在测试时，模型不再生成显式推理，而是基于训练时内化的推理直接预测动作。这种学习与执行之间的分离改善了决策专注度，减少了测试开销与幻觉，并带来更准确、更稳定的导航。
VLA不开thinking不会反思，开了之后不就会反事实和反思了吗
## 技术性贡献
提出可测量的新指标或者新的机制解释方法
## 如何让“有趣”成为可测量的研究属性

> 有趣的研究，不只是发现一个反常现象，而是用可信证据，对共同体某个高杠杆信念造成非预期更新，并用更短的机制解释多个现象、产生新预测或改变实践。

这里有三个不同问题：

1. **“有趣的结果”是什么**：结果出来后，对既有认知产生了多大更新。
2. **“值得研究的课题”是什么**：实验开始前，它的期望信息价值有多高。
3. **“有复利的研究方向”是什么**：每篇论文是否沉淀出下一篇可以复用的测量、干预、数据和理论资产。

把这三者混在一起，就容易陷入“不断扫模型、扫数据集，等异常现象掉下来”的模式。


### 二、“有趣的结果”和“好课题”不是同一个概念

结果是否惊讶，只有实验后才知道。若选题必须依赖得到某个幸运的反常结果，就仍然是在赌。

实验前应该最大化的是高价值信念上的期望信息价值：

$$
Q(e) = \frac{ \mathbb{E}_{y \sim P(y|e)} [\text{BeliefUpdateValue}(y)] \times \text{Reliability}(e) \times \text{Reuse}(e) }{ \text{Cost}(e) + \text{Delay}(e) }
$$

一个优质课题最好具有“双向价值”：

- 如果结果 A 发生，会推翻一个重要信念；
- 如果结果 B 发生，会给该信念提供此前缺少的强证据；
- 无论哪种结果，都能排除一批机制。

这比“只有出现异常才有论文”稳健得多。

一个很实用的自检问题是：

> 如果实验得到完全相反的结果，这个问题还值得写吗？

如果答案是否定的，往往意味着选题依赖结果筛选和事后叙事。

---

### 三、顶会高质量分析论文究竟做对了什么

下面选择几篇明确获奖的论文，以及几篇已经成为分析研究方法论范本的顶会论文。重点不是模仿题目，而是抽取“认知更新是如何被制造出来的”。

#### 1. Understanding Deep Learning Requires Rethinking Generalization

Zhang et al.，ICLR 2017 Best Paper  
论文：https://openreview.net/forum?id=Sy8gdB9xx

##### 原有承重信念

深度网络能够泛化，大概因为：

- 网络的有效容量没有参数量看起来那么大；
- 正则化限制了它能拟合的函数；
- SGD 只能找到某类“简单”解。

由此隐含预测：如果标签完全随机，网络应当难以拟合。

##### 决定性实验

作者没有立即提出复杂理论，而是做了几种极其简单的随机化实验：

- 保留输入，随机打乱标签；
- 改变输入结构；
- 移除显式正则化；
- 检查网络能否把随机数据训练到接近零误差。

结果是：现代过参数化网络可以轻易记住随机标签。

##### 真正的技术杠杆

不是“训练了几个模型”，而是构造了一个反事实：

$$
\text{输入和架构近似不变，仅破坏输入—标签规律}
$$

这样就把“拟合真实规律”和“纯粹记忆”分离开了。

##### 为什么有趣

它没有直接解决泛化，而是证明当时许多解释没有触及核心矛盾：

> 模型同时具有几乎无限的记忆能力，却能在真实数据上表现出良好泛化。

这是“提出更精确的问题”本身成为贡献。

##### 可复用结构

$$
\text{共同信念} \Rightarrow \text{隐含预测} \Rightarrow \text{最小破坏实验} \Rightarrow \text{预测失败} \Rightarrow \text{理论议程重置}
$$

这类论文特别适合寻找领域中“被所有人使用，却没有被直接验证”的前提。

---

#### 2. The Lottery Ticket Hypothesis

Frankle & Carbin，ICLR 2019 Best Paper  
论文：https://openreview.net/forum?id=rJl-b3RcF7

##### 原有信念

网络剪枝通常被理解为：

> 先训练得到好权重，再把不重要的连接去掉。

稀疏网络似乎只是训练后压缩的产物。

##### 核心实验

基本流程是：

1. 初始化稠密网络 (\theta_0)；
2. 完整训练；
3. 按权重大小剪枝得到掩码 (m)；
4. 将保留权重重置回原始初始化 (m \odot \theta_0)；
5. 单独训练这个稀疏子网络。

结果显示，某些稀疏子网络从原始初始化出发，也能达到完整网络的性能。

##### 技术本质

这是一个因素解耦实验。它区分了：

- 稀疏拓扑；
- 原始初始化；
- 训练后权重；
- 随机重新初始化。

它把“剪枝后的好性能”从一个相关性观察，变成了有关初始化和可训练性的反事实问题。

##### 为什么有趣

它完成了一次概念反转：

> 稀疏结构不一定只是训练的终点，它可能在训练开始时就以某种形式存在。

“Lottery Ticket”这个名字也把复杂结论压缩成了可传播的认知对象。

##### 局限同样重要

原始结果不能自动推出：

- 所有大规模模型中都存在同样的彩票；
- 彩票机制已经被解释；
- 可以在训练前高效找到它。

好的分析论文通常提出一个准确的存在性结论，而不是把有趣隐喻夸大成普遍理论。

---

#### 3. CheckList: Beyond Accuracy

Ribeiro et al.，ACL 2020 Best Paper  
论文：https://aclanthology.org/2020.acl-main.442/

##### 原有信念

NLP 模型的进步主要通过测试集上的单个聚合指标衡量，例如准确率或 F1。

但测试集分数没有明确说明模型应当具备哪些行为。

##### 核心技术

CheckList 把软件测试思想引入模型评测，构造了二维测试体系。

测试类型包括：

- MFT：最小功能测试；
- INV：语义不应变化时，预测是否保持不变；
- DIR：进行有方向的变化后，预测是否按预期变化。

另一维是能力类型，如否定、词汇、实体、时序、公平性和鲁棒性。

这形成了“能力 × 测试类型”的矩阵，而不是另造一个总分。

##### 为什么有趣

论文的真正贡献不是发现某几个模型会犯错，而是改变了“什么叫完成评测”：

> 评测不应只是抽样估计平均性能，还应当表达行为规格。

它把零散的错误分析变成可复用的测试语言和工具链。

##### 复利来源

这类论文沉淀的是“认识工具”：

- 测试分类体系；
- 模板和扰动生成器；
- 行为规范；
- 可扩展的软件工具。

下一篇论文不用重新寻找现象，只需要扩展能力轴、模型轴或干预轴。

---

#### 4. Dataset Cartography

Swayamdipta et al.，EMNLP 2020 Best Long Paper  
论文：https://aclanthology.org/2020.emnlp-main.746/

##### 原有做法

数据分析通常使用静态属性：

- 标签频率；
- 长度；
- 词汇；
- 人工难度；
- 最终损失。

##### 核心想法

作者把每个训练样本在整个训练过程中的动态作为坐标。对样本 (i)，记录多个 epoch 中正确标签的置信度：

$$
\mu_i = \frac{1}{T} \sum_t p_{\theta_t}(y_i|x_i)
$$

以及波动：

$$
\sigma_i = \sqrt{ \frac{1}{T} \sum_t (p_{\theta_t}(y_i|x_i) - \mu_i)^2 }
$$

据此将样本区分为：

- easy-to-learn：高置信、低波动；
- ambiguous：高波动；
- hard-to-learn：低置信、低波动。

然后进一步检验：用不同区域的数据训练，对域内和域外泛化有什么影响。

##### 为什么有趣

它发现训练过程不是消耗品，而是一台测量仪器：

> 模型如何学习一个样本，本身就是样本属性的一部分。

这比“某些样本更难”强得多，因为它提供了坐标系、估计量和可操作的数据选择方法。

##### 技术结构

$$
\text{静态终点} \rightarrow \text{训练轨迹} \rightarrow \text{低维坐标} \rightarrow \text{样本类型} \rightarrow \text{数据干预} \rightarrow \text{泛化变化}
$$

这体现了高质量分析论文的一个重要模式：从“描述现象”升级为“创造新的观测空间”。

---

#### 5. Are Emergent Abilities of Large Language Models a Mirage?

Schaeffer et al.，NeurIPS 2023 Outstanding Paper  
论文：https://arxiv.org/abs/2304.15004

##### 原有叙事

随着模型规模增长，某些能力似乎突然从接近零跃迁到很高，由此产生“不可预测的能力涌现”叙事。

##### 核心诊断

作者区分了两个东西：

1. 模型底层能力是否连续变化；
2. 评测指标是否连续地反映能力。

例如，精确匹配是离散的：

- 一串输出只有完全正确才记 1 分；
- 从“错很多”到“只错一个 token”，仍然都是 0；
- 当连续改善跨过阈值时，曲线突然跳升。

使用编辑距离、概率分数或其他更连续指标时，一些所谓“涌现”会变得平滑。

作者还通过模拟说明：平滑的潜在能力经过非线性或阈值化指标，也能产生表面的相变。

##### 为什么有趣

它攻击的不是某一个任务，而是研究者解释曲线的方式：

$$
\text{观察到指标跳变} \not\Rightarrow \text{底层机制发生相变}
$$

这会改变规模预测、风险讨论和实验设计，因此中心性极高。

##### 必须保留的边界

该论文不能证明“所有涌现都是幻觉”。它证明的是：

> 某些观察到的涌现，单凭当前指标不足以建立机制性相变结论。

这是测量理论论文最应避免的夸张。

---

#### 6. Sanity Checks for Saliency Maps

Adebayo et al.，NeurIPS 2018  
论文：https://arxiv.org/abs/1810.03292

##### 原有信念

显著性图看起来聚焦于物体边缘或关键区域，因此似乎解释了模型学到了什么。

##### 核心实验

作者引入类似生物实验中的负对照：

- 逐层随机化模型参数；
- 随机化数据标签并重新训练；
- 检查显著性图是否发生相应改变。

某些解释方法在模型已经丧失原有功能时，仍然生成视觉上相似的图。

##### 决定性洞见

“看起来合理”不是解释有效性的证据。显著性图可能主要反映：

- 输入本身的边缘结构；
- 网络架构先验；
- 可视化方法的平滑特性；

而不是模型实际学到的决策机制。

##### 方法论价值

它创造了一条普遍原则：

> 在解释一个测量结果之前，先证明测量仪器能够区分有语义的模型和随机模型。

这可以迁移到探针、归因、神经元解释、概念激活和 LLM mechanistic interpretability。

---

#### 7. HANS：Right for the Wrong Reasons

McCoy et al.，ACL 2019  
论文：https://aclanthology.org/P19-1334/

##### 原有信念

NLI 模型在标准测试集上取得高准确率，意味着模型学会了某种句法推理。

##### 假设驱动的挑战集

作者没有随机收集“困难样本”，而是先提出三种具体启发式：

- lexical overlap：词重叠多就预测蕴含；
- subsequence：假设句是前提句子序列就预测蕴含；
- constituent：假设句是前提的句法成分就预测蕴含。

然后专门构造：

- 启发式恰好正确的例子；
- 启发式明确错误的最小反例。

模型在普通测试集表现很好，却在反启发式样本上系统失败。

##### 为什么比普通 error analysis 强

因为它不是从错误中事后归类，而是：

$$
\text{先提出机制} \rightarrow \text{推导失败模式} \rightarrow \text{构造区分性样本} \rightarrow \text{验证预测}
$$

这是一个弱因果但强预测的机制测试。

---

### 四、这些论文背后的共用“技术栈”

高水平分析论文通常没有更复杂的模型，却有更严格的认识论技术。

#### 1. 最小反事实

只改变一个关键因素，其他因素尽量保持不变：

- 真实标签 vs 随机标签；
- 原始初始化 vs 随机重新初始化；
- 形状线索 vs 纹理线索；
- 正常样本 vs 只破坏启发式的样本；
- 连续指标 vs 阈值化指标。

很多“惊讶感”其实来自干净的识别，而不是夸张的效果量。

#### 2. 负对照

问一个方法在“不应产生有意义结果”的条件下是否仍然表现得很漂亮：

- 随机模型还能否生成合理解释；
- 随机标签还能否被拟合；
- 无关扰动是否改变指标；
- 假机制能否同样解释结果。

负对照尤其适合分析当前流行、但缺少效度验证的工具。

#### 3. 打破自然数据中的相关性

自然数据里很多变量一起变化：

- 纹理和形状；
- 长度和难度；
- 模型规模和训练数据；
- benchmark 分数和数据污染；
- 推理长度和计算量；
- 表述方式和语义。

高质量分析通过 2×2 设计、合成数据或反事实生成，将它们正交化。

#### 4. 从终点转向动态

只看最终准确率会丢掉大量信息。可以研究：

- 样本置信度轨迹；
- 表征形成的时间；
- 答案在推理过程中何时确定、何时翻转；
- 不同能力随规模增长的轨迹；
- 参数、梯度、注意力或激活的演化。

动态经常能把“难度”分解成完全不同的机制。

#### 5. 从相关解释升级到干预和恢复

证据强度大致可以分成：

1. 可视化案例；
2. 稳定相关模式；
3. 匹配对照；
4. 对候选机制进行干预；
5. 干预后现象消失；
6. 反向干预后现象恢复；
7. 机制预测新的边界条件。

Spotlight 可能停在 2—3，真正有长期影响力的分析通常走到 4—7。

#### 6. 重新定义测量对象

很多获奖分析论文最深的贡献不是结论，而是新坐标系：

- CheckList 把准确率变成行为规格；
- Dataset Cartography 把样本属性变成训练动态；
- Mirage 把“能力涌现”分成潜在能力和观测指标；
- Sanity Checks 把“解释好看”变成可证伪的仪器效度。

换言之，它们生产的是 epistemic technology——产生可靠知识的技术。

---

### 五、如何自上而下系统地产生课题

最有效的起点不是“选一个新模型看看”，而是建立领域的承重信念地图。

#### 第一步：画出因果—评测链条

对大多数 AI 问题，都可以使用如下主链：

$$
\text{数据生成} \rightarrow \text{训练目标} \rightarrow \text{优化动态} \rightarrow \text{内部表征} \rightarrow \text{输出行为} \rightarrow \text{评测指标} \rightarrow \text{部署决策}
$$

每一条箭头都问三个问题：

1. 这里建立的是因果关系，还是相关性？
2. 使用的代理指标是否真的测量目标概念？
3. 这个关系在哪些分布、规模和干预下保持不变？

这会自然产生一组稳定课题，而不是零散现象。

#### 第二步：寻找“承重但证据薄弱”的假设

高价值假设通常同时满足：

- 大量论文在使用；
- 很少有人直接验证；
- 一旦错误，会改变许多结论；
- 可以设计低成本、强区分度实验。

常见承重假设包括：

- benchmark 测到了目标能力；
- 更大的模型是在使用同一种机制；
- explanation 反映了模型决策过程；
- 平均性能代表各类样本性能；
- 模型间差异来自架构而不是训练数据；
- 长推理链代表更多有效计算；
- 探针能读出信息意味着模型使用了该信息；
- 能力曲线跳变意味着内部机制发生相变。

#### 第三步：对假设施加固定的“问题生成算子”

不必等待灵感。对每个承重信念依次做以下变换：

- **不变性算子**：保持语义不变，只改表面形式。预测是否保持？
- **反事实算子**：保持其他条件，移除被认为必要的因素。效果是否仍然存在？
- **正交化算子**：把自然相关的两个变量拆成 2×2 组合。
- **指标算子**：换成连续、校准、分组或因果相关指标，结论是否反转？
- **分组算子**：平均现象是否由少数子群、模板或数据源驱动？
- **动态算子**：终点相同的模型，形成过程是否完全不同？
- **规模算子**：规律跨参数量、数据量和推理计算时是否保持？规模之间是否存在混杂？
- **rescue 算子**：主动增强或抑制候选机制，现象是否按方向变化？

这些算子本质上是一台“课题生成器”。

#### 第四步：建立替代机制矩阵

不要只有一个喜欢的解释。假设观察到现象 (Y)，至少列出三到五个机制：

| 机制 | 能解释已有现象吗 | 独特预测 | 可区分干预 |
| :--- | :--- | :--- | :--- |
| 真正能力提升 | 是 | 连续指标也提升 | 更换指标 |
| 数据污染 | 是 | 污染相关样本提升更大 | 时间切分、重写 |
| 表面启发式 | 是 | 反启发式样本失败 | 最小反例 |
| 解码/提示效应 | 是 | 改 prompt 后结论变化 | 冻结协议 |
| 评测阈值 | 是 | 连续指标平滑 | 指标重参数化 |

真正的实验设计目标不是“支持我的解释”，而是让候选机制产生不同预测。

#### 第五步：先做便宜但决定性的实验

好的第一阶段实验应该满足：

- 一两张图就能否定大部分平庸解释；
- 不需要大规模统计也能看出方向；
- 失败后能快速停止；
- 成功后可以扩展成机制研究。

第一张关键图最好能表达：

> 在控制 X 以后，大家预期 Y，但实际出现了非 Y；操纵 M 后，结果又按预测变化。

#### 第六步：只扩展能够穿过证据阶梯的现象

建议设置升级门槛：

- 单个模型、单一提示才出现：不升级；
- 换指标就消失：转为测量论文或停止；
- 多模型存在但无法排除混杂：继续诊断；
- 有明确干预、边界条件和新预测：主力投入；
- 能形成工具、数据集或坐标系：进入长期研究线。

---

### 六、如何把研究经验做成复利

复利的单位不是“论文数量”，而是可复用的认识资产。

#### 1. 选择一个稳定的母问题

例如：

> benchmark 成功在什么条件下真正代表目标能力？

这个问题可以持续产生：

1. 数据集启发式分析；
2. challenge set；
3. 污染和记忆诊断；
4. 训练动态；
5. 因果干预；
6. 新评测协议；
7. 改进训练方法。

模型会换，但母问题、测量和实验设计可以复用。

相反，“看看新模型 X 在任务 Y 上有什么怪现象”几乎不产生复利。

#### 2. 建立六类长期资产

- **概念资产**：稳定的分类学和术语；
- **数据资产**：可控、可组合的最小反例；
- **测量资产**：校准指标、行为测试、动态记录；
- **干预资产**：消融、激活修改、数据反事实工具；
- **工程资产**：统一运行和统计框架；
- **理论资产**：机制假设及其边界条件。

下一篇论文至少应复用其中两三类，并新增一类。

#### 3. 维护“主张—条件—证据”账本

不要只记实验结果。对每个结论记录：

- 主张到底是什么；
- 成立的模型、数据和规模；
- 不成立的边界；
- 已排除和未排除的机制；
- 当时的预测；
- 后来是否被证实。

久而久之，真正的 edge 不是知道更多事实，而是更准确地知道：

> 哪些结论可迁移，哪些只是局部规律；下一个最有区分力的实验是什么。

#### 4. 用研究飞轮组织论文

一个可持续研究计划可以沿着下面的顺序前进：

$$
\text{信念地图} \rightarrow \text{反例} \rightarrow \text{稳定现象} \rightarrow \text{机制} \rightarrow \text{干预} \rightarrow \text{预测规律} \rightarrow \text{训练或评测方法}
$$

单篇论文可以只完成其中一到两步，但整个研究线应持续向右推进。

#### 5. 衡量复利，而不只衡量投稿

可以定期记录：

- 新项目复用了多少已有代码、数据和概念；
- 从提出假设到否定它需要多久；
- 事先预测的命中率；
- 每个机制产生了多少新实验；
- 结论覆盖了多少模型、任务和边界条件；
- 每篇论文为后续留下了什么不可替代资产。

如果实验越来越多，但验证一个新假设仍然每次都要从零开始，说明尚未形成研究复利。

---

### 七、基础模型时代尤其需要防范的伪“惊讶”

现在的 LLM/VLM 分析比早期更容易制造漂亮但不稳健的现象，因为研究者自由度极高。

至少应显式控制：

- 模型 API 和版本漂移；
- prompt 搜索带来的选择偏差；
- temperature、采样数和解码预算；
- benchmark 污染和模板记忆；
- 模型规模与训练数据、后训练方法的混杂；
- 不同 tokenizer 和输出格式造成的指标差异；
- inference-time compute 与模型能力混淆；
- 只报告成功样例的 selection bias；
- 闭源模型无法观察训练过程所造成的因果识别限制。

尤其要避免：

> 模型 A 和模型 B 规模不同，所以行为差异一定是规模导致的。

跨模型家族的规模曲线往往同时混入数据、架构、优化、RLHF 和评测适配。真正的规模分析需要尽可能使用同家族检查点、统一协议，并明确哪些结论只是描述性的。

---

### 八、一份可以直接使用的选题模板

每个候选课题用一页纸回答：

1. 共同体当前相信什么？
2. 这个信念隐含了什么可检验预测？
3. 实验前不同结果的概率分别是多少？
4. 哪个最小反事实能区分主要机制？
5. 如果得到相反结果，仍然有什么价值？
6. 哪些普通解释必须用负对照排除？
7. 结果会改变哪三项研究或工程决策？
8. 能否提出一个尚未观察的新预测？
9. 能沉淀什么工具、数据、坐标系或干预方法？
10. 一句话能否写成：

> 人们认为 X，因此预期 Y；但在控制 C 后观察到非 Y；证据表明原因是 M；操纵 M 能够恢复 Y，因此实践 P 需要改变。

如果第 3、5、7、8、9 题答不出来，即使实验可能得到漂亮曲线，也不宜成为长期主线。

---

### 最后的判断

顶会分析论文的惊讶感通常不是来自“找到一个奇怪 case”，而是来自四件事同时发生：

1. 它选中了一个承重信念；
2. 用极简实验让隐含预测和现实正面冲突；
3. 用对照、干预或新指标排除了廉价解释；
4. 把冲突压缩成一个能生成新预测的新概念。

所以，最值得建设的研究能力不是“发现异常的眼光”，而是：

> 建立信念地图、设计决定性反事实、验证测量工具、区分替代机制，以及把每次实验沉淀为下一次研究的基础设施。

营销可以提高重要结论被看见的概率，却不能凭空创造信息增益。真正长期有效的“有趣”，不是标题中的 surprising，而是审稿人读完 后不得不修改自己原来的预测模型。

## 生成式大模型时代的“有趣”：如何系统性地做高质量分析论文

> 上一版最大的问题不是论文“不经典”，而是把深度学习时代的分析范式直接外推到了生成式大模型时代。
>
> 随机标签、静态 challenge set、单模型消融这些方法的科学原则仍然有效，但它们默认的研究对象已经变了。现在研究的不是一个固定的 $f_\theta(x)$，而是：
>
> $$
> \text{训练数据} \rightarrow \text{基础模型} \rightarrow \text{后训练} \rightarrow \text{提示/工具/搜索} \rightarrow \text{生成轨迹} \rightarrow \text{LLM Judge/人类反馈} \rightarrow \text{合成数据} \rightarrow \text{下一代模型}
>
$$
>
> 这是一个有隐藏变量、有反馈、有策略互动、推理时计算可变的闭环系统。

---

### 一、新时代到底“新”在哪里

旧范式通常隐含以下假设：

| 旧假设             | 大模型时代的现实                            |
| :-------------- | :---------------------------------- |
| 训练集已知或可构造       | 预训练语料、数据配比通常不可见                     |
| 测试集独立于训练集       | benchmark 广泛存在于互联网和合成数据中            |
| 模型是固定函数         | 行为依赖 prompt、system message、采样、工具和记忆 |
| 每题推理成本固定        | test-time compute 可以变化几个数量级         |
| 输出由客观指标评价       | 越来越多输出由另一个 LLM 评价                   |
| 人类反馈代表单一目标      | 偏好具有文化、个体和情境异质性                     |
| 微调只增加能力         | 微调可能破坏安全、知识和原有行为                    |
| 神经元/注意力头是自然分析单位 | 大模型存在 superposition，功能分布在稀疏特征和电路中   |
| 推理是单次前向过程       | agent、自反思、自训练形成反馈闭环                 |
| 模型规模是主要自变量      | 数据、后训练、推理预算、verifier 同样决定能力         |

因此，新时代分析论文真正要解决的是**六类识别问题**：

1. 我们观察到的是能力，还是训练暴露？
2. 是基础模型更强，还是获得了更多推理预算？
3. 是模型真的更好，还是成功欺骗了评测器？
4. 是安全能力被真正改变，还是只改变了开头几个 token？
5. 是模型产生了新信息，还是从已有分布中进行了更强搜索？
6. 内部表示只是“包含信息”，还是因果性地使用了信息？

---

### 二、重新定义新时代的“有趣”

大模型时代只用“惊讶 × 重要性”还不够，因为很多现象的半衰期只有三个月：下一次模型更新后就消失了。

更合理的定义是：

$$
I = \frac{
\text{可信信息增益} \times
\text{结构中心性} \times
\text{跨模型半衰期} \times
\text{可干预性} \times
\text{资产复用性}
}{
\text{对特定模型和 prompt 的依赖}
}
$$

这里新增了三个关键量。

#### 1. 结构中心性

结论是否关于大模型系统的结构，而不是某个模型的偶然行为？

例如：

- “GPT-X 在某个 prompt 下会改变答案”：低结构性；
- “LLM judge 存在可被与问题无关的常量答案利用的攻击面”：高结构性；
- “推理预算的最优分配依赖题目难度”：高结构性；
- “合法的 task-relevant pretraining 也会混淆模型比较”：高结构性。

#### 2. 跨模型半衰期

论文的价值能否活过下一代模型？

**短半衰期论文**通常研究：

- 某个 prompt 技巧；
- 某个闭源版本的排行榜；
- 一个具体越狱字符串；
- 单个模型的某个神经元。

**长半衰期论文**通常研究：

- 生成器与验证器的不对称；
- benchmark 与训练分布的内生关系；
- 评测器的 Goodhart 攻击面；
- test-time compute 的资源分配；
- 自训练闭环的覆盖率与稳定性；
- 数据、表示、输出之间的因果链。

#### 3. 资产复用性

论文是否留下了下一篇可以直接复用的：

- 黑盒审计统计量；
- 计算归一化协议；
- judge 攻击与校准工具；
- 训练动态记录框架；
- 稀疏特征字典；
- 因果干预库；
- 自改进稳定性理论。

新时代真正的 edge 不是“比别人早两周测了新模型”，而是新模型发布后，你已经有一套别人没有的仪器。

---

### 三、近年代表论文的技术拆解

#### 1. Proving Test Set Contamination in Black-Box Language Models

**ICLR 2024 Oral，Outstanding Paper Honorable Mention**  
官方页面：https://iclr.cc/virtual/2024/oral/19769

##### 它解决的新时代难题

大家都怀疑闭源模型见过 benchmark，但：

- 看不到训练数据；
- 看不到模型权重；
- 仅仅答对题目不能证明污染；
- 大模型可能只是泛化得好。

传统的数据去重和训练集搜索在闭源时代失效了。

##### 核心技术

作者使用了一个非常漂亮的黑盒 side channel：**样本的规范顺序**。

在无污染假设下，如果 benchmark 样本是可交换的，那么不同排列应当具有相同地位：

$$
H_0: \quad P(x_1,\ldots,x_n) \overset{d}{=} P(x_{\pi(1)},\ldots,x_{\pi(n)})
$$

如果模型记忆了 benchmark 的原始展示顺序，那么原始排列的似然可能系统性高于随机排列。

于是可以比较：

$$
T = \log P_\theta(D_{\text{canonical}}) - \log P_\theta(D_{\text{permuted}})
$$

再通过随机置换构造具有精确假阳性保证的检验。

##### 为什么有趣

惊讶点不是“模型可能污染”，而是：

> 不需要训练集和权重，也能利用顺序记忆对污染进行有统计保证的黑盒证明。

它把一个无法核验的舆论问题，转成了带零假设、统计量和错误率控制的科学问题。

##### 可复利的技术资产

这开启的是一条“黑盒模型审计”研究线：

- 顺序 side channel；
- log-probability side channel；
- 数据成员推断；
- 模板和措辞记忆；
- 时间切片与版本比较；
- 合成 canary；
- API 输出精度与模型信息泄露。

##### 边界

它对保留规范顺序的污染敏感，但无法捕获所有形式的语义污染。因此它证明的是**某种污染证据**，而不是提供完备检测器。

---

#### 2. Training on the Test Task Confounds Evaluation and Emergence

**ICLR 2025 Oral**  
官方页面：https://iclr.cc/virtual/2025/oral/31791

##### 新概念：training on the test task

作者区分了三个概念：

1. **training on test data**：直接训练测试样本；
2. **contamination**：训练数据中泄漏 benchmark；
3. **training on the test task**：合法加入与目标任务高度相关的数据。

第三种不是违规，但同样会混淆比较。

例如两个模型都没见过 MMLU 测试题，但其中一个在预训练中大量学习了 MMLU 式多选题、任务说明或合成变体。此时模型差异不能简单归因于规模、架构或所谓涌现。

##### 核心实验逻辑

作者的校正思路是：在比较前，让每个模型都接受相同的 task-relevant fine-tuning，再观察模型排序。

这不是完美复原预训练暴露，而是一种“暴露均衡化”干预。

论文还观察到，随着模型逐渐接受 test-task 训练，一些看似突然涌现的曲线会逐渐变平滑。

##### 为什么有趣

它揭示了比普通污染更难处理的问题：

> 即使所有研究者都遵守规则，benchmark 仍可能失去模型比较和能力归因的效度。

这是新时代的重要转变：评测集已经不是训练过程之外的外生变量，而是整个产业训练目标的一部分。

##### 研究复利

它可以继续发展为：

- task exposure 估计；
- 任务相关数据的剂量—反应曲线；
- benchmark lineage；
- 训练暴露校正后的 scaling law；
- 新任务上的前瞻性预测；
- 数据配方与能力之间的因果归因。

---

#### 3. Cheating Automatic LLM Benchmarks: Null Models Achieve High Win Rates

**ICLR 2025 Oral**  
官方页面：https://iclr.cc/virtual/2025/oral/31758 · arXiv：https://arxiv.org/abs/2410.07137

##### 原有信念

AlpacaEval、Arena-Hard-Auto、MT-Bench 等自动评测，虽然存在长度和风格偏差，但通过长度控制、prompt 设计等手段已经足够可靠。

##### 决定性负对照

作者构造了一个 **null model**：

> 无论用户问什么，都输出同一个与问题无关的常量答案。

按定义它没有任何 instruction-following 能力。但是，通过专门构造输出，它能够在自动评测中得到极高成绩：

- AlpacaEval 2.0：86.5% length-controlled win rate；
- Arena-Hard-Auto：83.0；
- MT-Bench：9.55。

而且攻击不需要知道私有测试问题，具有迁移性。

##### 技术本质

这是大模型时代的“评测器对抗攻击”，不是传统模型评测。

系统不再是：

$$
\text{模型} \rightarrow \text{固定指标}
$$

而是：

$$
\text{被评模型策略} \longleftrightarrow \text{LLM Judge 策略}
$$

一旦被评模型能够利用 judge 的偏好，排行榜衡量的就是博弈均衡，而不是任务能力。

##### 为什么特别有趣

Null model 是新时代最强的一类负对照：

- 它理论上没有目标能力；
- 如果仍然得高分，评测效度被直接击穿；
- 不需要争论具体模型是否“其实部分理解了任务”。

这比报告 judge 存在 10% 位置偏差强得多，因为它展示了 **construct validity 的灾难性失败**。

##### 可持续研究线

- judge 的对抗鲁棒性；
- judge ensemble；
- 不同 judge 之间的循环偏好；
- 隐藏风格、身份和长度变量；
- judge 与被评模型同源造成的偏好；
- adversarial null baselines；
- 人类—judge disagreement；
- 排行榜的策略稳定性。

---

#### 4. Scaling LLM Test-Time Compute Optimally Can Be More Effective than Scaling Parameters for Reasoning

**ICLR 2025 Oral**  
官方页面：https://iclr.cc/virtual/2025/oral/31924

##### 旧范式为什么失效

以前能力通常写成：

$$
\text{Performance} = f(\text{parameters}, \text{pretraining compute})
$$

但推理模型时代，能力还取决于：

- 采样多少条解；
- 搜索深度；
- verifier 质量；
- 是否允许回溯；
- 是否根据题目难度动态分配计算。

因此，比较两个模型的一次 greedy decoding 已经没有充分意义。

##### 核心技术

论文分析了两类推理时扩展：

1. 使用 process reward model 进行搜索；
2. 在测试时自适应地更新回答分布。

关键发现是：不同扩展策略的效率高度依赖题目难度。

于是最优策略不是对所有题目统一 best-of-$N$，而是学习难度条件下的资源分配：

$$
c^*(x) = \arg\max_c \frac{\mathbb{E}[\text{utility} \mid x, c]}{\text{FLOPs}(c)}
$$

作者报告，compute-optimal 分配比 best-of-$N$ 提高了超过 4 倍的推理计算效率；在特定条件下，小模型通过推理时计算能够超过参数量大 14 倍的模型。

##### 真正的认知更新

不是“小模型偶尔胜过大模型”，而是：

> 模型能力不是一个常数，而是一条由题目难度、生成器、验证器和推理预算共同决定的资源—性能曲面。

##### 下一代技术栈

任何推理分析都应报告：

- base model；
- sampling budget；
- token budget；
- verifier；
- search policy；
- wall-clock/FLOPs；
- 每题自适应策略；
- pass@$k$ 与实际选中准确率；
- 难度分层曲线。

不控制这些变量，“模型 A 推理能力更强”常常是不可识别的。

---

#### 5. Safety Alignment Should Be Made More Than Just a Few Tokens Deep

**ICLR 2025 Oral**  
官方页面：https://iclr.cc/virtual/2025/oral/31915

##### 核心发现：shallow safety alignment

当前安全训练可能主要改变模型输出最开始几个 token 的分布。

例如，对于有害请求，模型学会高概率生成：

> I’m sorry, but I can’t…

但这并不等价于整个生成轨迹中的有害能力被移除。

如果通过：

- adversarial suffix；
- assistant prefilling；
- 改变解码参数；
- 少量微调；

绕过开头拒绝 token，原有有害生成分布可能重新暴露。

##### 技术上的统一

论文的价值在于用“安全深度”统一解释多类此前看似分散的攻击：

$$
\text{Robustness} \neq P(\text{safe initial tokens})
$$

更合理的是研究条件生成分布在整个轨迹上的变化：

$$
D_t = D_{\mathrm{KL}} \left( P_{\text{aligned}}(y_t \mid y_{<t}, x) \;\middle|\; P_{\text{base}}(y_t \mid y_{<t}, x) \right)
$$

如果 $D_t$ 只在最前几个 token 很大，随后迅速衰减，就形成 shallow alignment。

##### 为什么有趣

它把“又发现一种越狱攻击”提升成了：

> 多种越狱之所以有效，可能因为安全后训练只建立了一层脆弱的序列入口控制。

这就是高质量分析论文的压缩性：一个机制统一多个攻击面。

##### 复利方向

- alignment depth 曲线；
- 不同后训练方法的深度比较；
- 安全表示是否被删除、抑制还是路由；
- 微调过程中安全深度的退化；
- 长 CoT 中的安全漂移；
- agent 工具调用中的跨步骤安全；
- 多模态输入是否绕过文本入口控制。

---

#### 6. Self-Improvement in Language Models: The Sharpening Mechanism

**ICLR 2025 Oral**  
官方页面：https://iclr.cc/virtual/2025/oral/31831

##### 核心悖论

如果模型没有外部信息，它如何通过自己的输出训练自己，从而获得新能力？

“模型不能凭空创造信息”似乎否定了 self-improvement。

##### 理论重构：sharpening

作者指出，自我改进不一定创造新知识。它可能把模型已有分布中的低概率正确答案集中到更高概率区域：

$$
\pi_0(y \mid x) \longrightarrow \pi_{\text{sharp}}(y \mid x)
$$

关键不对称是：

$$
\text{验证正确答案} \quad\text{可能比}\quad \text{直接生成正确答案} \quad\text{更容易}
$$

模型可以通过多次生成、内部验证和训练，将昂贵的搜索结果 amortize 进新策略。

##### SFT 和 RLHF 的区别

论文建立统计框架后得到两个重要结论：

- 如果初始模型对优质输出具有充分 coverage，基于 SFT 的自改进可以是 minimax optimal；
- 如果 coverage 不足，基于在线探索的 RLHF 类方法可能突破 SFT 的限制。

这比“self-training 有效/无效”的经验争论更深，因为它给出了边界条件。

##### 新时代研究对象

真正值得分析的是闭环：

$$
\text{Generator} \rightarrow \text{Candidate set} \rightarrow \text{Verifier} \rightarrow \text{Selection} \rightarrow \text{Training} \rightarrow \text{New generator}
$$

核心变量包括：

- 初始 coverage；
- verifier—generator gap；
- on-policy/off-policy；
- 搜索多样性；
- reward hacking；
- 错误自强化；
- 固定点与坍缩。

这是未来比单次 prompt 现象更有复利的研究线。

---

#### 7. Sparse Feature Circuits: Discovering and Editing Interpretable Causal Graphs in Language Models

**ICLR 2025 Oral**  
官方页面：https://iclr.cc/virtual/2025/oral/31874

##### 为什么旧 mechanistic interpretability 不够

以 attention head 或单神经元作为基本单位有两个问题：

- 单元往往 polysemantic；
- 真正功能可能分布在许多神经元上。

“某个头对行为重要”也不等于已经解释了具体计算。

##### 新技术栈

论文将**稀疏特征**作为分析单位，并寻找对行为具有因果作用的特征子网络。

基本路线是：

1. 从激活中学习稀疏特征；
2. 将模型行为分解到特征层；
3. 估计特征之间的因果连接；
4. 得到 sparse feature circuit；
5. 对特征进行消融或编辑；
6. 检查目标行为是否按预测变化。

论文还提出 SHIFT：由人判断哪些特征与任务无关，然后消融这些特征，以改善分类器泛化。

##### 真正的新意

它从：

> 模型在哪里储存信息？

转向：

> 哪些可解释特征在因果上共同实现了这个行为，并且能否通过编辑改变行为？

这是“可读出”到“实际使用”的升级。

##### 仍未解决的问题

- 稀疏特征字典不唯一；
- SAE 可能漏掉重要特征；
- 稀疏性不自动等于语义单一性；
- 强行干预可能产生分布外激活；
- 局部电路不一定解释整个生成轨迹。

因此未来的 edge 可能不是“训练更大的 SAE”，而是研究特征字典的可识别性、跨模型稳定性和干预有效性。

---

#### 8. Roll the Dice & Look Before You Leap

**ICML 2025 Outstanding Paper**  
官方页面：https://icml.cc/virtual/2025/oral/47241

##### 它质疑什么

next-token prediction 适合流畅续写，但开放式创造任务需要：

- 先进行远距离规划；
- 探索多个全局结构；
- 引入随机性但保持整体一致。

逐 token 训练可能过于短视，并倾向于记忆局部模式。

##### 技术关键

论文没有直接用“写诗是否有创造力”这种不可识别任务，而是构造**最小算法任务**：

- 在抽象知识图上发现新连接；
- 构造新的组合和模式；
- 对新颖性、多样性、正确性进行精确测量。

然后比较：

- next-token 训练；
- multi-token/teacherless 训练；
- diffusion 式生成；
- 输出端 temperature sampling；
- 输入端 seed-conditioning。

结果表明，多 token 方法在这些开放任务上更擅长产生多样且原创的结构；输入端注入随机 seed 可以在保持一致性的同时产生变化。

##### 为什么是新时代的好分析

它不是对某个大模型做主观创意评分，而是：

> 将“创造性”分解成可控、可测量、能够区分生成范式的最小计算任务。

这是新时代 synthetic science 的正确用法：合成任务不是为了展示玩具现象，而是隔离真实系统中不可识别的结构变量。

##### 局限

从算法创造任务到科研创新、故事创作的外部有效性仍然需要验证。论文最强的结论是关于 next-token 学习的结构性局限，不是“diffusion 已经比 LLM 更有创造力”。

---

#### 9. Train for the Worst, Plan for the Best

**ICML 2025 Outstanding Paper**  
官方页面：https://icml.cc/virtual/2025/oral/47251

##### 问题

Masked diffusion language model 理论上可以任意顺序填充 token，但性能经常落后于左到右自回归模型。

直觉上人们可能得出：

> 任意顺序生成架构本身不适合语言或推理。

##### 分析结论

作者发现主要困难来自**训练与推断不对称**：

- 训练时要覆盖指数级的 mask 子问题；
- 其中许多条件预测极其困难；
- 但推理时并不需要按照最差顺序解 mask。

一个简单策略是优先解开模型最有把握的位置：

$$
i_t = \arg\max_{i \in M_t} \max_v P_\theta(x_i = v \mid x_{\setminus M_t})
$$

仅改变 token ordering，就让 Sudoku 准确率从约 7% 提升到接近 90%，并改善 Zebra puzzle 等任务。

##### 为什么惊讶

失败的可能不是模型，而是读取模型的策略：

> 训练必须面对最坏的 mask 组合，但推理可以主动规划最有信息的生成顺序。

这将“架构能力不足”重构成“推断策略没有利用模型自由度”。

---

#### 10. PRISM Alignment Dataset

**NeurIPS 2024 Outstanding Paper**  
官方页面：https://neurips.cc/virtual/2024/oral/98025

##### 原有隐含前提

RLHF 通常把人类偏好压缩成一个标量 reward：

$$
r(x, y)
$$

这隐含假设：存在大致统一的“人类偏好”。

##### 数据设计

PRISM 收集：

- 75 个国家的 1500 名参与者；
- 与 21 个 LLM 进行的 8011 次真实对话；
- 参与者人口统计信息；
- 个体偏好与细粒度反馈；
- 英国、美国具有一定代表性的样本。

关键不是数据量，而是把反馈与“谁在什么情境下表达什么偏好”连接起来：

$$
r(x, y, u, c)
$$

其中 $u$ 是用户，$c$ 是文化与情境。

##### 认知更新

Alignment 不是寻找唯一的“正确 reward”，而可能是：

- 偏好分布建模；
- 个性化；
- 群体公平；
- 冲突偏好协商；
- 明确由谁决定规范目标。

这是改变问题本体的论文，而不是把现有 reward model 做得更准。

---

### 四、这些论文共同体现的新时代分析技术栈

#### 1. 黑盒统计识别

模型不可见时，不再执着于内部消融，而是寻找可观测 side channel：

- 顺序似然；
- token log-probability；
- 输出协方差；
- API 精度；
- 时间和版本差异；
- 交换性；
- 重复查询稳定性。

“Proving Test Set Contamination”和 ICML 2024 的“Stealing Part of a Production Language Model”都属于这个方向。

#### 2. 计算量归一化

新时代比较必须至少控制：

$$
(\text{预训练计算}, \text{后训练计算}, \text{推理计算}, \text{外部工具计算})
$$

参数量不再是能力的充分代理变量。

#### 3. 评测器红队

每个新 benchmark 都应先尝试：

- constant-output null model；
- 长度攻击；
- 风格攻击；
- 身份泄露；
- 位置交换；
- 循环偏好；
- 与问题无关但“像好答案”的元话语；
- judge 同源偏好；
- adversarial paraphrase。

如果 null model 都能得高分，就没有必要继续比较真实模型。

#### 4. 按 token、步骤和训练阶段分析动态

聚合准确率太粗。新时代应记录：

- 每个 token 上的 KL 变化；
- 安全 alignment depth；
- 每个 training step 对不同回答的影响；
- reasoning trace 中的答案翻转；
- verifier 置信度；
- checkpoint 间能力出现和消失；
- 知识源活跃程度；
- 自训练轮次中的熵与多样性坍缩。

#### 5. 从神经元转向特征和电路

现代 mechanistic analysis 的基本路线变成：

$$
\text{Activation} \rightarrow \text{Sparse feature} \rightarrow \text{Circuit} \rightarrow \text{Causal intervention} \rightarrow \text{Behavioral prediction}
$$

attention map、线性 probe 和单神经元案例已经很难单独构成高等级贡献。

#### 6. 闭环稳定性分析

只分析一次生成不够。真正重要的是：

- 模型评价自己的输出；
- 模型用自己的输出训练自己；
- agent 调用工具后继续更新计划；
- synthetic data 回流到下一代模型；
- judge 与生成器共同演化。

要研究的是覆盖率、固定点、错误放大、奖励投机和分布坍缩。

---

### 五、如何自上而下产生新时代课题

新的母结构应当是一张闭环图：

$$
D \rightarrow M_0 \rightarrow A \rightarrow \pi_{\text{infer}} \rightarrow Y \rightarrow J \rightarrow D_{\text{synthetic}} \rightarrow M_1
$$

其中：

- $D$：预训练数据；
- $M_0$：基础模型；
- $A$：alignment/post-training；
- $\pi_{\text{infer}}$：搜索、采样、工具策略；
- $Y$：生成结果和轨迹；
- $J$：人类或模型评测器；
- $D_{\text{synthetic}}$：合成训练数据；
- $M_1$：下一轮模型。

对每一条边应用六种新时代算子。

#### 1. 隐变量算子

观察到的提升是否其实来自：

- task exposure；
- 数据污染；
- 推理预算；
- verifier；
- prompt 搜索；
- 输出长度；
- 后训练配方？

#### 2. 非对称算子

寻找两种能力之间的不对称：

- 生成 vs 验证；
- 记忆内容 vs 记忆顺序；
- 开头安全 vs 全轨迹安全；
- 左到右生成 vs 任意顺序生成；
- 模型包含信息 vs 模型使用信息。

不对称往往直接产生有趣机制。

#### 3. 反馈算子

如果过程重复十轮会怎样？

- self-training 是否收敛？
- 错误是否放大？
- 多样性是否坍缩？
- reward hacking 是否增强？
- judge 与生成器是否共同偏移？

#### 4. 博弈算子

一旦某指标被优化，它还有效吗？

让被评模型知道：

- judge 是谁；
- 评价 prompt；
- 排行榜规则；
- 长度控制方式；

然后研究最优投机策略。

#### 5. 资源算子

把性能从单点改成曲面：

$$
P = f(\text{model size}, \text{data}, \text{test-time tokens}, \text{samples}, \text{search depth}, \text{verifier})
$$

寻找最优资源边界，而不是继续报一个 SOTA 点。

#### 6. 跨代预测算子

在下一代模型发布前写下预测：

- 现象会随规模增强还是减弱？
- 哪个机制会消失？
- 哪种攻击仍然有效？
- 哪条 scaling curve 会移动？

能预测尚未发布模型的分析，才真正具备长半衰期。

---

### 六、三条最容易形成复利的研究主线

#### 方向 A：大模型评测认识论

可以形成以下连续论文：

$$
\text{污染检测} \rightarrow \text{task exposure 校正} \rightarrow \text{judge 攻击} \rightarrow \text{judge 校准} \rightarrow \text{动态 benchmark} \rightarrow \text{排行榜稳定性理论}
$$

长期资产是：

- data lineage；
- 黑盒审计；
- adversarial null 库；
- 多 judge 评测系统；
- 人类校准集；
- 前瞻性测试集。

#### 方向 B：推理和自改进动力学

$$
\text{生成—验证不对称} \rightarrow \text{test-time search} \rightarrow \text{计算最优分配} \rightarrow \text{搜索结果蒸馏} \rightarrow \text{self-training} \rightarrow \text{稳定性与坍缩}
$$

这条线能覆盖 reasoning model、agent、verifier、RL 和合成数据，不依赖某个具体模型。

#### 方向 C：后训练如何重写内部机制

$$
\text{行为变化} \rightarrow \text{逐 token 动态} \rightarrow \text{稀疏特征} \rightarrow \text{因果电路} \rightarrow \text{安全/知识编辑} \rightarrow \text{持续微调稳定性}
$$

它比“找到一个拒绝神经元”有更强复利，因为技术资产是特征字典、干预方法和跨 checkpoint 追踪工具。

---

### 七、一个更适合新时代的选题评分表

每个候选课题按 0—5 分评估：

| 维度 | 核心问题 |
| :--- | :--- |
| **结构性** | 换下一代模型后问题还存在吗？ |
| **识别性** | 能区分能力、数据、计算和评测混杂吗？ |
| **对抗性** | 被研究系统主动优化指标后，结论还成立吗？ |
| **动态性** | 是否研究了 token、训练或闭环轨迹？ |
| **因果性** | 是否能干预机制并得到方向性预测？ |
| **跨代预测** | 能否预测尚未测试的模型或设置？ |
| **复用性** | 会留下什么仪器或数据资产？ |
| **双向价值** | 相反实验结果是否同样有价值？ |

其中“结构性、识别性、复用性”任何一项低于 3，都不适合成为长期主线。

---

### 结论

你说“旧技术栈像割韭菜”是有道理的，但需要进一步区分：

- 会迅速过时的是**研究对象和实验协议**；
- 不应丢弃的是**反事实、负对照、可证伪性和因果识别**；
- 新时代的关键，是把这些原则应用于一个**完全不同的系统边界**。

现在最有价值的分析论文，不再主要问：

> 模型学到了什么现象？

而是问：

> 在训练数据不可见、推理计算可变、评测器可被博弈、模型能够自我生成训练数据的闭环里，我们究竟能识别什么？哪些结构规律能跨越下一代模型？

真正能够形成 edge 的，不是围绕 GPT-5、Claude-X 或某个新 benchmark 积累经验，而是围绕以下稳定对象积累：

- 黑盒可识别性；
- 训练暴露；
- 生成—验证不对称；
- 计算资源分配；
- judge 博弈；
- 自改进稳定性；
- 稀疏特征因果电路；
- 多元人类偏好。

这些问题即使模型范式再次变化，也不会立刻归零。
## contribution
NeurIPS 2026 引入的这四种贡献类型（Contribution Type），**核心目的是让不同研究范式的论文都能在统一的评审标准下得到更公平、更有针对性的评价**。

这四种类型并非对论文质量的划分，而是对**研究贡献性质**的界定。具体含义如下：

#### 📝 General（通用型）

*   **核心定义**：这是**默认选项**，预计**大多数投稿都属于此类**。
*   **适用论文**：贡献不符合其他几种特定范式的论文。例如，提出一个新模型、一个新数据集，或对现有方法进行深入的实证研究等。

#### 🧮 Theory（理论型）

*   **核心定义**：论文的**主要贡献在于理论分析和证明**。
*   **评审侧重**：评审重点在于**数学的严谨性和正确性**，即证明、引理和整体逻辑是否成立。
*   **注意事项**：**实证验证（实验）不是必需的**。即便包含实验，其目的也应是阐释理论洞见，而非追求SOTA性能。
*   **典型例子**：提出“**神经正切核（NTK）**”并证明其性质的论文，或证明模型鲁棒性通用下界的论文。

#### 🎯 Use-Inspired（应用启发型）

*   **核心定义**：论文的**主要贡献在于为一个特定的现实世界应用场景设计方法**。
*   **评审侧重**：评审会关注该方法是否切实满足了特定应用的需求。
*   **典型例子**：将现有模型应用于**森林冠层高度估计**，虽然模型本身不新颖，但贡献在于解决了该特定应用中的挑战。

#### 💡 Concept & Feasibility（概念与可行性型）

*   **核心定义**：论文提出一个**极具新颖性、有巨大潜力的想法，但其全部价值无法在一篇论文中得到完整验证**。
*   **评审侧重**：评审会重点关注其**新颖性和潜在影响力**，标准会相应提高。它鼓励研究者分享那些有远见但尚不成熟的探索性想法。

#### ⚠️ 补充：Negative Results（阴性结果型）

此外，NeurIPS 2026 还设有 **“Negative Results”（阴性结果型）** 。它用于发表那些虽然未能验证预期效果，但对理解问题本身有重要价值的论文。

#### 💎 总结

选择正确的贡献类型对投稿很重要，因为**审稿人将依据你选择的类型来解读和评判你的论文**。并且，**投稿后无法更改贡献类型**。

因此，建议在投稿前仔细阅读官方的 [审稿指南](https://neurips.cc/Conferences/2026/ReviewerGuidelines)，为论文选择最契合的标签。

## AI版本总结分析类句模
### 一、先给你一个“分析类选题黏合”的最小形式化：6个槽位 + 18个关系算子

**你要黏合的名词对象**，在顶会分析文里通常落在这些槽位里（你写题目/摘要时就用它们填空）：

- **X**：方法/训练信号/解码策略/模块/提示法（例如 CoT、RLHF、register tokens、KV cache 压缩）
- **Y**：能力/性能/安全性/泛化/鲁棒性（例如 spatial reasoning、alignment、generalization）
- **C**：条件（数据分布、交互设定、预算、尺度、评测协议）
- **M**：机制变量（可测/可操控的中介：注意力分配、token 质量、浅层对齐、表示纠缠等）
- **E**：证据结构（反事实、对照组、诊断集、审计方法、理论推导）
- **A**：行动结论（何时用/别用、怎么修、上限与代价）

下面 18 类“关系算子”就是顶会分析论文最常用的**句法粘合方式**：每一类都能把 {X,Y,C,M,E,A} 以一种“可检验、可反驳、可行动”的方式连起来。

---

### 二、18类句子模式（每类给：模板 → 对应高质量顶会论文）

> 读法：每个模式都像一个“研究主张句”的骨架；你把 X/Y/C/M 换成自己的对象，就自然得到一个更容易落地的分析问题。

---

## 1) 纠偏否定：**“X 不是 Y / X 并不意味着 Y”**（Debunk）

**模式 1.1｜解释信号 ≠ 因果解释**
- 句式模板  
  - “**X 并不能解释 Y**：在保持输出几乎不变的情况下，我们可以大幅改变 X（或反过来）。”  
  - “X 与 Y 的相关性是**可被反例击穿**的，因而不应作为解释依据。”
- 对应论文（顶会）  
  - *Attention is not Explanation*（NAACL 2019）.   

**模式 1.2｜安全/能力不是“线性子空间可切割”的**
- 句式模板  
  - “我们原以为安全行为集中在某个方向/子空间，但结果表明：**安全与通用能力高度纠缠**，线性分离假设不成立。”
- 对应论文（顶会）  
  - *Safety Subspaces are Not Linearly Distinct: A Fine-Tuning Case Study*（ICLR 2026）.   

---

## 2) 伪现象揭露：**“你以为出现了新能力，其实是度量/统计把你骗了”**（Mirage / Metric artifact）

**模式 2.1｜现象 P 是“指标选择”的产物**
- 句式模板  
  - “所谓的 P（涌现/突变）并非行为发生质变，而是由于**非线性/不连续指标**造成的视觉假象；换一种连续指标后曲线变平滑。”
- 对应论文（顶会高质量，NeurIPS Outstanding + Oral）  
  - *Are Emergent Abilities of Large Language Models a Mirage?*（NeurIPS 2023 Outstanding Main Track Paper，且在 press release 中给出口头时段信息）.   

---

## 3) 隐含等价：**“X 表面是 A，本质上是在做 B”**（Secretly / Reinterpretation）

**模式 3.1｜训练目标的重写 → 发现“其实在学奖励/价值”**
- 句式模板  
  - “把 X 的目标函数重写后，我们证明：它等价于/隐式实现了 Y（reward model / off-policy / value function）。”
- 对应论文（顶会）  
  - *Direct Preference Optimization: Your Language Model is Secretly a Reward Model*（NeurIPS 2023）.   

**模式 3.2｜“主流直觉”是错的：算法家族被误分类了**
- 句式模板  
  - “社区通常把 X 当作 on-policy，但从一阶原理推导可得：它**天然可作 off-policy 解释**；因此一些‘系统开销/不稳定’并非本质。”
- 对应论文（顶会）  
  - *Group-Relative REINFORCE Is Secretly an Off-Policy Algorithm: Demystifying Some Myths About GRPO and Its Friends*（ICLR 2026）.   

---

## 4) 对偶/统一：**“A 与 B 看似不同，其实共享同一结构”**（Duality / Unification）

**模式 4.1｜两大流派的共同本质被显式化**
- 句式模板  
  - “A 与 B 在表面设计上不同，但存在一个统一的对象/不变量，使二者在某种意义下对偶/等价。”
- 对应论文（顶会高质量，ICLR Outstanding HM）  
  - *On the duality between contrastive and non-contrastive self-supervised learning*（ICLR 2023 Outstanding Paper Honorable Mention）.   

---

## 5) 机制归因：**“Y arises from M (not H)”**（Arises from / Mechanistic explanation）

**模式 5.1｜现象不是来自‘数据更多/参数更大’，而是架构诱导偏置**
- 句式模板  
  - “Y 的泛化/记忆切换**源于 M（架构/几何/表示基）**，而非传统解释 H；并给出可验证预测。”
- 对应论文（顶会高质量，ICLR Outstanding + Oral）  
  - *Generalization in diffusion models arises from geometry-adaptive harmonic representations*（ICLR 2024 Outstanding Paper，含 Oral 链接）.   

---

## 6) 困难来源：**“Why is X hard for Y? A … perspective”**（Why hard）

**模式 6.1｜困难不是“能力缺失”，而是“证据分配/聚焦机制”出了问题**
- 句式模板  
  - “为什么 Y 在任务 X 上很差？从 M（注意力焦点/跨模态交互/证据访问）角度，定位系统性瓶颈，并给出干预点。”
- 对应论文（顶会）  
  - *Why Is Spatial Reasoning Hard for VLMs? An Attention Mechanism Perspective on Focus Areas*（ICML 2025，PMLR 正式论文页）.   

---

## 7) 训练动态：**“Learning dynamics of X”**（Dynamics → Explanation → Intervention）

**模式 7.1｜把“结果”拆成“过程”：每一步在强化谁、压扁谁**
- 句式模板  
  - “我们不只报告终态性能，而是分析训练过程中的动态分解：哪些样本/答案在每一步影响了哪些预测；并由此得到一个轻量改法。”
- 对应论文（顶会高质量，ICLR Outstanding）  
  - *Learning Dynamics of LLM Finetuning*（ICLR 2025 Outstanding Paper）.   

---

## 8) 阶段/突变：**“abrupt learning / phase transition 的机制基础”**（When & Why it suddenly happens）

**模式 8.1｜“什么时候学会的？”比“学会了什么？”更可做**
- 句式模板  
  - “某能力/现象在训练中出现突变；我们给出其机制基础，并通过最小模型/可控任务验证。”
- 对应论文（顶会高质量，ICLR 2024 Honorable Mention + Oral）  
  - *The mechanistic basis of data dependence and abrupt learning in an in-context classification task*（ICLR 2024 Honorable Mention，含 Oral 链接）.   

---

## 9) 必要性重审：**“Revisiting the necessity of X in Y”**（Is X needed?）

**模式 9.1｜“这玩意儿到底有没有必要？”要写成“在何种 C 下必要”**
- 句式模板  
  - “我们重审 X 对 Y 的必要性：在 C1 下有效、在 C2 下无效甚至有害；因此给出条件化使用准则。”
- 对应论文（顶会）  
  - *Revisiting the Necessity of Lengthy Chain-of-Thought in Vision-centric Reasoning Generalization*（CVPR 2026）.   

**模式 9.2｜公平比较：从零训练会系统性低估某类模型**
- 句式模板  
  - “在比较架构/序列模型时，‘从零训练’会引入系统性偏差；正确比较需要 data-driven priors（预训练→微调）。 ”
- 对应论文（顶会高质量，ICLR Outstanding + Oral）  
  - *Never Train from Scratch: Fair Comparison of Long-Sequence Models Requires Data-Driven Priors*（ICLR 2024 Outstanding Paper，含 Oral 链接）.   

---

## 10) 评测协议批判：**“We need to talk about …”**（Protocol matters）

**模式 10.1｜标准划分并不“标准”：复现一遍就露馅**
- 句式模板  
  - “大家默认的标准划分/协议会夸大 SOTA；在复现与对照后，我们发现结论对划分高度敏感，因此需要修正协议。”
- 对应论文（顶会高质量，ACL Outstanding）  
  - *We Need to Talk about Standard Splits*（ACL 2019 Outstanding Paper，ACL Anthology 标注）.   

---

## 11) 数据价值与选择：**“Not all tokens/data are what you need”**（Data curation as analysis）

**模式 11.1｜不是更多数据，而是“哪些 token 值得”**
- 句式模板  
  - “预训练的关键不在于数据规模，而在于 token 质量/分布匹配；我们提出可操作的 token 级筛选原则并验证。”
- 对应论文（顶会高质量，NeurIPS Best Paper Runner-up）  
  - *Not All Tokens Are What You Need for Pretraining*（NeurIPS 2024 Runner-up）.   

**模式 11.2｜把数据选择变成统计理论问题（指出流行方法的短板）**
- 句式模板  
  - “我们建立弱监督下的数据选择统计理论，并用它解释为什么一些常用数据选择/子集选择方法会失败。”
- 对应论文（顶会高质量，ICLR 2024 Honorable Mention + Oral）  
  - *Towards a statistical theory of data selection under weak supervision*（ICLR 2024 Honorable Mention，含 Oral 链接）.   

---

## 12) 价值换算/账单：**“Is X worth 1 Y?”**（Explicit trade-off accounting）

**模式 12.1｜把“资源换性能”写成一个可引用的比值命题**
- 句式模板  
  - “在固定预算/数据条件下，X 的边际收益能否被 Y 替代？‘X worth 1 Y’把 trade-off 变成可比较的单位。”
- 对应论文（顶会高质量，ICLR 2024 Honorable Mention + Oral）  
  - *Is ImageNet worth 1 video? Learning strong image encoders from 1 long unlabelled video*（ICLR 2024 Honorable Mention，含 Oral 链接）.   

---

## 13) 一次训练跑完的审计/归因：**“with one (1) training run”**（Cheap but strong audits）

**模式 13.1｜把原本要训练 N 次的审计，压缩成 1 次**
- 句式模板  
  - “我们提出只需一次训练跑完的审计/归因框架；并给出理论连接（如 DP↔泛化）与实证下界。”
- 对应论文（顶会高质量，NeurIPS Outstanding + Oral）  
  - *Privacy Auditing with One (1) Training Run*（NeurIPS 2023 Outstanding Main Track Paper，press release 中给出口头信息）.   

**模式 13.2｜数据价值/贡献也能“单次训练估计”**
- 句式模板  
  - “我们用单次训练估计数据 Shapley / 数据贡献，降低成本，使大规模诊断成为可能。”
- 对应论文（顶会高质量，ICLR 2025 Honorable Mention）  
  - *Data Shapley in One Training Run*（ICLR 2025 Honorable Mention）.   

---

## 14) 安全对齐的“深度”问题：**“alignment is shallow”**（Depth / Persistence)

**模式 14.1｜对齐只改了前几个 token，是一种“投机取巧的捷径”**
- 句式模板  
  - “对齐表现来自浅层捷径：模型只在生成前几个 token 改分布；因此对抗 suffix、prefill、解码扰动或微调时很脆。”
- 对应论文（顶会高质量，ICLR Outstanding）  
  - *Safety Alignment Should be Made More Than Just a Few Tokens Deep*（ICLR 2025 Outstanding Paper）.   

---

## 15) 良性操作的副作用：**“benign fine-tuning can break safety”**（Unintended consequences）

**模式 15.1｜“我没想越狱，但我把它越狱了”：现实价值极强**
- 句式模板  
  - “即便用户无恶意、数据表面良性，进一步微调也会系统性破坏安全；这揭示了安全基础设施的缺口。”
- 对应论文（顶会）  
  - *Fine-tuning Aligned Language Models Compromises Safety, Even When Users Do Not Intend To!*（ICLR 2024）.   

---

## 16) 部署失配：**“训练单轮，部署多轮；模型会迷路”**（Train–deploy mismatch）

**模式 16.1｜把“多轮对话失败”从 anecdote 变成可规模化基准**
- 句式模板  
  - “训练数据主要是 completion/单轮指令，但部署是多轮、信息逐步揭示且常欠说明；我们构造可扩展评测，发现可靠性/能力显著坍塌。”
- 对应论文（顶会高质量，ICLR Outstanding）  
  - *LLMs Get Lost In Multi-Turn Conversation*（ICLR 2026 Outstanding Paper）.   

---

## 17) 诊断 → 小补丁修复：**“identify artifact → fix with minimal change”**（Analysis that ships）

**模式 17.1｜发现一个伪迹（artifact），然后用极小结构补丁修掉**
- 句式模板  
  - “我们识别到表示/特征图中的系统性伪迹，并提出一个极简补丁（额外 token / 结构约束），既解释成因又提升性能/可解释性。”
- 对应论文（顶会高质量，ICLR Outstanding + Oral）  
  - *Vision Transformers Need Registers*（ICLR 2024 Outstanding Paper，含 Oral 链接）.   

---

## 18) 可解释性“忠实度”与“编故事”：**“模型说的理由未必是它做的理由”**（Faithfulness)

**模式 18.1｜CoT 可能是“事后合理化”，不等于真实决策依据**
- 句式模板  
  - “模型给出看似合理的推理链，但它对关键偏置特征保持沉默；因此解释不忠实（unfaithful）。”
- 对应论文（顶会）  
  - *Language Models Don’t Always Say What They Think: Unfaithful Explanations in Chain-of-Thought Prompting*（NeurIPS 2023）.   

---

### 三、额外补两类“顶会分析句法”，你笔记里相对缺的

#### A) “检测/取证”句法：不是改模型，而是证明它发生了某事（审计、溯源、认证）
- 句式模板  
  - “我们提出一个统计检验/信息论框架，用可解释的置信度（p-value/界）检测 X（如 watermark、污染、泄漏）。”
- 对应论文（顶会高质量，ICML Outstanding）  
  - *A Watermark for Large Language Models*（ICML 2023 Outstanding Paper Award）.   

#### B) “比较机制”句法：不是比分数，而是比“决策机制长什么样”
- 句式模板  
  - “我们比较两类模型在同一任务上的**决策机制差异**（而非仅准确率），并用解释方法验证差异是否稳定。”
- 对应论文（顶会高质量，CVPR Best Student Paper Honorable Mention）  
  - *Comparing the Decision-Making Mechanisms by Transformers and CNNs via Explanation Methods*（CVPR 2024 Awards 页面列出）.   

---

### 四、对你笔记的“批判性”总结：你卡壳通常不是因为方向不行，而是句法里缺了一个“可操控的 M”

你笔记里很多想法属于正确的“关系算子”，但常见卡点是：

1) **把 3–4 个大命题塞进一句话**（CoT→视觉处理→性能退化→training-free 干预），却没有把它们串起来的**单一中介机制变量 M**（例如“回看图像频率/跨模态注意力分配/证据访问门控”）。顶会分析文往往先把问题缩成“一个 M”，再谈 why/so-what。你可以对照 ICML 2025 那篇空间推理：它把“空间推理难”落到了“focus areas / attention 机制”这种可测 M 上。   

2) **“X 不是 Y”如果没有反事实构造，就会变成观点**。像 *Are Emergent Abilities… a Mirage?* 之所以强，是它把“涌现”改写成“指标不连续导致的假象”，并用预测+实验闭环把它钉死。   

3) **“必要性/边界”类选题，必须写成条件句**（在何种 C 下必要/不必要），否则就会被反例秒杀；CVPR 2026 的 CoT 必要性重审、ICLR 2024 的 “Never Train from Scratch” 都是把结论绑定到“比较协议/设定 C”。   

---

如果你要把这套“句法库”直接用于你关心的 **VLM CoT**，最稳的落地方式是：先从上面选 **1 个关系算子**（例如 #6 困难来源、#9 必要性重审、#17 诊断→小补丁、或 #18 忠实度），再强制自己补齐一句话里的 **M（可测机制变量）+ E（反事实证据结构）+ A（条件化行动结论）**。这样你的问题会从“宏大但举步维艰”变成“可实验闭环”。
