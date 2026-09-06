---
title: "电路分析前沿：Transcoder、DAS 与综合工作流"
date: 2026-08-28
category: "机制可解释性"
tags:
  - "可解释性"
  - "Transcoder"
  - "DAS"
  - "工具链"
  - "选型"
description: "本篇覆盖穿透 MLP 黑盒的 Transcoder 与 Cross-Layer Transcoder、基于因果抽象的分布式对齐搜索（DAS），并给出把这些方法串起来的综合工作流、工具与上手路径，以及一份方法选型速查表。"
---

# 电路分析前沿：Transcoder、DAS 与综合工作流

> 本篇覆盖穿透 MLP 黑盒的 Transcoder 与 Cross-Layer Transcoder、基于因果抽象的分布式对齐搜索（DAS），并给出把这些方法串起来的综合工作流、工具与上手路径，以及一份方法选型速查表。

### 九、Transcoder 与 Cross-Layer Transcoder：穿透 MLP 的黑盒

#### 动机

SAE 有个根本局限：它只分解"激活是什么"，不分解"MLP 在算什么"。SAE 挂在 MLP 输出上，告诉你输出了哪些特征，但**不告诉你这些特征是怎么从输入算出来的**。

这意味着：电路分析在追踪信息流时，遇到 MLP 就断了——MLP 是非线性黑盒，无法线性追踪。Transcoder 就是为打通 MLP 而生。

#### 原理

**Transcoder 是改版的 SAE**：它不重建同一个激活，而是**从 MLP 输入预测 MLP 输出**：

$$\mathbf{y}_{\text{out}} \approx W_{\text{dec}} \cdot \text{ReLU}(W_{\text{enc}} \mathbf{x}_{\text{in}} + \mathbf{b}_{\text{enc}}) + \mathbf{b}_{\text{dec}}$$

其中 $\mathbf{x}_{\text{in}}$ 是进入 MLP 的残差流，$\mathbf{y}_{\text{out}}$ 是 MLP 原本会输出的值。Transcoder 学到的是"MLP 在算什么函数"，用稀疏特征表达。

#### SAE vs Transcoder 的关键区别

| | SAE | Transcoder |
|---|---|---|
| 输入 | MLP 输出 $\mathbf{h}$ | MLP 输入 $\mathbf{x}_{\text{in}}$ |
| 输出 | 重建 $\mathbf{h}$ | 预测 MLP 输出 $\mathbf{y}_{\text{out}}$ |
| 回答的问题 | "这层表示了什么？" | "这层计算了什么？" |
| 电路追踪 | 只能在层间追踪 | 可以穿透 MLP 追踪 |

#### Cross-Layer Transcoder（CLT）

Anthropic 2025 年的 Circuit Tracing 工作把 Transcoder 推到新高度：**Cross-Layer Transcoder（CLT）** 的每个特征不只预测当前层 MLP 输出，而是预测**所有后续层**的 MLP 输出。

CLT 的特征数等于模型层数 $L$。它学到的是"这个输入特征如何影响后续所有层的计算"。这使得电路可以跨层追踪，而无需每层单独训一个 Transcoder。

#### 归因图

有了 CLT，就可以构造**归因图**：

1. 用 CLT 替换模型的 MLP，得到"替换模型"。
2. 冻结注意力模式和归一化分母（让特征间交互近似线性）。
3. 节点是：激活的 CLT 特征、输入 token、误差节点、输出 logit。
4. 边是节点间的线性效应。
5. 剪枝：只保留贡献超过阈值的边。
6. 把相似特征聚合成"supernode"，方便人读。

#### 伪代码

```python
## 1. 训练 CLT（每个 MLP 用 CLT 替换）
clt = CrossLayerTranscoder(n_layers=model.cfg.n_layers,
                            d_model=model.cfg.d_model,
                            d_features=N_FEATURES)
## 训练目标：CLT(MLP 输入) ≈ MLP 输出（所有后续层）
for batch in dataset:
    _, cache = model.run_with_cache(batch)
    mlp_inputs  = [cache[f"blocks.{l}.hook_resid_pre"] for l in range(L)]
    mlp_outputs = [cache[f"blocks.{l}.hook_mlp_out"]   for l in range(L)]
    pred = clt(mlp_inputs)  # 预测每层 MLP 输出
    loss = sum((pred[l] - mlp_outputs[l])**2 for l in range(L)) + l1(clt.features)
    loss.backward(); opt.step()

## 2. 构造归因图（对特定 prompt）
def build_attribution_graph(model, clt, prompt):
    tokens = model.to_tokens(prompt)
    # 用 CLT 替换所有 MLP，跑前向，缓存特征激活
    with replace_mlps_with_clt(model, clt):
        logits, feat_cache = run_and_cache_features(tokens)
    # 冻结 attention pattern，对每个 logit 算梯度
    target_logit = logits[0, -1, :].argmax()
    logits[0, -1, target_logit].backward()
    # 节点 = 激活的特征；边 = 梯度 × 激活差
    nodes = [f for f in feat_cache if f.activation > 0]
    edges = [(u, v, grad_product) for ... ]
    # 剪枝
    graph = prune(edges, threshold=T)
    return graph
```

#### 局限

- 训练 CLT 极其昂贵（Anthropic 在 Claude 3.5 Haiku 上需要大规模工程）。
- CLT 会学出"不忠实的电路"——为了降低重构损失，它可能用与原模型不同的计算路径。
- 死特征问题依旧。

---

### 十、Distributed Alignment Search（DAS）：基于因果抽象的电路发现

#### 动机

前面所有方法都是"自下而上"：先有模型，再去发现它内部有什么电路。DAS 走相反路线——"自上而下"：先定义一个**可解释的高层因果模型**，再去模型里找"哪里实现了这个高层变量"。

它基于**因果抽象**理论：一个复杂模型是否"忠实实现"了一个简单可解释模型？

#### 核心概念：Interchange Intervention

假设你有个高层模型，它有个变量 $Z$（比如"是否相等"）。你想测试神经网络的某个内部表示 $\mathbf{h}$ 是否对应 $Z$。

**交换干预**：取两个输入 $x_1, x_2$，它们在 $Z$ 上取值不同。把 $\mathbf{h}(x_1)$ 替换成 $\mathbf{h}(x_2)$，看模型输出是否变成"对应 $x_2$ 的 $Z$ 值"的输出。如果是，说明 $\mathbf{h}$ 确实编码了 $Z$。

#### 分布式对齐的难点

朴素做法是暴力搜索：试每个神经元、每个子空间，看哪个对齐 $Z$。但有两个问题：

1. 计算不可行（组合爆炸）。
2. **预设神经元是对齐的**——但叠加意味着一个神经元可能编码多个变量，需要对齐到**非标准基**下的子空间。

#### DAS 的解法

DAS 用**梯度下降**学一个**旋转矩阵** $R$，把内部表示旋转到一个基，使得在这个基下，某个子空间正好对齐 $Z$：

1. 选定要干预的层和子空间维度 $k$。
2. 初始化可学习的旋转矩阵 $R$。
3. 对每个输入对 $(x_1, x_2)$：
   - 算 $\mathbf{h}(x_1)$，旋转：$\tilde{\mathbf{h}} = R \mathbf{h}(x_1)$。
   - 把 $\tilde{\mathbf{h}}$ 的前 $k$ 维替换成 $R \mathbf{h}(x_2)$ 的前 $k$ 维。
   - 旋转回去：$\mathbf{h}' = R^{-1} \tilde{\mathbf{h}}'$。
   - 继续前向，得到输出。
4. 损失：干预后的输出与"高层模型预测的输出"的差异。
5. 反向传播更新 $R$。

当损失降到 0，说明找到了完美对齐——这个子空间（在旋转后的基下）确实编码了 $Z$。

#### 度量：Interchange Intervention Accuracy（IIA）

IIA = 干预后模型输出与高层模型预测一致的比例。IIA = 100% 表示完美抽象。

#### Boundless DAS

原始 DAS 还要人工指定子空间维度 $k$。Boundless DAS 把 $k$ 也变成可学习参数，进一步自动化，并扩展到 7B 参数的 Alpaca 模型。

#### 伪代码

```python
import torch.nn as nn

class DASIntervention(nn.Module):
    def __init__(self, d_model, k):
        super().__init__()
        self.R = nn.Parameter(torch.randn(d_model, d_model))  # 旋转矩阵
        self.k = k  # 干预的子空间维度
    def forward(self, base_h, source_h):
        # base_h: 基础输入的隐藏状态
        # source_h: 来源输入的隐藏状态（要交换的值的来源）
        base_rot   = base_h   @ self.R
        source_rot = source_h @ self.R
        # 交换前 k 维
        base_rot[..., :self.k] = source_rot[..., :self.k]
        # 旋转回去
        return base_rot @ self.R.inverse()

def train_das(model, layer, high_level_model, dataset, k=4):
    intervention = DASIntervention(model.cfg.d_model, k)
    opt = torch.optim.Adam(intervention.parameters())
    for x_base, x_source in dataset:
        # 1. 算两个输入在 layer 的隐藏状态
        _, cache_base   = model.run_with_cache(x_base, names_filter=[layer])
        _, cache_source = model.run_with_cache(x_source, names_filter=[layer])
        h_base   = cache_base[layer]
        h_source = cache_source[layer]
        # 2. 干预
        h_patched = intervention(h_base, h_source)
        # 3. 继续前向（用 patched h）
        logits = model.forward_with_patched_activation(x_base, layer, h_patched)
        # 4. 高层模型预测（交换后应该是什么）
        target = high_level_model.predict_after_swap(x_base, x_source)
        # 5. 损失
        loss = cross_entropy(logits, target)
        opt.zero_grad(); loss.backward(); opt.step()
    # IIA
    iia = evaluate_iia(...)
    return intervention, iia
```

#### 局限

- 需要预先知道"高层模型"是什么——不能像 SAE 那样无监督发现。
- MIB 基准显示 DAS 在因果变量定位上表现最好，但"DBM on SAE features"反而不如标准维度，提示 SAE 特征不一定是因果变量的最佳单元。

---

### 十一、综合工作流：如何把这些方法串起来

现代 LLM 电路分析的标准流程是"**观察 → 因果干预 → 特征级分解 → 验证**"四步：

```
1. 观察阶段
   - Logit Lens / Tuned Lens：看每层预测如何演化
   - 注意力模式可视化：看头在看哪
   - Direct Logit Attribution：看每个头/MLP 直接写多少给 logits
   
2. 因果干预（头级）
   - Attribution Patching（EAP）：2 前向 + 1 反向，粗筛所有边
   - Activation Patching：对 top 候选精修，确认因果贡献
   - Path Patching：厘清头间层级关系
   - ACDC：自动化贪心剪边，得到稀疏子图
   
3. 特征级分解
   - 训练 SAE（或 Transcoder/CLT）分解每层激活
   - Sparse Feature Circuits：在 SAE 特征上重做 attribution patching
   - 或用 CLT 构造归因图，跨层追踪
   
4. 验证与应用
   - Causal Scrubbing：形式化验证电路假设
   - Faithfulness / Completeness / Minimality 三准则
   - Feature Steering：消融/增强特征，验证因果可控性
   - DAS：自上而下验证"模型是否实现了某个算法"
```

#### 评估三准则

- **Faithfulness（忠实性）**：只保留电路、消融其他部分，电路能否复现模型行为？
- **Completeness（完备性）**：电路是否包含了所有必要节点？
- **Minimality（最小性）**：电路是否没有冗余节点？

IOI 电路揭示了一个反直觉现象：**Negative Name Mover Heads** 主动**反对**任务（贡献为负），却是电路的一部分——它们在做"损失对冲"，降低错误预测的置信度。还有 **Backup Name Movers**：消融主 Name Movers 后，原本安静的备份头会激活补偿。这让"最小性"变得模糊：备份头算不算电路的一部分？

---

### 十二、工具与上手路径

#### 推荐工具栈

| 工具 | 用途 | 特点 |
|---|---|---|
| **TransformerLens** | 激活缓存、patching、hook 系统 | 入门首选，支持 15000+ 模型 |
| **nnsight** | 因果干预、大规模模型 | 类似 TransformerLens，支持更大模型 |
| **SAELens** | 训练/加载 SAE | 与 TransformerLens 深度集成 |
| **Neuronpedia** | SAE 特征可视化 | 在线浏览已训练特征 |
| **circuit-tracer** | CLT 归因图 | Anthropic 方法的开源实现 |
| **pyvene** | DAS、干预实验 | Stanford 出品，支持多种干预 |

#### TransformerLens 核心三函数

```python
import transformer_lens as tl
model = tl.HookedTransformer.from_pretrained("gpt2-small")

## 1. run_with_cache：缓存激活
logits, cache = model.run_with_cache(tokens)

## 2. run_with_hooks：干预前向
def my_hook(activation, hook):
    activation[:] = 0  # 消融
    return activation
logits = model.run_with_hooks(tokens, 
    fwd_hooks=[("blocks.5.attn.hook_z", my_hook)])

## 3. cache 的命名：blocks.{layer}.{component}.hook_{name}
## 例：blocks.0.attn.hook_q, blocks.0.hook_mlp_out, blocks.0.hook_resid_post
```

#### 推荐入门路径

1. **第一周**：装 TransformerLens，跑 GPT-2 Small，用 Logit Lens 看 "The capital of France is" 每层预测。
2. **第二周**：实现 IOI 任务的激活修补，复现"哪些头对识别间接宾语重要"。
3. **第三周**：用 TransformerLens 内置的 attribution patching，对比它与激活修补的速度与精度。
4. **第四周**：跑 ARENA 教程的 Chapter 1（Transformer Interpretability），里面有完整的 IOI + Path Patching 实现。
5. **进阶**：在 Neuronpedia 上浏览 GPT-2 Small 的 SAE 特征，理解什么是单语义特征；然后跑 Marks et al. 的 feature-circuits 代码，复现 Sparse Feature Circuits。
6. **前沿**：尝试 circuit-tracer 库，在 Gemma 或 Qwen 上构造 CLT 归因图。

#### 学习资源

- **ARENA**：动手训练，Chapter 1 完整覆盖 patching、IOI、SAE。
- **Learn Mech Interp**：系统教程网站，覆盖从基础到前沿的所有方法。
- **TransformerLens Demos**：官方 notebook，含 Activation Patching、Attribution Patching、Exploratory Analysis。
- **Anthropic Transformer Circuits Thread**：原始论文与博客，从数学框架到 Circuit Tracing。

---

### 十三、方法选型速查表

| 你想做什么 | 用什么方法 | 复杂度 | 精度 |
|---|---|---|---|
| 快速看模型每层在想什么 | Logit Lens / Tuned Lens | 极低 | 观察性 |
| 确认某个头是否因果重要 | Activation Patching | 高（每组件一次前向） | 金标准 |
| 快速筛几千条边 | Attribution Patching (EAP) | 极低（2前向+1反向） | 近似 |
| 厘清头间层级关系 | Path Patching | 中高 | 高 |
| 自动化找出稀疏子图 | ACDC | 高 | 高 |
| 验证电路假设是否正确 | Causal Scrubbing | 中 | 形式化 |
| 得到单语义节点 | SAE | 训练贵，推理快 | 中 |
| 在特征级做因果电路 | Sparse Feature Circuits | 中 | 中高 |
| 穿透 MLP 追踪计算 | Transcoder / CLT | 训练极贵 | 中高 |
| 自上而下验证算法实现 | DAS / Boundless DAS | 中 | 形式化 |

---

这些方法构成了一条从"看"到"改"再到"证"的完整链路。初学者从 Logit Lens 和 Activation Patching 切入，能在一周内获得对模型内部的具体直觉；往深处走，SAE 与 CLT 提供可解释的节点词汇表，Sparse Feature Circuits 与 DAS 提供因果严谨的电路发现与验证。整个领域的工具链正在快速收敛，但每种方法都有其适用边界与失败模式——理解这些边界，比记住公式更重要。
