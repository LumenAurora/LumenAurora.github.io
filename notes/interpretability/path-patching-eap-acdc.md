---
title: "路径级因果追踪：Path Patching、EAP 与 ACDC"
date: 2026-08-28
category: "机制可解释性"
tags:
  - "可解释性"
  - "Path Patching"
  - "EAP"
  - "ACDC"
  - "因果干预"
description: "在激活修补的基础上，如何更细粒度、更高效、更自动化地定位电路？本篇讲三种递进的方法：把因果追踪下沉到路径级的 Path Patching、用梯度近似把开销降低约三个数量级的 Attribution Patching（EAP）、以及自动化的电路发现 ACDC。"
---

# 路径级因果追踪：Path Patching、EAP 与 ACDC

> 在激活修补的基础上，如何更细粒度、更高效、更自动化地定位电路？本篇讲三种递进的方法：把因果追踪下沉到路径级的 Path Patching、用梯度近似把开销降低约三个数量级的 Attribution Patching（EAP）、以及自动化的电路发现 ACDC。

### 三、Path Patching：路径级因果追踪

#### 动机

激活修补有个盲点：它把组件当成孤立的。但信息在 Transformer 里是沿**路径**流动的——头 A 的输出可能经过头 B 才到达最终 logits。如果直接消融 A，你测到的是 A 通过**所有路径**的总效应，无法区分"直接贡献"和"经过中转的间接贡献"。

Path Patching 解决的就是这个问题：它切断特定路径，看这条路径单独的贡献。

#### 原理

把模型看成有向无环图：节点是组件，边是数据流。残差流的逻辑意味着**非相邻层的组件也是直接相连的**（因为残差流把所有前序贡献都累积起来了）。

Path Patching 的核心操作：把某条路径 $A \to B \to \text{logits}$ 上的激活替换成 corrupted 值，但保留其他路径不变。这需要"冻结"中间节点的某些输入。

#### 两种典型用法

1. **Head → 最终残差流**：测试某个头的输出**直接**贡献了多少给最终 logits（不经过其他头）。做法是：在 clean 运行中，把指定头的输出替换成 corrupted 值，但只替换它写到**最终残差流**的那部分，让它对中间层其他头的影响保留。
2. **Head → Head**：测试头 A 是否通过头 B 起作用。做法更精细：让 A 的输出在到达 B 的 Q/K/V 时用 corrupted 值，但在到达其他头时保留 clean 值。

#### 伪代码（Head → 最终残差流）

```python
def path_patch_to_final_resid(model, clean_tokens, corr_tokens,
                               sender_layer, sender_head):
    # 1. 跑 clean 和 corrupted，都缓存
    _, clean_cache = model.run_with_cache(clean_tokens)
    _, corr_cache  = model.run_with_cache(corr_tokens)

    # 2. 关键技巧：先在 clean 上跑，把所有 head 的输出"冻结"在 clean 值，
    #    然后只把 sender_head 的最终残差流贡献替换成 corrupted
    # 实现上需要用 hook 在 sender head 的输出处替换，
    # 并冻结后续 head 的输入（让它看不到这次替换）

    def freeze_and_replace(z, hook):
        # z shape: [batch, seq, n_heads, d_head]
        # 把 sender_head 的输出替换成 corrupted
        z[:, :, sender_head, :] = corr_cache[hook.name][:, :, sender_head, :]
        return z

    # 关键：后续层在读取残差流时，要用 clean 的"其他 head 贡献" +
    #       corrupted 的"sender head 贡献"
    # 这通常需要两步：先算出每个 head 写入残差流的向量，再重组

    # 简化版：用 TransformerLens 的 patching 工具
    from transformer_lens.patching import patch_head_path
    result = patch_head_path(
        model, corr_tokens, clean_cache,
        sender_layer, sender_head,
        receiver_layers="final",  # 直接到最终残差流
        metric=logit_diff)
    return result
```

#### 适用场景

- 厘清"头 A 是直接写 logits，还是通过激活头 B 间接起作用"。
- 发现 IOI 电路中的层级结构：Duplicate Token Heads → S-Inhibition Heads → Name Mover Heads 的因果链。

#### 局限

仍需大量前向；路径集合需人工设定，扩展性弱。

---

### 四、Attribution Patching（EAP）：用梯度近似加速 1000 倍

#### 动机

激活修补太慢。如果一个模型有 32000 条边，每条都要一次前向，根本跑不动。Attribution Patching（也叫 Edge Attribution Patching, EAP）的核心洞察：**用一阶泰勒展开近似激活修补，只需 2 次前向 + 1 次反向**。

#### 数学推导

设 $m$ 是度量（如 logit diff），$\mathbf{a}$ 是某个内部激活节点。激活修补要算的是**间接效应**（Indirect Effect, IE）：

$$\text{IE}(m; \mathbf{a}; x_{\text{clean}}, x_{\text{patch}}) = m(x_{\text{clean}} | \text{do}(\mathbf{a} = \mathbf{a}_{\text{patch}})) - m(x_{\text{clean}})$$

即"把 $\mathbf{a}$ 强制设成 patch 值后，度量变化多少"。但每个 $\mathbf{a}$ 都要跑一次前向，太贵。

**一阶泰勒近似**（这就是 Attribution Patching）：

$$\widehat{\text{IE}}_{\text{atp}}(m; \mathbf{a}; x_{\text{clean}}, x_{\text{patch}}) = \nabla_{\mathbf{a}} m \big|_{\mathbf{a}=\mathbf{a}_{\text{clean}}} \cdot (\mathbf{a}_{\text{patch}} - \mathbf{a}_{\text{clean}})$$

直觉：在 clean 点对 $m$ 做线性近似，用梯度 $\nabla_{\mathbf{a}} m$ 估计"$\mathbf{a}$ 变化一点会引起 $m$ 变化多少"，再乘以实际变化量 $(\mathbf{a}_{\text{patch}} - \mathbf{a}_{\text{clean}})$。

#### 为什么只要 2 次前向 + 1 次反向

- 第 1 次前向：跑 clean，缓存所有 $\mathbf{a}_{\text{clean}}$。
- 第 2 次前向：跑 patch（corrupted），缓存所有 $\mathbf{a}_{\text{patch}}$。
- 1 次反向：在 clean 上反向传播 $m$，得到所有 $\mathbf{a}$ 的梯度 $\nabla_{\mathbf{a}} m$。

然后对所有节点做一次逐元素乘法：$\nabla_{\mathbf{a}} m \cdot (\mathbf{a}_{\text{patch}} - \mathbf{a}_{\text{clean}})$，就同时得到所有边的近似重要性。复杂度从 $O(\text{组件数})$ 降到 $O(1)$。

#### 边级 EAP

对于边 $u \to d$（从上游节点 $u$ 到下游节点 $d$），近似公式是：

$$\widehat{\text{IE}}(m; e; x_{\text{clean}}, x_{\text{patch}}) = \nabla_{\mathbf{d}} m \big|_{\text{clean}} \cdot \nabla_{\mathbf{u}} \mathbf{d} \big|_{\text{clean}} \cdot (\mathbf{u}_{\text{patch}} - \mathbf{u}_{\text{clean}})$$

即"上游变化量 × 上游到下游的雅可比 × 下游到度量的梯度"。

#### 伪代码

```python
import torch

## 1. clean 前向，需要 grad
clean_tokens.requires_grad_(False)
clean_logits, clean_cache = model.run_with_cache(clean_tokens)
clean_loss = logit_diff(clean_logits, clean_tokens)

## 2. 反向，得到所有激活的梯度
clean_loss.backward()  # 现在 clean_cache 里每个激活都有 .grad

## 3. corrupted 前向
corr_logits, corr_cache = model.run_with_cache(corr_tokens)

## 4. 对每条边算近似 IE
edge_scores = {}
for layer in range(model.cfg.n_layers):
    for head in range(model.cfg.n_heads):
        z_clean = clean_cache[get_act_name("z", layer)][:, :, head, :]
        z_corr  = corr_cache[get_act_name("z", layer)][:, :, head, :]
        z_grad  = z_clean.grad  # 反向时自动填充
        # EAP score = grad * (corr - clean)，对位置求和
        score = (z_grad * (z_corr - z_clean)).sum()
        edge_scores[(layer, head)] = score.item()

## 5. 按绝对值排序，取 top-k 作为候选电路
top_edges = sorted(edge_scores.items(), key=lambda x: -abs(x[1]))[:30]
```

#### 改进：Integrated Gradients

一阶近似在非线性强的地方会失真。Marks et al. 用**积分梯度**改进：在 clean 和 patch 之间取 $N$ 个等距插值点，每点都算梯度，再平均：

$$\widehat{\text{IE}}_{\text{ig}} = \frac{1}{N} \sum_{i=0}^{N-1} \nabla_{\mathbf{a}} m \big|_{\mathbf{a} = \mathbf{a}_{\text{clean}} + \frac{i}{N}(\mathbf{a}_{\text{patch}} - \mathbf{a}_{\text{clean}})} \cdot (\mathbf{a}_{\text{patch}} - \mathbf{a}_{\text{clean}})$$

代价是 $N$ 次反向，但精度显著提升。

#### 局限

EAP 是**近似**，在非线性强的通路（如残差流早期层）会失真。实践中的标准做法是"EAP 粗筛 → ACDC 精修"。DeepMind 的 AtP* 进一步分析了 EAP 的两类假阴性，并提出改进。

---

### 五、ACDC：自动化电路发现

#### 动机

EAP 给出了边的**近似**重要性排序，但还没给你一个"电路"——一个明确的子图。ACDC（Automated Circuit Discovery）把"找电路"这件事自动化成一个贪心边删除算法。

#### 工作流（被 ACDC 论文明确写下的隐式流程）

ACDC 论文的一大贡献是**命名了整个 mech interp 工作流**：

1. **选行为、数据集、度量**：选一个清晰的行为（IOI、大于、docstring 补全），准备数据集，选度量（logit diff、KL）。
2. **把网络切成计算图**：决定粒度（头 + MLP，或更细），节点连接必须忠实于真实计算。残差流逻辑意味着非相邻层组件也直接相连。
3. **patch 激活以隔离子图**：跑大量 patching 实验，剪掉不重要的部分，迭代到稀疏电路。

步骤 1、2 是人工设置，**ACDC 自动化步骤 3**——这是最耗时的部分。

#### 算法

ACDC 按逆拓扑序（从输出往输入走）遍历计算图。对每条候选边 $w \to v$：

1. 把这条边的激活**替换成 corrupted 输入下的值**（这叫 interchange intervention，比零消融更接近模型真实分布）。
2. 跑前向，算 KL 散度：$D_{KL}(G \| H_{\setminus \{w \to v\}})$，即"全模型"与"删边后模型"输出分布的差异。
3. 如果删边后 KL 变化小于阈值 $\tau$，认为这条边不重要，**永久删除**。
4. 递归继续处理 $v$ 的父节点。

伪代码：

```
for v in reverse_topological_order(graph):
    for w in parents(v):
        # 把 w->v 这条边替换成 corrupted 值
        patched_output = run_with_edge_patch(w, v, corrupted_value)
        kl_diff = KL(full_model_output, patched_output)
        if kl_diff < τ:
            prune edge w->v  # 永久删除
```

#### 关键设计选择

- **用 interchange intervention 而非零消融**：零消融会把网络推到它从未见过的分布，产生误导性归因；用真实 corrupted 输入保持网络在自然分布上。
- **单一阈值 $\tau$**：扫不同的 $\tau$，可以画出从"小而有损"到"大而忠实"的电路族。
- **贪心而非全局优化**：简单但可能错过需要组合才显现的边。

#### 结果

ACDC 在 GPT-2 Small 上重新发现了"大于电路"的 5/5 组件类型，从 32000 条边中选出了 68 条，全部是前人手工找到的。

#### 局限

- 计算成本仍高：每条边要一次前向，GPT-2-XL 规模就跑不动。
- 阈值敏感。
- 贪心可能漏掉冗余路径（自我修复会让单条边看起来不重要）。

---
