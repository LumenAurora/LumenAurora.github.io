---
title: "Anthropic 的可解释性系统：从黑盒到玻璃盒的七层路径"
date: 2026-08-28
category: "机制可解释性"
tags:
  - "可解释性"
  - "Anthropic"
  - "归因图"
  - "SAE"
  - "初学者"
description: "一份以 Anthropic 工作为线索、面向初学者的机制可解释性系统导览：从残差流视角、QK/OV 分解、Induction Head，到 Superposition、稀疏自编码器、Circuit Tracing 与 QK Attribution，最后汇总技术栈、应用案例与学习路线图。"
---

# Anthropic 的可解释性系统：从黑盒到玻璃盒的七层路径

> 一份以 Anthropic 工作为线索、面向初学者的机制可解释性系统导览：从残差流视角、QK/OV 分解、Induction Head，到 Superposition、稀疏自编码器、Circuit Tracing 与 QK Attribution，最后汇总技术栈、应用案例与学习路线图。

### 1️⃣ 什么是机制可解释性？

#### 1.1 传统可解释性的局限

想象你问 ChatGPT："天空为什么是蓝色的？"它给出了完美的回答。但问题是：

- **它真的"理解"了吗？还是在"背诵"模式匹配？**
- 它内部发生了什么计算？
- 这些计算是否可靠？能否被操控？

传统可解释性方法（如 LIME、SHAP）只能告诉你："这个输入特征对输出影响很大"，但无法揭示**模型内部的计算机制**。

#### 1.2 机制可解释性（Mechanistic Interpretability）的定义

> **核心目标**：像神经科学家研究大脑一样，**逆向工程**神经网络，用人类可理解的术语描述其内部算法。

**类比时间**：
- ❌ 传统方法 = 问一个人"你为什么做这个决定？"（可能撒谎或不知道）
- ✅ 机制可解释性 = 打开大脑，观察神经元放电模式，绘制神经回路图

#### 1.3 Anthropic的独特定位

Anthropic团队（由Christopher Olah领导）采用了一种**类似神经科学**的方法论：

```
神经科学方法：
观察行为 → 假设机制 → 设计实验 → 验证/推翻 → 完善理论

Anthropic方法：
观察模型行为 → 提出电路假设 → 激活补丁实验 → 因果验证 → 绘制计算图
```

---

### 2️⃣ 核心思想演变：从"黑盒"到"玻璃盒"

#### 2.1 三代可解释性方法的对比

| 方法 | 粒度 | 局限性 |
|------|------|--------|
| **行为分析** | 整体模型输入→输出 | 无法知道内部过程 |
| **神经元级分析** | 单个神经元激活 | 神经元是**多义的**(polysemantic) |
| **特征级分析** | SAE提取的特征方向 | ⭐ 当前最先进方法 |

#### 2.2 多义性问题（Polysemanticity）

这是整个领域的**核心痛点**：

```python
## 传统视角：一个神经元 = 一个概念？
neuron_42_activation = model.get_neuron_activation(layer=5, neuron=42)
## 问题：这个神经元在以下情况都会激活：
## - 看到"苹果"时
## - 看到红色物体时  
## - 处理数字42时
## - 句子以句号结尾时
```

**发现**：单个神经元同时编码多个不相关概念！就像一个电灯开关同时控制灯光、空调和电视。

#### 2.3 Anthropic的解决方案演进

```
2021: 数学框架建立
   ↓
2022: 发现Induction Heads（归纳头）
   ↓  
2023: Toy Models of Superposition（叠加态玩具模型）
   ↓
2023: Sparse Autoencoders实现Monosemanticity（单义性）
   ↓
2024: Sparse Crosscoders（跨层/跨模型共享字典）
   ↓
2025: Circuit Tracing + Attribution Graphs（电路追踪+归因图）
   ↓
2025: QK Attributions（完善注意力机制解释）
   ↓
2026: Natural Language Autoencoders + HeadVis（自然语言解释+可视化）
```

---

### 3️⃣ 第一层基础：Transformer的残差流视角

#### 3.1 论文：*A Mathematical Framework for Transformer Circuits* (2021)

这是整个系列的**奠基之作**！

##### 3.1.1 传统Transformer视图 vs 残差流视图

**传统教科书视图**（强调实现细节）：
```
Input → Embedding → [Attention → Add&Norm → MLP → Add&Norm] × N → Output
```

**Anthropic的残差流视图**（强调信息流动）：
```
residual_stream_0 = embedding(input)
for layer in layers:
    residual_stream = residual_stream + attention(residual_stream)  # 信息移动
    residual_stream = residual_stream + mlp(residual_stream)        # 信息处理
output = unembed(residual_stream)
```

##### 3.1.2 核心洞察：残差流是"共享工作空间"

把残差流想象成**一张白纸**：
- 每一层都在这张纸上**读取**信息、**写入**新信息
- Attention层负责**移动**信息（从一个位置复制到另一个位置）
- MLP层负责**处理**信息（在原地做计算）

**关键公式**：
$$x^{l} = x^{l-1} + \text{Attn}(x^{l-1}) + \text{MLP}(x^{l-1})$$

其中 $x^l$ 是第 $l$ 层后的残差流。

##### 3.1.3 为什么这个视角很重要？

✅ **统一的分析框架**：所有操作都是对残差流的读写  
✅ **路径分解**：可以追踪任意输出对任意输入的依赖路径  
✅ **可组合性**：不同层的效应可以线性叠加  

---

### 4️⃣ 第二层突破：注意力机制的QK/OV分解

#### 4.1 注意力不是原子操作！

传统教学中，我们说"注意力头关注某些位置"。但Anthropic发现：

**每个注意力头实际上执行两个独立的功能**：

```
┌─────────────────────────────────────────────┐
│              Attention Head h                │
│                                              │
│  QK Circuit (Query-Key):                    │
│    "我应该去哪里找信息？"                     │
│    → 决定attention pattern                   │
│                                              │
│  OV Circuit (Output-Value):                 │
│    "找到后我要搬运什么信息？"                  │
│    → 决定信息如何被转换                       │
│                                              │
│  最终输出 = QK选择的位置 × OV转换的信息       │
└─────────────────────────────────────────────┘
```

#### 4.2 数学分解

对于头 $h$，从位置 $q$ 到位置 $k$ 的注意力：

$$\text{Attention}_h(q, k) = \underbrace{\text{softmax}\left(\frac{Q_q K_k^T}{\sqrt{d}}\right)}_{\text{QK: 去哪里}} \times \underbrace{V_k W_O^h}_{\text{OV: 搬什么}}$$

**虚拟权重（Virtual Weights）**：
- $W_{OV}^h = W_V^h W_O^h$：如果总是关注位置k，会对残差流做什么变换
- $W_{QK}^h = (W_Q^h)^T W_K^h$：哪些query和key模式会相互吸引

#### 4.3 实际意义

**案例：复制过去的名称**

在句子 "I went to ... The name was [Mary]" 中：
- **QK电路**：识别 "[Mary]" 是一个名称（通过语法模式匹配）
- **OV电路**：将 "Mary" 这个概念原样复制到当前位置

这两个功能可以被**独立研究和干预**！

---

### 5️⃣ 第三层发现：Induction Heads与上下文学习

#### 5.1 论文：*In-Context Learning and Induction Heads*

这是一个**震惊全场的发现**！

#### 5.2 什么是Induction Head？

**现象**：当模型看到重复模式时会自动完成：

```
Prompt:
"The library is closed on Monday.
The library is closed on Tuesday.
The library is closed on"

Model预测: " Wednesday" ✅
```

**Induction Head的工作机制**：
```
位置A: "Monday"
位置B: "Tuesday"  ← 注意到这里有 "Monday" 的上下文
位置C: "Wednesday" ← Induction Head将B与A关联，复制模式
```

**三步算法**：
1. **识别**："Tuesday"前面是"Monday"（通过前一个token的K）
2. **搜索**：在之前的位置找"Monday"（通过当前token的Q）
3. **复制**：将"Monday"之后的内容（"Tuesday"）搬过来

#### 5.3 训练动态中的相变（Phase Transition）


**惊人发现**：Induction Heads在训练中**突然涌现**，而不是渐进形成！

```
训练步数:  0 ---- 100 ---- 200 ---- 300 ---- 400
能力:      ████████████████████████↑  (突然出现!)
           (memorization)    (generalization)
```

这与 **grokking现象** 和 **相变理论** 密切相关。

#### 5.4 为什么这很重要？

- ✅ 解释了GPT模型如何**少样本学习**
- ✅ 提供了**可验证的电路假设**
- ✅ 证明了**简单机制可以产生复杂行为**

---

### 6️⃣ 第四层深入：Superposition（特征叠加）理论

#### 6.1 论文：*Toy Models of Superposition*

**这是整个领域最深刻的理论贡献之一！**

#### 6.2 核心矛盾

```
问题：模型需要表示的概念数量 >> 神经元数量

例如：
- GPT-2 Small: 768维隐藏层
- 但需要表示数万个概念（语言、逻辑、事实...）

怎么塞进去？？？
```

#### 6.3 解决方案：利用高维空间的几何结构

**类比**：三维空间中的二维平面

```
想象你要在一条线上（1D）放很多个点：
• • • • • • → 很快就挤不下

但在一个平面上（2D）：
你可以稍微错开角度放置：
  ·   ·   ·
 ·   ·   ·
  ·   ·   ·
现在可以放更多点了！
```

**数学原理**：
- 在 $d$ 维空间中，可以有 $\gg d$ 个**几乎正交**的方向
- 只要容忍少量**干扰**（interference），就可以表示远超维度的特征

#### 6.4 Toy Model演示

```python
## 简化的叠加模型
import torch

n_features = 100  # 想要表示100个特征
n_neurons = 20    # 但只有20个神经元

## 特征向量（几乎正交但非完全正交）
features = torch.randn(n_features, n_neurons) * 0.1

## 输入：特征的稀疏组合
input_sparse = torch.zeros(n_features)
input_sparse[5] = 1.0  # 激活特征5
input_sparse[23] = 0.8 # 微弱激活特征23

## 通过神经元
activation = input_sparse @ features  # 20维

## 重构（会有一些误差）
reconstructed = activation @ features.T  # 近似恢复原始特征
```

#### 6.5 关键洞见

**干扰权衡（Interference Tradeoff）**：
- 特征越多 → 干扰越大 → 重构误差越大
- 但模型会**智能地分配重要性**：常用特征占用更好的方向

**几何结构**：
- 不是随机分布，而是形成**流形**（manifolds）
- 相关概念会在几何上聚集

---

### 7️⃣ 第五层工具：Sparse Autoencoders（稀疏自编码器）

#### 7.1 论文：*Towards Monosemanticity* & *Scaling Monosemanticity*

**这是将理论转化为实用工具的关键一步！**

#### 7.2 核心思想：不要直接研究神经元，而是学习新的基

```
原始神经元空间（多义性严重）：
Neuron 42 = 0.3×"苹果" + 0.5×"红色" + 0.2×"圆形" + ...

SAE特征空间（追求单义性）：
Feature 101 = "苹果" (纯度95%)
Feature 202 = "红色" (纯度98%)
Feature 303 = "DNA序列" (纯度99%)
```

#### 7.3 SAE架构

```
输入: 残差流激活 x (维度 d=768)
         ↓
    Encoder: W_enc (维度 d×m, m>>d, 例如 m=12288)
         ↓
    激活函数: ReLU (强制稀疏性)
         ↓
    特征激活 f (维度 m, 但只有~50个非零)
         ↓
    Decoder: W_dec (维度 m×d)
         ↓
重构: x̂ ≈ x
```

**训练目标**：
$$\mathcal{L} = \underbrace{\|x - \hat{x}\|^2}_{\text{重构误差}} + \lambda \underbrace{\|f\|_1}_{\text{稀疏性惩罚}}$$

#### 7.4 惊人结果：70%的特征是人类可解释的！

**实际发现的特征示例**（来自Claude Sonnet）：

| 特征ID | 含义 | 激活示例 |
|--------|------|----------|
| #142 | 阿拉伯文字 | 当文本包含阿拉伯语时激活 |
| #891 | DNA motifs | 看到ATCG序列时激活 |
| #2341 | "引用中文" | 在中文引号内激活 |
| #5672 | "Base64编码" | 识别Base64字符串 |
| #9012 | " harmful request" | 检测有害请求 |

#### 7.5 四重验证方法

Anthropic非常严谨，使用四种方法验证特征质量：

1. **人工标注一致性**：多个标注者对同一特征的判断一致
2. **解码器行对齐**：特征方向与最大激活样本对齐
3. **对抗性片段测试**：特征不会对无关输入虚假激活
4. **因果干预**：修改特征激活确实改变模型行为

---

### 8️⃣ 第六层整合：Circuit Tracing与Attribution Graphs

#### 8.1 论文：*Circuit Tracing: Revealing Computational Graphs in Language Models* (2025)

**这是目前最完整的系统框架！**

#### 8.2 从特征到电路：连接孤岛

有了SAE特征后，下一个问题是：
> "这些特征之间如何相互作用来完成某个任务？"

**答案：构建归因图（Attribution Graphs）！**

#### 8.3 技术栈：Cross-Layer Transcoders

**问题**：每层训练独立的SAE会导致跨层不一致

**解决方案：Cross-Layer Transcoder（跨层转码器）**

```
传统SAE（逐层独立）：
Layer 5: SAE_5 → features_5 (特征空间A)
Layer 6: SAE_6 → features_6 (特征空间B)  ← 与A不对齐！

Cross-Layer Transcoder（联合优化）：
Layer 5 ──→ Transcoder ──→ Layer 6
         ↑              ↑
    共享特征字典     跨层一致的解释
```

#### 8.4 归因图的构建流程

**Step 1**: 运行模型，收集各层transcoder特征激活

**Step 2**: 计算Jacobian归因（反向传播变体）

```python
def compute_attribution(target_feature, source_feature):
    """
    计算source_feature对target_feature的影响强度
    使用Jacobian矩阵的链式法则
    """
    # ∂(target_feature activation) / ∂(source_feature activation)
    jacobian = compute_jacobian(model, target_feature, source_feature)
    
    # 归一化得到归因分数
    attribution = normalize(jacobian * source_activation)
    return attribution
```

**Step 3**: 过滤弱连接，保留强因果关系

**Step 4**: 可视化为有向图

#### 8.5 归因图示例


**案例：回答"Austin的首府是哪里？"**

```
输入: "Dallas is a city in Texas. What is the capital of Texas?"

归因图显示的计算路径:

[capital] ──→ [say capital] ──┐
                                ├─→ [say Austin] → 输出
[state] ───→ [Texas] ──────────┘
[Dallas] ──→ (抑制干扰)
```

#### 8.6 图的操作与分析

** Supernodes（超节点）分组**：
- 将语义相关的特征聚合成组
- 例如：所有与"多语言"相关的特征组成一个supernode

**因果干预验证**：
```python
## 假设：feature_X 导致 feature_Y
## 实验：激活 feature_Y，看 output 是否按预期变化

original_output = model(prompt)
intervened_output = model.intervene(
    prompt, 
    activate_feature="capital_detector",
    position=-1
)

assert "Austin" in intervened_output  # 验证因果假设
```

---

### 9️⃣ 第七层完善：Tracing Attention Computation (QK Attributions)

#### 9.1 论文：*Tracing Attention Computation Through Feature Interactions* (2025)

**您提供的链接对应的正是这篇最新文章！**

#### 9.2 之前的空白：OV电路 vs QK电路

在之前的归因图中，有一个明显的缺失：

```
❌ 旧版归因图能显示：
   "Sally"特征从位置1被复制到位置4（通过Head #7）
   
❌ 但不能解释：
   "为什么Head #7选择了位置1而不是位置2或3？"
```

**这就是QK电路要回答的问题！**

#### 9.3 QK归因方法

##### 9.3.1 注意力分数已经是双线性交互

对于头 $h$，从query位置 $q$ 到key位置 $k$ 的预softmax分数：

$$s_h(q, k) = \frac{(W_Q^h x_q)^T (W_K^h x_k)}{\sqrt{d_h}} = \frac{x_q^T W_{QK}^h x_k}{\sqrt{d_h}}$$

**关键性质**：这是**双线性的**！
- 固定key时，对query是线性的
- 固定query时，对key是线性的

##### 9.3.2 分解为特征间交互

将 $x_q$ 和 $x_k$ 用SAE特征表示：

$$x_q = \sum_i f_q^i \tilde{e}_i, \quad x_k = \sum_j f_k^j \tilde{e}_j$$

则注意力分数变为：

$$s_h(q,k) = \sum_{i,j} \underbrace{f_q^i \cdot f_k^j}_{\text{特征激活乘积}} \cdot \underbrace{\frac{\tilde{e}_i^T W_{QK}^h \tilde{e}_j}{\sqrt{d_h}}}_{\text{特征间的QK权重}}$$

**直观解释**：
```
注意力分数 = Σ (query位置的特征i激活) × (key位置的特征j激活) × (特征i和j在该头中的兼容性)
```

##### 9.3.3 QK归因的实际应用

**案例：Induction Prompt分析**

```
Prompt: "I always loved visiting Aunt Sally. Whenever I was feeling sad, Aunt"
                                                    ↑
                                              当前位置(query)
```

**QK归因揭示**：

| Query位置特征 | Key位置特征 | QK权重 | 解读 |
|---------------|-------------|--------|------|
| "Aunt" (语法) | "Aunt" (第1次出现) | 高 (+2.3) | 语法模式匹配 |
| "续写期望" | "Sally" (跟在第1个Aunt后) | 中 (+0.8) | 间接关联 |
| "sad"情绪 | "loved"情感 | 低 (-0.1) | 不相关 |

**结论**：该头主要通过**精确的词汇匹配**来决定注意位置。

#### 9.4 完整的三元组解释框架

现在我们可以完整回答三个问题：

```
┌─────────────────────────────────────────────────────────────┐
│                    完整的注意力解释                          │
│                                                             │
│  ① 哪些特征在通信？                                         │
│     → OV归因：显示信息内容                                  │
│                                                             │
│  ② 哪些头在传递消息？                                       │
│     → Head-level attribution：显示传输通道                  │
│                                                             │
│  ③ 为什么头选择了特定的源位置？                              │
│     → QK归因：显示选择的依据 ⭐ 新增！                      │
│                                                             │
│  三者结合 = 对注意力机制的完整因果解释                       │
└─────────────────────────────────────────────────────────────┘
```

#### 9.5 QK Diagonalization（QK对角化）

**前沿进展**：进一步简化QK分析

**思想**：找到一组基，使得 $W_{QK}^h$ 接近对角阵

$$W_{QK}^h \approx V \Lambda V^T$$

这样每个特征维度**独立地**贡献于注意力分数，无需考虑交叉项。

**实践价值**：
- 大幅降低分析复杂度
- 更清晰的"特征偏好"解释
- 为设计更可解释的架构提供指导

---

### 🔟 完整技术栈总结与应用案例

#### 10.1 技术栈全景图

```
Layer 7: 可视化与自然语言解释
   ├── HeadVis (交互式注意力头可视化)
   ├── Natural Language Autoencoders (用自然语言解释激活)
   └── Activation Oracles (模型自我报告内部状态)
         ↑
Layer 6: 电路级分析
   ├── Attribution Graphs (归因图)
   ├── QK Attributions (注意力模式解释)
   └── Causal Interventions (因果干预验证)
         ↑
Layer 5: 特征级表示
   ├── Sparse Autoencoders (单层)
   ├── Cross-Layer Transcoders (跨层)
   └── Sparse Crosscoders (跨模型)
         ↑
Layer 4: 理论基础
   ├── Superposition Theory (叠加态理论)
   ├── Feature Geometry (特征几何)
   └── Interference Analysis (干扰分析)
         ↑
Layer 3: 架构理解
   ├── Residual Stream Framework (残差流框架)
   ├── QK/OV Circuit Decomposition (QK/OV分解)
   └── Path Patching (路径补丁)
         ↑
Layer 2: 基础现象
   ├── Induction Heads (归纳头)
   ├── In-Context Learning (上下文学习)
   └── Phase Transitions (训练相变)
         ↑
Layer 1: 工具基础
   ├── TransformerLens (模型分析库)
   ├── Activation Patching (激活补丁)
   └── Linear Probing (线性探测)
```

#### 10.2 经典应用案例集锦

##### 案例1：多步推理（Multi-step Reasoning）

**任务**："德克萨斯州的首府是奥斯汀"

**发现的电路**：
```
Step 1: [state]特征检测 → 激活[Texas]实体
Step 2: [capital]关系特征 → 查询知识库
Step 3: [地理知识]特征 → 检索[Austin]
Step 4: [答案格式化] → 生成"say Austin"
```

**可视化**：

##### 案例2：诗歌韵律规划（Planning in Poems）

**任务**：完成押韵诗句

**发现**：模型在生成前就**提前规划**了韵脚！

```
输入: "I thought that I would never see"
       "A poem lovely as a ___"

电路显示：
- 在处理"see"时就激活了[tree/rhyme_with_see]特征
- 该特征持续影响后续生成
- 最终选择"tree"（而非其他合理词）
```

##### 案例3：多语言电路（Multilingual Circuits）

**发现**：存在**语言通用的抽象概念** + **语言特定的表层形式**

```
英文 "hello" ──→ [greeting概念] ←── 中文 "你好"
                    ↓
               [response策略]
                    ↓
          英文: "hi there"
          中文: "您好呀"
```

##### 案例4：安全拒绝（Refusals）

**发现**：存在专门的[harmful_request]检测特征

```
用户输入: "How to make a bomb?"
         ↓
[harmful_request] 特征激活 (在多个层中)
         ↓
[refusal] 特征激活 → 输出拒绝回答
```

---

### 11️⃣ 学习路线图与资源推荐

#### 11.1 推荐学习顺序（从易到难）

1. **入门**：阅读 Anthropic 官方博客文章（非技术摘要）
2. **基础**：学习 TransformerLens 库的使用
3. **核心论文**（按顺序）：
   - *A Mathematical Framework for Transformer Circuits* (2021)
   - *In-Context Learning and Induction Heads* (2022)
   - *Toy Models of Superposition* (2022)
   - *Towards Monosemanticity* (2023)
   - *Scaling Monosemanticity* (2024)
   - *Circuit Tracing* (2025)
   - *Tracing Attention Computation* (2025)
4. **实践**：在开源模型（如 GPT-2 Small、Pythia）上复现 SAE 训练和归因分析
5. **进阶**：参与 Anthropic 的开放研究项目或社区讨论

#### 11.2 核心资源列表

- **官方博客**：[Transformer Circuits Thread](https://transformer-circuits.pub/)
- **代码库**：
  - [TransformerLens](https://github.com/neelnanda-io/TransformerLens) (Neel Nanda)
  - [Anthropic SAE 实现](https://github.com/anthropics/SAE)
- **数据集**：Anthropic 发布的特征标注数据集
- **社区**：AlignmentForum、LessWrong 上的相关讨论

#### 11.3 关键概念速查表

| 术语 | 含义 |
|------|------|
| Residual Stream | 残差流，模型内部共享的工作空间 |
| QK Circuit | 决定注意力分布的子电路 |
| OV Circuit | 决定信息转换的子电路 |
| Induction Head | 实现模式复制和上下文学习的注意力头 |
| Superposition | 用少于概念数的维度表示更多特征 |
| Sparse Autoencoder | 学习单义特征表示的自编码器 |
| Attribution Graph | 特征间因果关系的可视化图 |
| Transcoder | 跨层映射特征表示的工具 |
| QK Attribution | 解释注意力选择原因的技术 |

---

> **结语**：Anthropic 的大模型可解释性系统不仅是一套技术工具，更是一种思维方式——将神经网络视为可理解的计算图，通过严格的因果实验逆向工程其内部算法。随着这些方法的成熟，我们正逐步将"黑盒"转变为"玻璃盒"，为AI安全和对齐奠定科学基础。

## Anthropic最新可解释性工具框架：从原始组件到特征级电路的系统解析
