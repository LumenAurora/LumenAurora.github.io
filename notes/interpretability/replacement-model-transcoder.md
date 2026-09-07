---
title: "替换模型与 Cross-Layer Transcoder：把 MLP 和 Attention 拆开看"
date: 2026-08-28
category: "机制可解释性"
tags:
  - "可解释性"
  - "替换模型"
  - "Transcoder"
  - "CLT"
  - "LORSA"
description: "Anthropic 近年把「直接分析神经元」推进为「用训练好的替换模型替代原组件」：MLP 被 Cross-Layer Transcoder 替代、Attention 被 Multi-Token Transcoder / LORSA 替代，最终得到 Complete Replacement Mode……"
---

# 替换模型与 Cross-Layer Transcoder：把 MLP 和 Attention 拆开看

> Anthropic 近年把「直接分析神经元」推进为「用训练好的替换模型替代原组件」：MLP 被 Cross-Layer Transcoder 替代、Attention 被 Multi-Token Transcoder / LORSA 替代，最终得到 Complete Replacement Model。本文讲这套替换思想的动机、架构与学到的内容。

### 🎯 核心思想：用"替换模型"打开黑盒

**根本策略**：不直接分析原始的opaque组件，而是训练**功能等价但内部透明的替换模块**，然后在这些透明模块上构建完整的计算图。

---

### 📦 第一部分：原始组件 vs 替换组件对照表

#### 1.1 完整映射关系

| 原始Transformer组件 | 功能 | 替换为 | 替换组件的本质 |
|-------------------|------|--------|--------------|
| **MLP层** | 非线性变换残差流 | **Cross-Layer Transcoder (CLT)** | 输入→稀疏特征→输出的可解释函数 |
| **Attention层** | 跨位置信息搬运 | **Multi-Token Transcoder (MTC)** 或 **LORSA** | 特征级的QK匹配+OV搬运 |
| **残差流向量** [768维] | 信息载体 | **SAE特征空间** [~15000维] | 单义概念的稀疏组合 |
| **神经元激活值** | 原子单位 | **特征激活值** | 可解释的概念强度 |

#### 1.2 为什么需要"替换"而非直接分析？

**问题**：原始组件内部是dense、polysemantic的
- MLP：$y = \text{ReLU}(xW_1 + b_1)W_2 + b_2$ → 所有神经元混杂
- Attention：$A = \text{softmax}(QK^T/\sqrt{d})V$ → Q/K/V都是混合表示

**解决方案**：训练一个**外部观察者模块**，它：
1. **行为上等价**：输入相同→输出几乎相同（重建误差<5%）
2. **结构上透明**：中间过程是稀疏的、单义的特征
3. **数学上可微**：可以反向传播计算归因

---

### 🔧 第二部分：MLP → Cross-Layer Transcoder (CLT)

#### 2.1 传统SAE vs Transcoder的关键区别

##### ❌ 标准SAE的问题
```
输入: x_MLP_output [768维]
    ↓
SAE编码器: f = ReLU(x · W_enc)  [15000维稀疏]
    ↓
SAE解码器: x' = f · W_dec ≈ x  [重建同一个x]
```
**只回答**："输出中存在哪些特征？"  
**无法回答**："哪个输入特征导致了哪个输出特征？"

##### ✅ Transcoder的革命性改进
```
输入: x_in [Layer L的残差流]
    ↓
Transcoder编码器: f = ReLU(x_in · W_enc + b_enc) [稀疏特征]
    ↓
Transcoder解码器: y_out = f · W_dec + b_dec ≈ MLP(x_in) [Layer L+1的残差流]
```
**回答**："MLP执行了什么计算，用特征语言如何表达？"

#### 2.2 CLT的具体架构（Cross-Layer版本）

**为什么叫"Cross-Layer"？**
- 不是在同一层内重建
- 而是**跨层建模**：Layer L 的输出 → Layer L+1 的输入
- 这自然包含了该层的MLP计算（以及部分residual connection）

**架构细节**：

```python
class CrossLayerTranscoder:
    def __init__(self, d_model=768, n_features=12288, expansion=16):
        # 编码器：将残差流映射到高维稀疏特征空间
        self.W_enc = nn.Linear(d_model, n_features, bias=True)  # [768 × 12288]
        
        # 解码器：将稀疏特征映射回残差流空间
        self.W_dec = nn.Linear(n_features, d_model, bias=False)  # [12288 × 768]
        
        # 关键：decoder行被约束为单位向量（防止退化解）
        self._normalize_decoder_rows()
    
    def forward(self, x_residual):
        # x_residual: [seq_len, d_model] 某个token位置的残差流
        
        # Step 1: 编码为稀疏特征
        features = F.relu(self.W_enc(x_residual))  # [seq_len, 12288]
        # 大部分feature值为0，只有少数激活
        
        # Step 2: 解码为下一层的残差流
        next_residual = features @ self.W_dec  # [seq_len, 768]
        
        return next_residual, features
```

**训练目标**：
$$\mathcal{L} = \underbrace{\|\text{CLT}(x_L) - x_{L+1}^{\text{true}}\|^2}_{\text{重建误差}} + \lambda \underbrace{\|f\|_1}_{\text{稀疏性}}$$

其中 $x_{L+1}^{\text{true}} = x_L + \text{MLP}_L(\text{Attn}_L(x_L))$ 是真实的下一层残差流。

#### 2.3 CLT学到了什么？（具体例子）

**在GPT-2 Small第6层训练后发现的特征**：

| Feature ID | 激活条件 | 功能解释 | 对应的MLP计算 |
|-----------|---------|---------|-------------|
| #142 | 当前token是阿拉伯文字 | 检测脚本类型 | 将"阿拉伯文"信号增强写入残差流 |
| #893 | 上下文包含DNA序列 | 识别生物学术语 | 添加"这是生物学文本"标记 |
| #3421 | 前一个token是引号开始 | 追踪语法状态 | 写入"当前在引号内"特征 |
| #7890 | 数字后跟运算符 | 识别算式模式 | 准备进行数学推理 |

**关键洞察**：每个feature对应MLP的一个**原子计算单元**，而不是一个静态表示。

#### 2.4 从CLT到Replacement Model（替换模型）

**完整流程**：

```
原始模型:
Token Embeddings → Layer0 → Layer1 → ... → Layer17 → LM Head → Logits
                  ↑Attn↑MLP  ↑Attn↑MLP       ↑Attn↑MLP

替换模型:
Token Embeddings → [CLT₀] → [CLT₁] → ... → [CLT₁₇] → LM Head → Logits
                 (替换MLP) (替换MLP)       (替换MLP)
                 Attn保持原样              Attn保持原样
```

**局部替换模型（Local Replacement Model）**：
- 只替换**特定层**的MLP为CLT
- 其他层保持原始模型
- 用于**定位**哪一层对某行为最重要

---

### 🔄 第三部分：Attention → Multi-Token Transcoder (MTC) / LORSA

#### 3.1 Attention的特殊挑战

**为什么Attention比MLP更难解释？**

标准Attention计算：
$$\text{Attn}(X) = \text{softmax}\left(\frac{XW_Q (XW_K)^T}{\sqrt{d}}\right) XW_V$$

**三大难点**：
1. **多token交互**：每个位置的注意力取决于**所有位置**的key
2. **非线性softmax**：不是简单的线性变换
3. **QK耦合**：where和what纠缠在一起

#### 3.2 Multi-Token Transcoder (MTC) 的架构创新

**核心思想**：不要试图重建单个token的激活，而是**重建整个context window上的attention computation**

**三组件架构**：

```python
class MultiTokenTranscoder:
    def __init__(self, d_model, n_heads, n_features_per_head):
        # 组件1: Token-by-token特征提取（类似SAE）
        self.token_encoder = ...  # 每个token独立编码
        
        # 组件2: Context-level聚合（处理跨token依赖）
        self.context_aggregator = ...  # 在sequence维度聚合
        
        # 组件3: Attention pattern重建
        self.attention_reconstructor = ...  # 输出近似的attention权重和value
```

**MTC的关键特性**：
- **输入**：完整的残差流序列 $X \in \mathbb{R}^{T \times d}$
- **输出**：近似的attention output $\tilde{Y} \in \mathbb{R}^{T \times d}$
- **中间表示**：features are "**carried** by linear combinations"

#### 3.3 LORSA (Low-Rank Sparse Attention)：更彻底的分解

**LORSA的核心思想**：
> 将原来的8-32个dense attention heads，替换为**数百个sparse、specialized的mini-heads**

**架构对比**：

```
原始Multi-Head Attention:
┌─────────────────────────────────────┐
│  Head 1: Q₁K₁ᵀ → softmax → V₁      │  ← dense, polysemantic
│  Head 2: Q₂K₂ᵀ → softmax → V₂      │
│  ...                                │
│  Head 8: Q₈K₈ᵀ → softmax → V₈      │
│  Concat + Output Projection         │
└─────────────────────────────────────┘

LORSA Replacement:
┌─────────────────────────────────────┐
│  Mini-Head 1: "prev_token_copier"   │  ← sparse, monosemantic
│  Mini-Head 2: "induction_detector"  │
│  Mini-Head 3: "subject_copying"     │
│  ... (hundreds of heads)            │
│  Low-rank combination               │
└─────────────────────────────────────┘
```

**LORSA的训练目标**：
$$\min_{\Theta} \|\text{LORSA}(X) - \text{MHSA}(X)\|^2 + \lambda_{\text{sparse}} \| \cdot \|_0 + \lambda_{\text{low-rank}} \text{rank}(\cdot)$$

**LORSA发现的新头类型**（在Llama-3.1-8B上）：

| 头类型 | 功能 | 对应的QK特征 | OV特征 |
|-------|------|------------|--------|
| Induction Head v2 | 更干净的归纳复制 | `prev(X)` 匹配 `current(X)` | 复制X的语义 |
| Arithmetic Adder | 专门处理加法 | `number_A` + `operator_+` | 输出`sum_feature` |
| Successor Head v2 | 后继token预测 | `token_t` 匹配 `next(t)` | 复制下一token |
| Sink Head | 总是关注BOS | `is_BOS` 高优先级 | 传递起始信息 |

#### 3.4 Complete Replacement Model (CRM)：终极方案

**2026年的突破**：将CLT（替MLP）+ LORSA/MTC（替Attention）结合

```
完全替换模型:
Layer L:
  ┌─ Original Attention ──┐    ┌─ LORSA/MTC ──────────────┐
  │  MHSA (black box)     │ →  │  Hundreds of sparse heads│
  │  Q,K,V dense mixed    │    │  Each head = 1 feature   │
  └───────────────────────┘    └───────────────────────────┘
  
  ┌─ Original MLP ────────┐    ┌─ CLT ─────────────────────┐
  │  Dense nonlinear      │ →  │  Sparse features          │
  │  Polysemantic neurons │    │  Input→Feature→Output     │
  └───────────────────────┘    └───────────────────────────┘
```

**结果**：模型的**每一个计算单元**都被替换为可解释的特征！

---
