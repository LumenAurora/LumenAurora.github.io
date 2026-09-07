---
title: "第四章（二）：核心引理、Uniform Convergence 定义与有限类证明"
date: 2026-09-07
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "Uniform Convergence"
  - "Lemma 4.2"
  - "有限假设类"
description: "Lemma 4.2 证明：只要 Uniform Convergence 成立，ERM 就泛化。本文给出证明全貌与「为什么偏偏用 ε/2」的直觉，再定义 Uniform Convergence 本身，并证明有限假设类天然满足它（取补集、并事件、Union Bound 三步）。"
---

# 第四章（二）：核心引理、Uniform Convergence 定义与有限类证明

> Lemma 4.2 证明：只要 Uniform Convergence 成立，ERM 就泛化。本文给出证明全貌与「为什么偏偏用 ε/2」的直觉，再定义 Uniform Convergence 本身，并证明有限假设类天然满足它（取补集、并事件、Union Bound 三步）。

### 第四部分：核心引理——为什么 Uniform Convergence 足以保证 ERM 泛化

#### 四、Lemma 4.2：为什么 uniform convergence 足以保证 ERM 泛化？

原书首先证明一个非常简单、但实际上是整章逻辑支点的引理：

如果 \(S\) 是

$$
\frac{\epsilon}{2}
$$

-representative，那么任何 ERM 输出 \(h_S\) 都满足：

$$
L_D(h_S)
\le
\min_{h\in H}L_D(h)+\epsilon.
$$

这句话其实就是：

> **只要经验风险地形和真实风险地形整体足够接近，那么经验最优点必然是真实近似最优点。**

##### 4.1 先看证明全貌

设：

$$
h_S\in\arg\min_{h\in H}L_S(h).
$$

那么对于任意：

$$
h\in H,
$$

有

$$
\begin{aligned}
L_D(h_S)
&\le L_S(h_S)+\frac{\epsilon}{2}\\
&\le L_S(h)+\frac{\epsilon}{2}\\
&\le L_D(h)+\frac{\epsilon}{2}+\frac{\epsilon}{2}\\
&=L_D(h)+\epsilon.
\end{aligned}
$$

由于对所有 \(h\in H\) 都成立，所以取最好的那个：

$$
L_D(h_S)
\le
\min_{h\in H}L_D(h)+\epsilon.
$$

这就是原书的全部证明。

可是我们不能满足于“看懂四行不等式”。

下面逐行拆。

##### 4.2 第一步：为什么

$$
L_D(h_S)
\le
L_S(h_S)+\frac{\epsilon}{2}?
$$

因为训练集是 \(\epsilon/2\)-representative：

$$
|L_S(h)-L_D(h)|
\le\frac{\epsilon}{2}
$$

对所有 \(h\in H\) 成立。

特别地，对：

$$
h=h_S
$$

也成立。

于是：

$$
L_D(h_S)-L_S(h_S)
\le\frac{\epsilon}{2},
$$

也就是：

$$
L_D(h_S)
\le
L_S(h_S)+\frac{\epsilon}{2}.
$$

###### 这一步的直觉

我们最终关心：

$$
L_D(h_S),
$$

但 ERM 能控制的是：

$$
L_S(h_S).
$$

所以第一件事情必然是：

> 把“真实风险”搬到“经验风险”上。

付出的转换误差是：

$$
\frac{\epsilon}{2}.
$$

##### 4.3 第二步：为什么

$$
L_S(h_S)\le L_S(h)?
$$

这完全来自 ERM 定义：

$$
h_S\in\arg\min_{h\in H}L_S(h).
$$

所以：

$$
L_S(h_S)
=
\min_{h'\in H}L_S(h')
\le L_S(h)
$$

对任意 \(h\in H\) 成立。

###### 这一步的直觉

这是整个证明唯一真正使用“学习算法是 ERM”的地方。

第一步和第三步来自统计性质。

第二步来自优化性质。

所以这条证明实际上把机器学习拆成了：

$$
\boxed{
\text{optimization}
+
\text{generalization}
}
$$

ERM 负责：

$$
\text{经验空间里找最优}.
$$

uniform convergence 负责：

$$
\text{经验空间和真实空间不要差太远}.
$$

两者合在一起才得到学习。

##### 4.4 第三步：为什么

$$
L_S(h)
\le
L_D(h)+\frac{\epsilon}{2}?
$$

还是因为：

$$
S
$$

是 \(\epsilon/2\)-representative。

即：

$$
|L_S(h)-L_D(h)|
\le\frac{\epsilon}{2}.
$$

所以：

$$
L_S(h)-L_D(h)
\le\frac{\epsilon}{2}.
$$

于是：

$$
L_S(h)\le L_D(h)+\frac{\epsilon}{2}.
$$

##### 4.5 为什么偏偏要 \(\epsilon/2\)？

因为这条证明中我们跨越了两次：

$$
L_D
\leftrightarrow
L_S.
$$

第一次：

$$
L_D(h_S)
\to L_S(h_S),
$$

损失：

$$
\gamma.
$$

第二次：

$$
L_S(h)
\to L_D(h),
$$

又损失：

$$
\gamma.
$$

总共：

$$
2\gamma.
$$

希望最终误差不超过：

$$
\epsilon,
$$

于是自然取：

$$
2\gamma=\epsilon
\quad\Rightarrow\quad
\gamma=\frac{\epsilon}{2}.
$$

这不是神秘常数。

是一个非常通用的 **error budget splitting**：

$$
\boxed{
\text{最终允许误差 }\epsilon
=
\text{第一次近似误差}
+
\text{第二次近似误差}.
}
$$

##### 4.6 这条证明怎样才能“机械化复现”？

以后看到：

$$
\hat h=\arg\min_h\hat L(h)
$$

并且知道：

$$
|\hat L(h)-L(h)|\le\gamma
$$

对所有 \(h\) 成立，

第一反应就应该自动写：

$$
\boxed{
L(\hat h)
\le
\hat L(\hat h)+\gamma
\le
\hat L(h^*)+\gamma
\le
L(h^*)+2\gamma.
}
$$

其中：

$$
h^*=\arg\min_hL(h).
$$

这是一条极其重要的“ERM 三连跳”。

可以直接背成：

> **真 → 经验 → 经验最优 → 真。**

即：

$$
\boxed{
L_D(h_S)
\to
L_S(h_S)
\to
L_S(h^*)
\to
L_D(h^*).
}
$$

只要记住这条箭头，整个 Lemma 4.2 可以现场重建。

##### 4.7 一句话压缩 Lemma 4.2

###### 定理内容

> 如果训练集对 \(H\) 中所有模型的风险估计都误差不超过 \(\epsilon/2\)，那么 ERM 的真实风险距离 \(H\) 内真实最优风险最多 \(\epsilon\)。

###### 证明思想

> 用 uniform convergence 把 ERM 输出的真实风险搬到经验风险，用 ERM 换成最优模型的经验风险，再用 uniform convergence 搬回最优模型的真实风险，两次各花 \(\epsilon/2\)。

###### 世界模型

> **如果训练世界的整张地形图都是对真实世界地形图的小扰动，那么训练世界的最低点不可能在真实世界里高出真正最低点太多。**


### 第五部分：Uniform Convergence 的正式定义

#### 五、Uniform Convergence：把一个好的训练集变成高概率事件

到目前为止我们只是说：

> “如果 \(S\) 恰好 representative，那 ERM 就好。”

但训练集是随机抽的。

真正需要的是：

> 足够多数据以后，\(S\) 以很高概率是 representative。

于是原书 Definition 4.3 定义 uniform convergence property：

存在函数

$$
m_H^{UC}(\epsilon,\delta),
$$

使得对任意：

$$
\epsilon,\delta\in(0,1),
$$

任意分布 \(D\)，当：

$$
m\ge m_H^{UC}(\epsilon,\delta)
$$

且：

$$
S\sim D^m,
$$

就有：

$$
\Pr
\left[
\forall h\in H,\;
|L_S(h)-L_D(h)|\le\epsilon
\right]
\ge1-\delta.
$$

##### 5.1 这一定义真正控制的随机变量是什么？

定义：

$$
\Delta_H(S)
=
\sup_{h\in H}
|L_S(h)-L_D(h)|.
$$

那么 uniform convergence 就是在说：

$$
\Pr[
\Delta_H(S)\le\epsilon
]
\ge1-\delta.
$$

或者：

$$
\Pr[
\Delta_H(S)>\epsilon
]
\le\delta.
$$

这比“对每个 \(h\) 分别都大概率成立”强。

因为它要求：

$$
\boxed{
\text{一个共同的训练集 }S
\text{ 同时对整个 }H\text{ 都可靠}.
}
$$

##### 5.2 Uniform Convergence 与 PAC Learnability 的关系

Lemma 4.2 已经告诉我们：

$$
\frac{\epsilon}{2}\text{-representative}
\Rightarrow
\text{ERM excess risk}\le\epsilon.
$$

Uniform convergence 又告诉我们：

$$
m\ge
m_H^{UC}(\epsilon/2,\delta)
$$

时，以概率至少：

$$
1-\delta
$$

得到这样的代表性样本。

因此：

$$
\boxed{
m_H(\epsilon,\delta)
\le
m_H^{UC}\left(\frac\epsilon2,\delta\right).
}
$$

而 ERM 本身就是一个成功的 agnostic PAC learner。

这正是原书 Corollary 4.4。

##### 5.3 逻辑关系一定要分清

第四章证明的是：

$$
\boxed{
\text{Uniform Convergence}
\Rightarrow
\text{ERM agnostic PAC learnable}.
}
$$

它在这里是一个**充分条件**。

不能仅凭本章就说：

$$
\text{learnable}
\Rightarrow
\text{uniform convergence}.
$$

原书在本章 bibliographic remarks 中专门指出：对二分类问题，后面 Chapter 6 的 fundamental theorem 会说明 uniform convergence 也是必要的；但对更一般的学习问题，这不成立。

这是一个很重要的适用边界。


### 第六部分：有限假设类的 Uniform Convergence 证明

#### 六、有限假设类为什么有 Uniform Convergence？

现在进入整章真正的概率证明。

目标是：

$$
\Pr
\left[
\exists h\in H:
|L_S(h)-L_D(h)|>\epsilon
\right]
\le\delta.
$$

原书明确说证明分两步：

1. 用 union bound 把“所有 \(h\)”拆成“固定一个 \(h\)”；
2. 用 concentration inequality 控制固定 \(h\)。

这两步分别解决两个不同问题：

$$
\boxed{
\text{Hoeffding 解决：一个固定模型会不会估歪？}
}
$$

$$
\boxed{
\text{Union bound 解决：模型很多时，会不会总有一个估歪？}
}
$$

##### 6.1 第一步：先把“同时所有模型都好”取补集

我们想证明：

$$
\Pr
\left[
\forall h\in H:
|L_S(h)-L_D(h)|\le\epsilon
\right]
\ge1-\delta.
$$

直接证明“所有都好”通常很难。

概率证明很常见的技巧是：

> **不要证明成功，改成上界失败概率。**

失败事件是：

$$
\exists h\in H:
|L_S(h)-L_D(h)|>\epsilon.
$$

即：

$$
\Pr
\left[
\exists h\in H:
|L_S(h)-L_D(h)|>\epsilon
\right]
\le\delta.
$$

原书正是先做这个等价变换。

###### 可迁移经验

以后看到：

$$
P(\forall i,\; A_i)
$$

很难控制时，马上考虑：

$$
(\forall i A_i)^c
=
\exists i A_i^c.
$$

而“存在一个失败”天然适合 union bound。

##### 6.2 第二步：把“存在一个坏 \(h\)”写成事件并集

定义：

$$
E_h
=
\left\{
S:
|L_S(h)-L_D(h)|>\epsilon
\right\}.
$$

那么：

$$
\left\{
S:
\exists h\in H,\,
|L_S(h)-L_D(h)|>\epsilon
\right\}
=
\bigcup_{h\in H}E_h.
$$

所以：

$$
P\left(\bigcup_{h\in H}E_h\right)
\le
\sum_{h\in H}P(E_h).
$$

也就是：

$$
P
\left[
\exists h:
|L_S(h)-L_D(h)|>\epsilon
\right]
\le
\sum_{h\in H}
P
\left[
|L_S(h)-L_D(h)|>\epsilon
\right].
$$

这就是原书式 (4.1)。

现在困难已经被降维了：

> 不再需要同时分析整个 \(H\)，只需要会控制一个固定 \(h\)。
