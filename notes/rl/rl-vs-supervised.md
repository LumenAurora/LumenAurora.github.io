---
title: "强化学习与监督学习的根本区别"
date: 2026-03-16
category: "强化学习"
tags:
  - "强化学习"
  - "监督学习"
  - "辨析"
description: "采样！强化学习的得分不可回传梯度流，而监督学习可以！"
---

# 强化学习与监督学习的根本区别

## 强化学习和监督学习最大的区别是什么
采样！强化学习的得分不可回传梯度流，而监督学习可以！
### 🔗 从头讲透：梯度流、采样与不可微的断裂


### 二、用具体例子看"可微"和"不可微"

#### ✅ 可微操作举例

```
矩阵乘法:  h = Wx        → ∂h/∂W = x^T          ✅ 有导数
激活函数:  h = ReLU(x)   → ∂h/∂x = 1 (x>0)      ✅ 有导数  
Softmax:   p = softmax(z) → ∂p/∂z = 有解析公式    ✅ 有导数
```

#### ❌ 不可微操作举例

```
argmax:    token = argmax(p)   → 导数？ 处处为0或不存在  ❌
采样:      token ~ Categorical(p)  → 导数？随机操作无导数  ❌
比较:      y = (x > 0) ? 1 : 0    → 阶跃函数，不可微      ❌
```

**关键洞察：只要计算图中有一步不可微，从那之后的梯度就传不回那之前的参数。**

---

### 三、语言模型训练时的梯度流

#### 📘 训练阶段（Teacher Forcing）—— 没有采样！

你说"大语言模型输出 next token 时不也有采样吗"——这里有个非常重要的区分：

**训练时根本不采样！**

```
输入:  "法国的首都是"
标签:  "巴黎"

计算过程：
  logits = model("法国的首都是")     # 得到一个实数向量，比如 [2.1, 0.3, 5.7, ...]
  probs  = softmax(logits)           # 得到概率分布 [0.05, 0.01, 0.82, ...]
  loss   = -log(probs["巴黎"])       # 交叉熵损失

  loss.backward()                    # ✅ 全程可微！
```

画成梯度流：

```
  θ(模型参数)
  │
  ▼
  logits = f(x; θ)          ← 可微 ✅ (神经网络的前向传播)
  │
  ▼
  probs = softmax(logits)   ← 可微 ✅ (softmax有解析导数)
  │
  ▼
  loss = -log(probs[y_true]) ← 可微 ✅ (log函数有导数)
  │
  ▼
  ∂loss/∂θ 一路算回去       ← 链式法则完整，没断 ✅✅✅
```

**注意**：这里我们从来没有"选择一个 token"！
- 我们直接拿**真实标签**"巴黎"的概率来算 loss
- softmax 输出的**整个概率分布**都参与了计算
- 整条链都是连续可微的

#### 📕 推理阶段（Generation）—— 才有采样

```
  logits = model("法国的首都是")
  probs = softmax(logits)           # [0.05, 0.01, 0.82, ...]
  token = sample(probs)             # 🎲 随机抽一个 → "巴黎"
```

但推理时**不需要求梯度**，所以没问题。

#### 💥 那 RLHF 的矛盾在哪？

RLHF 要求你：
1. **先采样生成完整回答**（推理阶段的操作）
2. **再用 reward 来更新参数**（训练阶段的需求）

```
  θ(模型参数)
  │
  ▼
  logits₁ = f("请回答:"; θ)
  │
  ▼
  probs₁ = softmax(logits₁)
  │
  ▼
  token₁ = sample(probs₁)        ← 🔴 不可微！梯度断了！
  │
  ▼
  logits₂ = f(token₁; θ)          
  │
  ▼
  token₂ = sample(...)            ← 🔴 又断了！
  │
  ▼
  ... (生成完整回答)
  │
  ▼
  reward = RewardModel(回答)       ← 你拿到了一个分数
  │
  ✖ 梯度回不去了！中间全是采样断点！
```

**这就是根本矛盾：你需要先"做选择"（采样），才能拿到反馈（reward），但"做选择"这个操作本身把梯度切断了。**

---

### 四、VAE 的重参数化技巧：为什么它能让采样可微？

你提到了 VAE，这个对比非常好！我们来看看它为什么行，以及为什么**同样的技巧对语言模型不行**。

#### VAE 的问题

VAE 需要从一个**连续高斯分布**中采样：

$$z \sim \mathcal{N}(\mu_\theta, \sigma_\theta^2)$$

如果直接采样，梯度也断了：

```
  θ → 编码器 → μ, σ → 🎲采样z → 解码器 → 重建 → loss
                        ↑
                    梯度断了 ❌
```

#### 重参数化技巧（Reparameterization Trick）

核心思想：**把随机性从参数中"提"出来！**

原来：$z \sim \mathcal{N}(\mu, \sigma^2)$（z 的随机性和参数纠缠在一起）

变成：$z = \mu + \sigma \cdot \epsilon, \quad \epsilon \sim \mathcal{N}(0,1)$（随机性在 ε 里，跟参数无关）

```
  θ → 编码器 → μ, σ ──→ z = μ + σ·ε → 解码器 → loss
                    ↗
  ε ~ N(0,1) (固定的随机数，和θ无关)
```

现在：
- $z$ 是 $\mu$ 和 $\sigma$ 的**确定性函数**（给定 $\epsilon$）
- $\frac{\partial z}{\partial \mu} = 1$ ✅
- $\frac{\partial z}{\partial \sigma} = \epsilon$ ✅
- 梯度可以流过 $z$，传回编码器参数 $\theta$ ✅

**魔法的本质**：我们没有消除随机性，而是把随机性转移到了一个**跟参数无关的外部噪声**上。对于参数 $\theta$ 来说，整条计算链变成了确定性的。

---

#### 🔑 为什么同样的技巧对离散采样不行？

VAE 采样的是**连续值**：$z \in \mathbb{R}^d$

语言模型采样的是**离散 token**：token ∈ {0, 1, 2, ..., 50000}

```
连续情况：
  z = μ + σ·ε        ← 加法、乘法都可微 ✅
  
离散情况：
  token = categorical_sample(probs)
        = "第37521号token"    ← 这是一个整数索引！
  
  你没法写成 token = f(probs) + ε 的形式
  因为 token 是离散的跳跃值，不是连续空间中的点
```

直观理解：
- 连续空间里，你可以"微调" z（往左挪一点点），观察 loss 的变化
- 离散空间里，你要么选 token A，要么选 token B，**没有"中间状态"**
- 你没法问"如果我把 token 选择往'巴黎'方向移动 0.001，loss 会怎么变"

这就像：
> - 连续：调空调温度从 25.0° 到 25.1°，舒适度怎么变？→ 可以算导数
> - 离散：选红色还是蓝色衣服，心情怎么变？→ 没有导数这个概念

---

### 五、Gumbel-Softmax：离散采样的"近似"重参数化

研究者确实尝试过类似 VAE 的技巧来处理离散采样：

#### 核心思想：用连续的 softmax 近似离散的 one-hot

正常离散采样：

$$\text{token} = \text{one\_hot}(\arg\max_i [\log p_i + G_i])$$

其中 $G_i \sim \text{Gumbel}(0,1)$ 是 Gumbel 噪声。

**Gumbel-Softmax 近似**：把 argmax（不可微）换成 softmax（可微）：

$$y_i = \frac{\exp((\log p_i + G_i) / \tau)}{\sum_j \exp((\log p_j + G_j) / \tau)}$$

- $\tau \to 0$ 时，趋近于真正的 one-hot（离散）
- $\tau \to \infty$ 时，趋近于均匀分布（非常"软"）

```
  θ → logits → probs ──────────→ soft_token = GumbelSoftmax(probs, ε)
                           ↗
  ε ~ Gumbel(0,1) (外部随机性)

  ∂soft_token/∂probs 存在！ ← 梯度可以流过去了 ✅（近似地）
```

#### 但问题是：

- 输出是一个**"软"的概率向量**，不是真正的离散 token
- 下游的 reward model 期望输入的是一段**真实的文本**
- 近似越精确（τ越小），梯度的方差越大
- **实际效果远不如 Policy Gradient**，在 LLM 规模上基本不可用

---

### 六、Policy Gradient：不走"求导"这条路

既然硬求导走不通，RL 换了一个思路：

> **我不求 $\frac{\partial R}{\partial \theta}$（reward 对参数的导数），我求 $\frac{\partial \mathbb{E}[R]}{\partial \theta}$（期望 reward 对参数的导数），这两个不是一回事！**

#### 推导（简化版，单步情况）

目标：

$$J(\theta) = \mathbb{E}_{a \sim \pi_\theta}[R(a)] = \sum_a \pi_\theta(a) R(a)$$

求导：

$$\nabla_\theta J = \sum_a \nabla_\theta \pi_\theta(a) \cdot R(a)$$

这里 $R(a)$ 不需要对 $\theta$ 求导（它只是一个标量系数），但 $\pi_\theta(a)$ 是可以对 $\theta$ 求导的！

利用恒等式 $\nabla f = f \cdot \nabla \log f$：

$$\nabla_\theta J = \sum_a \pi_\theta(a) \cdot R(a) \cdot \nabla_\theta \log \pi_\theta(a) = \mathbb{E}_{a \sim \pi_\theta} [R(a) \cdot \nabla_\theta \log \pi_\theta(a)]$$

用采样估计这个期望：

$$\nabla_\theta J \approx \frac{1}{N} \sum_{i=1}^{N} R(a_i) \cdot \nabla_\theta \log \pi_\theta(a_i)$$

#### 这意味着什么？

```python
## 实际代码（简化版）
for each sampled response a_i:
    reward_i = reward_model(a_i)              # 不可微没关系！只是一个数字
    log_prob_i = model.log_prob(a_i)          # ✅ 这个是可微的！
    loss_i = -reward_i * log_prob_i           # reward 只是一个权重系数
    
loss = mean(all loss_i)
loss.backward()  # ✅ 梯度从 log_prob 流回模型参数
```

#### 梯度流现在变成了：

```
  θ(模型参数)
  │
  ▼                                    
  log πθ(a|s) ← 这一步可微！          reward (只是一个标量系数，不参与求导)
  │                                        │
  ▼                                        ▼
  policy_loss = - reward × log πθ(a|s)
  │
  ▼
  ∂loss/∂θ = - reward × ∂log πθ/∂θ    ← ✅ 完整的梯度！
```

**reward 从来没有被求导！** 它只是作为一个"权重/系数"，告诉梯度"往这个方向更新多少"。

---

### 七、终极对比：五种方法的梯度流

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. 监督学习 (SFT)                                               │
│                                                                  │
│    θ → logits → softmax → 直接取 label 的概率 → cross_entropy   │
│    ✅ 全程可微，无采样                                            │
├─────────────────────────────────────────────────────────────────┤
│ 2. VAE (连续空间)                                                │
│                                                                  │
│    θ → μ,σ → z = μ + σ·ε → 解码器 → loss                       │
│    ✅ 重参数化：随机性在ε中，对θ可微                              │
├─────────────────────────────────────────────────────────────────┤
│ 3. Gumbel-Softmax (离散近似)                                     │
│                                                                  │
│    θ → logits → soft_token = GS(logits, ε, τ) → loss            │
│    ⚠️ 近似可微，但效果差、方差大                                  │
├─────────────────────────────────────────────────────────────────┤
│ 4. Policy Gradient / REINFORCE (RL)                              │
│                                                                  │
│    θ → πθ(a|s) →→采样→→ a → R(a)                                │
│                    🔴断                                           │
│    但是！绕路：loss = -R(a)·log πθ(a|s)                          │
│    ✅ 不需要对R求导，只对 log π 求导                              │
├─────────────────────────────────────────────────────────────────┤
│ 5. DPO (把RL变回监督学习)                                        │
│                                                                  │
│    直接用 (好回答, 坏回答) 对作为训练数据                          │
│    θ → log πθ(好) - log πθ(坏) → sigmoid → loss                 │
│    ✅ 全程可微，不需要采样，不需要 reward model                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### 八、总结

| 问题 | 回答 |
|---|---|
| 训练 LLM 时有采样吗？ | **没有！** Teacher forcing 直接用真实 label 算 loss |
| 推理 LLM 时有采样吗？ | **有**，但推理不需要梯度 |
| RLHF 为什么需要 RL？ | 必须先采样才能拿到 reward，而采样切断了梯度 |
| VAE 怎么解决采样的？ | 重参数化技巧，但**只适用于连续分布** |
| 离散采样能近似可微吗？ | Gumbel-Softmax 可以，但**效果差** |
| RL 怎么绕过不可微？ | Policy Gradient：**不对 reward 求导**，reward 只当权重，对 log π 求导 |
| DPO 为什么不需要 RL？ | 把问题重新建模，回避了采样这一步 |

**一句话：所有的技术路线差异，归根到底都是在回答同一个问题——「梯度断了怎么办」。不同的回答方式，就衍生出了不同的算法流派。**
