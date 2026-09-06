---
title: "验证与破解叠加：Causal Scrubbing 与稀疏自编码器"
date: 2026-08-28
category: "机制可解释性"
tags:
  - "可解释性"
  - "SAE"
  - "稀疏自编码器"
  - "Causal Scrubbing"
  - "叠加"
description: "找到候选电路之后，如何严格验证它？又该如何处理「一个神经元对应多个概念」的叠加问题？本篇讲严格验证电路假设的 Causal Scrubbing、破解叠加的关键工具稀疏自编码器（SAE），以及把 SAE 与因果干预结合起来的 Sparse Feature Circuits。"
---

# 验证与破解叠加：Causal Scrubbing 与稀疏自编码器

> 找到候选电路之后，如何严格验证它？又该如何处理「一个神经元对应多个概念」的叠加问题？本篇讲严格验证电路假设的 Causal Scrubbing、破解叠加的关键工具稀疏自编码器（SAE），以及把 SAE 与因果干预结合起来的 Sparse Feature Circuits。

### 六、Causal Scrubbing：严格验证电路假设

#### 动机

你发现了"26 个头构成 IOI 电路"——但怎么证明这个解释是**对的**，而不只是个好听的故事？Wang et al. 提出三个准则，但执行很 ad hoc。Causal Scrubbing 给出一个**原则化的验证框架**。

#### 核心思想

**行为保持的重采样消融**。关键洞察：任何机制可解释性假设，本质上都在定义"哪些激活可以在不改变行为的前提下被重采样"。

具体地：假设你认为"头 $H$ 的功能是检测重复名字"。那么，对于两个输入 $x_1, x_2$，如果它们在"重复名字"这件事上等价（比如都是"John ... John"），那么把 $H$ 在 $x_1$ 上的激活替换成 $x_2$ 上的激活，**模型行为应该不变**。如果变了，说明你的假设错了——$H$ 还在做别的事。

#### 算法结构

Causal Scrubbing 用**树形递归**在计算图上做重采样：

1. 定义一个"等价关系"：哪些输入对，在假设下应该产生等价的激活。
2. 从输出往回递归：对每个节点，根据假设决定"它的哪些输入可以被重采样"。
3. 对每个被假设认为"无关"的输入，用从其他样本采样的激活替换。
4. 跑前向，看行为是否保持。

#### 度量

用一个归一化分数：

$$\text{LCS} = \frac{L_{\text{scrubbed}} - L_{\text{random}}}{L_{\text{model}} - L_{\text{random}}}$$

其中 $L_{\text{model}}$ 是原模型损失，$L_{\text{random}}$ 是随机模型损失，$L_{\text{scrubbed}}$ 是擦洗后损失。LCS 接近 1 表示假设充分解释了行为。

#### 应用案例

- **归纳头**：验证"这个头在实现 [A B ... A → B] 的复制"。
- **括号匹配**：验证"这个模型通过跟踪栈深度来判断括号是否平衡"。

#### 局限

- 假设必须人工给出，框架只负责验证。
- 树形重采样在深层模型上计算量大。
- "等价关系"的定义本身就是个开放问题。

---

### 七、稀疏自编码器（SAE）：破解叠加的关键工具

#### 动机

前面所有方法都在"头"或"MLP"粒度上操作，但这些都是多语义的——一个头同时干很多事。要得到真正可解释的电路节点，需要把激活**分解成单语义特征**。SAE 就是这个工具。

#### 原理

SAE 受神经科学"稀疏编码"假说启发。它的结构极简：一个编码器矩阵、一个 ReLU、一个解码器矩阵：

$$\mathbf{f}(\mathbf{x}) = \text{ReLU}(W_{\text{enc}} \mathbf{x} + \mathbf{b}_{\text{enc}})$$
$$\hat{\mathbf{x}} = W_{\text{dec}} \mathbf{f}(\mathbf{x}) + \mathbf{b}_{\text{dec}}$$

它把一个 $d_{\text{model}}$ 维激活（如 768 维）映射到一个**更宽**的 $d_{\text{SAE}}$ 维空间（如 4 倍宽，3072 维），但要求中间表示**稀疏**——大多数维度为 0。

关键点：SAE **不是**在编码同一个激活再解码回来（那是普通自编码器），而是在**更宽的字典**里找稀疏表示。每个 SAE 特征对应一个"字典原子"，理想情况下代表一个单一概念。

#### 训练损失

$$\mathcal{L} = \underbrace{\|\mathbf{x} - \hat{\mathbf{x}}\|_2^2}_{\text{重构损失}} + \lambda \underbrace{\|\mathbf{f}(\mathbf{x})\|_1}_{\text{稀疏惩罚}}$$

$\lambda$ 是关键超参，平衡重构精度与稀疏度。注意：**我们不直接优化可解释性**——可解释性是稀疏 + 重构的副产品。

#### 应用位置

SAE 可以挂在残差流、MLP 输出、注意力输出上。对 Pythia-70M，Marks et al. 给每层的这三种位置都训了 SAE。

#### 特征看板

训练完后，怎么看一个特征"代表什么"？标准做法：找出该特征激活最强的 top-k 数据样本，人工看它们的共性。比如某特征在"学术引用""HTTP 请求""韩文"上激活——它就是多语义的，SAE 没解开；如果只在"狗相关图片"上激活——它是单语义的。

#### 伪代码

```python
import torch
import torch.nn as nn

class SAE(nn.Module):
    def __init__(self, d_model, d_sae):
        super().__init__()
        self.W_enc = nn.Linear(d_model, d_sae)
        self.W_dec = nn.Linear(d_sae, d_model)
    def encode(self, x):
        return torch.relu(self.W_enc(x))
    def forward(self, x):
        f = self.encode(x)
        x_hat = self.W_dec(f)
        return x_hat, f

def train_sae(model, layer_name, d_sae, n_steps=10000, l1_lambda=0.01):
    sae = SAE(model.cfg.d_model, d_sae)
    opt = torch.optim.Adam(sae.parameters())
    for step in range(n_steps):
        # 1. 从数据集采 batch，跑模型，缓存 layer_name 的激活
        tokens = sample_batch()
        _, cache = model.run_with_cache(tokens, names_filter=[layer_name])
        x = cache[layer_name].flatten(0, 1)  # [batch*seq, d_model]
        # 2. SAE 前向
        x_hat, f = sae(x)
        # 3. 损失 = 重构 + L1
        recon_loss = ((x - x_hat) ** 2).mean()
        sparsity_loss = f.abs().mean()
        loss = recon_loss + l1_lambda * sparsity_loss
        # 4. 反向
        opt.zero_grad(); loss.backward(); opt.step()
    return sae
```

#### 局限

- SAE 误差 $\epsilon(\mathbf{x})$ 占方差 11–15%，意味着 SAE 没捕获到的部分不能忽略。
- 死特征：训练后很多特征永不激活。
- 特征质量依赖宽度与训练数据，跨模型不可迁移。
- SAE 只告诉你"这层有什么特征"，**不**告诉你"特征之间如何因果传递"——后者需要 Transcoder 或 Sparse Feature Circuits。

---

### 八、Sparse Feature Circuits：把 SAE 与因果干预结合

#### 动机

SAE 给了可解释的节点，激活修补给了因果工具。把它们结合，就得到**稀疏特征电路**：节点是 SAE 特征，边是特征间的因果影响。这是 Marks et al. 2024 的核心贡献。

#### 方法

关键想法：**把 SAE 特征视为模型计算图的一部分**。对每个隐藏状态 $\mathbf{x}$，用 SAE 分解：

$$\mathbf{x} = \hat{\mathbf{x}} + \epsilon(\mathbf{x}) = \sum_{i=1}^{d_{\text{SAE}}} f_i(\mathbf{x}) \mathbf{v}_i + \mathbf{b} + \epsilon(\mathbf{x})$$

其中 $f_i$ 是第 $i$ 个特征的激活值，$\mathbf{v}_i$ 是它的解码向量，$\epsilon$ 是 SAE 没捕获的误差。现在，模型计算图的节点变成了"某 token 位置上的某个 SAE 特征激活"或"误差项"。

#### 算法流程

1. **缓存激活**（Step 1）：跑模型，缓存所有 SAE 特征的激活值。
2. **算梯度**（Step 2）：反向传播度量 $m$，得到每个特征对 $m$ 的梯度。
3. **算节点 IE**（Step 3）：用 attribution patching 近似每个特征的间接效应，按阈值 $T_N$ 过滤。
4. **算边 IE**（Step 4）：用公式 (5) 算相邻特征间的边权重，按阈值 $T_E$ 过滤。

节点 IE 公式（attribution patching 近似）：

$$\widehat{\text{IE}}_{\text{atp}}(m; \mathbf{a}) = \nabla_{\mathbf{a}} m \cdot (\mathbf{a}_{\text{patch}} - \mathbf{a}_{\text{clean}})$$

边 IE 公式（上游 $u$ → 下游 $d$）：

$$\widehat{\text{IE}}(m; e) = \nabla_{\mathbf{d}} m \cdot \nabla_{\mathbf{u}} \mathbf{d} \cdot (\mathbf{u}_{\text{patch}} - \mathbf{u}_{\text{clean}})$$

#### 伪代码

```python
def sparse_feature_circuit(model, saes, dataset, metric, T_N=0.1, T_E=0.01):
    # dataset: contrastive pairs (x_clean, x_patch)
    node_effects = {}
    edge_effects = {}

    for x_clean, x_patch in dataset:
        # 1. 跑 clean + patch，缓存所有层激活 + SAE 特征
        _, clean_cache = model.run_with_cache(x_clean)
        _, patch_cache = model.run_with_cache(x_patch)
        clean_features = compute_sae_features(clean_cache, saes)  # dict[layer][feature] -> tensor
        patch_features = compute_sae_features(patch_cache, saes)

        # 2. 算 clean 的梯度（需 grad）
        clean_logits = model(x_clean)
        m = metric(clean_logits, x_clean)
        m.backward()
        clean_grads = extract_feature_grads(clean_features)  # ∇_a m

        # 3. 节点 IE
        for layer, feats in clean_features.items():
            for fid, a_clean in feats.items():
                a_patch = patch_features[layer][fid]
                a_grad  = clean_grads[layer][fid]
                ie = (a_grad * (a_patch - a_clean)).sum()
                node_effects[(layer, fid)] = node_effects.get((layer, fid), 0) + ie

        # 4. 边 IE（相邻层间，用 Jacobian-vector product）
        # ... 见 Marks et al. App. A.1

    # 5. 阈值过滤
    circuit_nodes = {n for n, ie in node_effects.items() if abs(ie) > T_N}
    circuit_edges = {e for e, ie in edge_effects.items() if abs(ie) > T_E}
    return circuit_nodes, circuit_edges
```

#### 应用：SHIFT

Marks et al. 用这个做了一件实用的事：在 Bias in Bios 任务上，找到那些"因果上推动性别偏见预测"的 SAE 特征，把它们消融掉，**在不碰标签的情况下提升分类器泛化**。比如某特征检测女性相关词（"husband""née"），它与性别强相关但与职业无关，消融它能去除虚假关联。

#### 核心优势

相比头级电路，Sparse Feature Circuits 的节点是**单语义**的，所以电路可直接被人读懂，还能用于下游编辑。

---
