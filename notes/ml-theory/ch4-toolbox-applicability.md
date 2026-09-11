---
title: "第四章（五）：证明工具箱与 Uniform Convergence 的适用边界"
date: 2026-09-11
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "证明工具箱"
  - "适用边界"
  - "Discretization"
description: "把第四章证明提炼成可迁移的工具箱（坏事件概率、data-dependent selection 警惕 pointwise bound、finite class→Union Bound、经验平均→集中、优化指数界参数、数清 error budget），并明确适用边界：H 无限、loss 不有界、数据不……"
---

# 第四章（五）：证明工具箱与 Uniform Convergence 的适用边界

> 把第四章证明提炼成可迁移的工具箱（坏事件概率、data-dependent selection 警惕 pointwise bound、finite class→Union Bound、经验平均→集中、优化指数界参数、数清 error budget），并明确适用边界：H 无限、loss 不有界、数据不独立时各会怎样崩。

### 第十三部分：证明工具箱与适用边界

#### 十七、这份证明最应该泛化出去的结构

现在我们已经可以把整章主证明压到非常小。

##### 17.1 定理内容一句话

> 对有限假设类和 \([0,1]\)-值损失，只要样本量是 \(O((\log|H|+\log(1/\delta))/\epsilon^2)\)，经验风险就会对所有假设同时逼近真实风险，因此 ERM 是 agnostic PAC learner。

##### 17.2 证明思想一句话

> 对一个固定 \(h\) 用 Hoeffding 把经验均值集中在真实均值附近，再对所有 \(h\in H\) 做 union bound 得到 uniform convergence，最后用“真→经验→ERM→真”三连跳把 uniform convergence 转成 excess risk bound。

##### 17.3 世界模型一句话

> **泛化的本质，是有限数据足够精确地保持整个候选模型空间的相对风险地形，从而使训练集上选出的最低点不会只是一个由抽样噪声制造的假低谷。**

#### 十八、证明工具箱：以后遇到类似问题怎样自动生成证明？

这一章实际上给出了一套非常强的通用流程。

##### 18.1 工具一：先把学习问题变成“坏事件概率”

目标：

$$
\Pr(\text{success})\ge1-\delta
$$

往往改写成：

$$
\Pr(\text{failure})\le\delta.
$$

原因是“存在一个坏对象”往往更容易 union bound。

##### 18.2 工具二：一看到 data-dependent selection，就警惕 pointwise bound

如果 \(h\) 是预先固定的：

$$
P(|L_S(h)-L_D(h)|>\epsilon)
$$

很容易控制。

如果：

$$
h=h_S
$$

是看过数据后挑出来的，就不能直接代进去。

第一反应应该是问：

> 我能否获得一个对所有候选 \(h\) 同时成立的界？

也就是：

$$
\sup_h|L_S-L_D|.
$$

##### 18.3 工具三：finite class 的第一反应是 union bound

如果已经有：

$$
P(E_h)\le p
$$

对每个固定 \(h\) 成立，而 \(H\) 有限，那么：

$$
P(\exists h:E_h)
\le
|H|p.
$$

然后你几乎可以预判：

$$
\log|H|
$$

会出现在 sample complexity 中。

因为：

$$
|H|e^{-cm}
\le\delta
$$

取对数后就会变成：

$$
m\gtrsim\log|H|+\log(1/\delta).
$$

##### 18.4 工具四：经验平均 vs 真实期望，第一反应是 concentration

出现：

$$
\frac1m\sum_iX_i-\mathbb E[X]
$$

时，不要重新发明证明。

应该自动检索：

$$
\text{Hoeffding / Bernstein / Chernoff / McDiarmid / ...}
$$

具体选哪个取决于：

$$
\text{有界性、方差、独立性、尾部条件、函数结构}.
$$

本章使用 Hoeffding，因为只需要：

$$
X_i\in[a,b].
$$

##### 18.5 工具五：有自由参数的指数界，要优化参数

如果证明中出现：

$$
P(X\ge t)
\le
e^{-\lambda t}\operatorname{MGF}(\lambda),
$$

且对任意 \(\lambda>0\) 成立，

那么下一步几乎必然是：

$$
\inf_{\lambda>0}.
$$

这就是 Chernoff method 的标准动作。

##### 18.6 工具六：error budget 要数清跨越了几次近似

Lemma 4.2 里跨两次：

$$
L_D\leftrightarrow L_S.
$$

所以：

$$
\epsilon/2+\epsilon/2.
$$

以后如果证明有三次近似，你就可能要分：

$$
\epsilon/3.
$$

不要死记 \(1/2\)。

要数“误差在哪里累计”。

#### 十九、Uniform Convergence 的适用边界

真正理解一个方法，必须知道什么时候它失效。

##### 19.1 如果 \(H\) 无限，直接 union bound 会炸

有限类：

$$
\sum_{h\in H}P(E_h)
$$

有意义。

如果：

$$
|H|=\infty,
$$

直接写：

$$
|H|e^{-2m\epsilon^2}
$$

毫无用处。

于是下一步就必须问：

> 无限多个函数是不是在有限样本上真的表现出无限复杂的行为？

这会引向：

$$
\boxed{\text{VC dimension}}
$$

和 growth function。

##### 19.2 如果 loss 不有界，Hoeffding 不能直接用

Hoeffding 依赖：

$$
a\le \ell(h,z)\le b.
$$

如果平方损失：

$$
(h(x)-y)^2
$$

没有任何范围限制，它可能无界。

那本章的证明不能直接照搬。

你必须增加：

$$
\text{boundedness/sub-Gaussian/tail assumptions}
$$

或者换 concentration tool。

##### 19.3 如果数据不独立，Hoeffding 的乘积结构会断

核心步骤：

$$
E\left[\prod_ie^{tX_i}\right]
=
\prod_iE[e^{tX_i}]
$$

用了 independence。

如果训练数据高度相关，则：

$$
m
$$

个观测可能没有 \(m\) 份独立信息。

所以不能机械套 Hoeffding。

##### 19.4 Uniform convergence 是一种“全局保证”，可能过强

它要求：

$$
\forall h\in H
$$

都估得准。

但一个算法也许只会访问 \(H\) 的很小一部分。

所以在一般学习问题中：

> learnability 可能成立，但全局 uniform convergence 不一定必要。

原书也明确指出这一点。

这为后面的 algorithm-dependent、stability、local complexity 等思想留下了空间。


### 第十四部分：Discretization Trick（Remark 4.1）

#### 二十、Discretization Trick：无限类能不能先粗暴离散化？

原书 Remark 4.1 给出一个很实用、但不够理论纯粹的想法。

考虑 threshold：

$$
h_\theta(x)
=
\operatorname{sign}(x-\theta),
\qquad
\theta\in\mathbb R.
$$

理论上：

$$
H
$$

是无限的。

但电脑不能存任意实数。

假设 \(\theta\) 用 64-bit 浮点数表示。

那么最多只有：

$$
2^{64}
$$

种表示。

所以实践中的有效类大小至多：

$$
|H|\le2^{64}.
$$

如果有 \(d\) 个 64-bit 参数，则粗略：

$$
|H|\le2^{64d}.
$$

代入有限类 bound：

$$
m
\lesssim
\frac{
2\log(2\cdot2^{64d}/\delta)
}{
\epsilon^2
}.
$$

即：

$$
=
\frac{
128d\log2+2\log(2/\delta)
}{
\epsilon^2}.
$$

利用：

$$
\log2<1,
$$

粗略得到原书给出的：

$$
m
\lesssim
\frac{
128d+2\log(2/\delta)
}{
\epsilon^2}.
$$

原书同时指出这个 bound 的缺陷：它依赖机器如何表示实数，而不是函数类本身的数学结构；Chapter 6 会用更严谨的复杂度概念分析无限类。

##### 20.1 这个 trick 真正告诉我们的不是“64 位”

真正 insight 是：

$$
\boxed{
\text{sample complexity 看的是可区分模型的信息量，而不是参数表面上是不是连续。}
}
$$

如果候选模型可以用 \(B\) bits 编码，

那么：

$$
|H|\le2^B.
$$

所以：

$$
\log|H|\le B.
$$

于是有限类 bound 大致：

$$
m=O\left(
\frac{B+\log(1/\delta)}{\epsilon^2}
\right).
$$

这已经隐约连接到后面的：

$$
\text{description length / Occam / MDL}.
$$


### 第十五部分：习题 1——高概率趋零与期望趋零的等价性

#### 二十一、习题 1：PAC 风格的“高概率趋零”为什么等价于“期望趋零”？

原书 Exercise 4.5.1 要证明，在 loss range 为 \([0,1]\) 时，对任意算法 \(A\)、分布 \(D\)，以下两件事等价：

第一：

对每个：

$$
\epsilon,\delta>0,
$$

存在：

$$
m(\epsilon,\delta)
$$

使得当：

$$
m\ge m(\epsilon,\delta)
$$

时：

$$
P_{S\sim D^m}
[
L_D(A(S))>\epsilon
]
<\delta.
$$

第二：

$$
\lim_{m\to\infty}
E_{S\sim D^m}
[
L_D(A(S))
]
=
0.
$$

这道题非常重要，因为它在说：

> 对一个取值有界的非负随机变量，“以任意高概率变得任意小”和“平均值趋于 0”其实几乎是一回事。

##### 21.1 先把符号简化

定义：

$$
X_m
=
L_D(A(S)).
$$

因为 loss range 是：

$$
[0,1],
$$

所以：

$$
0\le X_m\le1.
$$

题目变成：

###### 条件 A

对每个：

$$
\epsilon,\delta>0,
$$

最终都有：

$$
P(X_m>\epsilon)<\delta.
$$

###### 条件 B

$$
E[X_m]\to0.
$$

这实际上是在证明：

$$
X_m\to0
$$

in probability，

加上有界性，

等价于：

$$
X_m\to0
$$

in \(L^1\)。

这里不需要记概率论术语，但要理解结构。

#### 二十二、习题 1 第一方向：高概率趋零 \(\Rightarrow\) 期望趋零

我们假设：

> 对任意 \(\epsilon,\delta>0\)，足够大 \(m\) 时，
>
> $$
> P(X_m>\epsilon)<\delta.
> $$

目标：

$$
E[X_m]\to0.
$$

##### 22.1 怎样想到证明？

期望：

$$
E[X_m]
$$

包含两部分贡献：

1. 大多数情况下 \(X_m\) 很小；
2. 少数失败情况下 \(X_m\) 可能比较大。

题目告诉我们：

$$
P(X_m>\epsilon)
$$

很小。

而范围条件：

$$
X_m\le1
$$

告诉我们：

> 即使失败，损失最多也就是 1。

所以自然把期望按事件：

$$
X_m\le\epsilon
$$

和：

$$
X_m>\epsilon
$$

拆开。

这是非常常用的：

$$
\boxed{\text{good event / bad event decomposition}.}
$$

##### 22.2 正式拆期望

写：

$$
E[X_m]
=
E[X_m\mathbf1_{\{X_m\le\epsilon\}}]
+
E[X_m\mathbf1_{\{X_m>\epsilon\}}].
$$

先看第一项。

在事件：

$$
X_m\le\epsilon
$$

上：

$$
X_m\le\epsilon.
$$

所以：

$$
X_m\mathbf1_{\{X_m\le\epsilon\}}
\le
\epsilon.
$$

因此：

$$
E[
X_m\mathbf1_{\{X_m\le\epsilon\}}
]
\le
\epsilon.
$$

##### 22.3 再看坏事件

在：

$$
X_m>\epsilon
$$

上，虽然不知道 \(X_m\) 多大，但知道：

$$
X_m\le1.
$$

所以：

$$
X_m\mathbf1_{\{X_m>\epsilon\}}
\le
\mathbf1_{\{X_m>\epsilon\}}.
$$

取期望：

$$
E[
X_m\mathbf1_{\{X_m>\epsilon\}}
]
\le
P(X_m>\epsilon).
$$

因此：

$$
\boxed{
E[X_m]
\le
\epsilon
+
P(X_m>\epsilon).
}
$$

这条不等式就是整个方向的核心。

##### 22.4 怎样从它推出极限为零？

我们必须严格证明：

对于任意：

$$
\eta>0,
$$

存在 \(M\)，使得：

$$
m\ge M
\Rightarrow
E[X_m]<\eta.
$$

这里不要把题目中的 \(\epsilon\) 和最终极限证明的 \(\eta\) 混在一起。

给定任意：

$$
\eta>0.
$$

我们选择：

$$
\epsilon=\frac{\eta}{2},
\qquad
\delta=\frac{\eta}{2}.
$$

由条件 A，存在：

$$
M=m(\eta/2,\eta/2)
$$

使得 \(m\ge M\) 时：

$$
P\left(
X_m>\frac\eta2
\right)
<
\frac\eta2.
$$

代入：

$$
E[X_m]
\le
\frac\eta2
+
P\left(
X_m>\frac\eta2
\right)
<
\frac\eta2+\frac\eta2
=
\eta.
$$

所以：

$$
\boxed{
E[X_m]\to0.
}
$$

第一方向证完。

##### 22.5 这一方向到底用了什么条件？

关键用了：

$$
0\le X_m\le1.
$$

尤其是：

$$
X_m\le1.
$$

如果没有上界，一个极小概率事件上可以出现巨大损失。

例如：

$$
X_m=
\begin{cases}
m,&\text{概率 }1/m,\\
0,&\text{概率 }1-1/m.
\end{cases}
$$

那么：

$$
X_m\to0
$$

in probability，

因为：

$$
P(X_m>\epsilon)=\frac1m\to0.
$$

但是：

$$
E[X_m]
=
m\cdot\frac1m
=
1.
$$

并不趋于 0。

所以：

$$
\boxed{
\text{“高概率好”不能自动推出“平均也好”；
必须控制坏事件上的损失幅度。}
}
$$

本题里的 bounded loss 正是干这件事。

#### 二十三、习题 1 第二方向：期望趋零 \(\Rightarrow\) 高概率趋零

现在假设：

$$
E[X_m]\to0.
$$

要证明：

对于任意：

$$
\epsilon,\delta>0,
$$

足够大 \(m\) 时：

$$
P(X_m>\epsilon)<\delta.
$$

##### 23.1 看到什么应该第一反应想到 Markov？

我们知道：

$$
X_m\ge0.
$$

我们知道：

$$
E[X_m]
$$

很小。

我们想控制：

$$
P(X_m>\epsilon).
$$

这就是 Markov inequality 最标准的接口：

$$
P(X\ge a)
\le
\frac{E[X]}a.
$$

所以：

$$
P(X_m>\epsilon)
\le
\frac{E[X_m]}{\epsilon}.
$$

##### 23.2 怎样让它小于 \(\delta\)？

只要：

$$
\frac{E[X_m]}{\epsilon}
<
\delta.
$$

也就是：

$$
E[X_m]
<
\epsilon\delta.
$$

由于：

$$
E[X_m]\to0,
$$

所以存在 \(M\)，当：

$$
m\ge M
$$

时：

$$
E[X_m]<\epsilon\delta.
$$

于是：

$$
P(X_m>\epsilon)
\le
\frac{E[X_m]}{\epsilon}
<
\delta.
$$

完成。

##### 23.3 第二方向有没有用 \(X_m\le1\)？

没有。

这里只用了：

$$
X_m\ge0.
$$

因为 Markov 只需要非负。

所以两方向使用的假设并不对称：

$$
E[X_m]\to0
\Rightarrow
X_m\to0\text{ in probability}
$$

只需非负。

而反方向需要额外控制尾部。

本题用：

$$
0\le X_m\le1
$$

来保证。

#### 二十四、习题 1 的精髓压缩

###### 定理内容

> 对 \([0,1]\)-值风险，“对于任意 \(\epsilon,\delta\)，最终以至少 \(1-\delta\) 概率小于 \(\epsilon\)”与“风险的期望趋于 0”是等价的。

###### 第一方向证明思想

> 按 good event \(X\le\epsilon\) 和 bad event \(X>\epsilon\) 拆期望；好事件贡献至多 \(\epsilon\)，坏事件由于 \(X\le1\) 贡献至多其概率。

核心公式：

$$
\boxed{
E[X]
\le
\epsilon+P(X>\epsilon).
}
$$

###### 第二方向证明思想

> 对非负风险直接用 Markov：

$$
\boxed{
P(X>\epsilon)
\le
\frac{E[X]}{\epsilon}.
}
$$

###### 世界模型

> **如果损失有统一上界，那么“偶尔失败”既不能隐藏巨额灾难，因此高概率表现和平均表现是可以互相转换的。**

###### 可迁移工具箱

看到：

$$
P(X>\epsilon)
\leftrightarrow E[X]
$$

时：

* 从 expectation 到 probability：想 Markov；
* 从 probability 到 expectation：想 good/bad event decomposition，并检查是否有 boundedness / uniform integrability 一类尾部控制。
