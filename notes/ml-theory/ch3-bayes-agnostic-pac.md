---
title: "第三章（三）：Bayes Optimal Predictor 与 Agnostic PAC"
date: 2026-09-07
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "Bayes"
  - "Agnostic PAC"
  - "误差分解"
description: "如果知道整个分布 D，最佳决策是什么？本文给出 Bayes Optimal Predictor 及其证明，并把它作为理论最优基准。随后给出 Agnostic PAC 的正式目标，展示它如何自然地把机器学习的三个误差来源（近似 / 估计 / 不可知）分开，并解释为什么 Agnostic PAC 自动包……"
---

# 第三章（三）：Bayes Optimal Predictor 与 Agnostic PAC

> 如果知道整个分布 D，最佳决策是什么？本文给出 Bayes Optimal Predictor 及其证明，并把它作为理论最优基准。随后给出 Agnostic PAC 的正式目标，展示它如何自然地把机器学习的三个误差来源（近似 / 估计 / 不可知）分开，并解释为什么 Agnostic PAC 自动包含普通 PAC。

### 第六部分：Bayes Optimal Predictor（理论最优基准）

#### 二十、Bayes Optimal Predictor：如果我知道整个 \(D\)，最佳决策是什么？

设：

$$
\eta(x)
=
P(Y=1\mid X=x).
$$

对于固定 \(x\)，我们只有两个选择：

$$
h(x)=0
\quad\text{或}\quad
h(x)=1.
$$

如果选择：

$$
h(x)=1,
$$

什么时候错？

真实标签是 0。

所以条件错误概率：

$$
P(Y=0\mid x)
=
1-\eta(x).
$$

如果选择：

$$
h(x)=0,
$$

错误概率：

$$
P(Y=1\mid x)
=
\eta(x).
$$

所以应该取两者中更小的。

于是：

$$
f_D(x)
=
\begin{cases}
1,&P(Y=1\mid x)\ge \frac12,\\
0,&P(Y=1\mid x)<\frac12.
\end{cases}
$$

这就是 Bayes optimal predictor。原书在这里给出定义，并把它的最优性放在 Exercise 7 中证明。

#### 二十一、Bayes Predictor 的证明：先读懂，再理解

这是第三章第一个特别值得做“理解证明”的地方。

##### 21.1 第一步：把整体问题拆成每个 \(x\) 的局部问题

真实风险：

$$
L_D(h)
=
P[h(X)\neq Y].
$$

使用条件期望思想，可以写成：

$$
L_D(h)
=
\mathbb E_X
\left[
P(h(X)\neq Y\mid X)
\right].
$$

也就是说：

> 总错误率，就是对每个 \(x\) 的局部错误率再求平均。

所以只要对每一个 \(x\)，都选局部错误最小的标签，那么整体期望也最小。

##### 21.2 第二步：固定一个 \(x\)

令：

$$
\eta(x)=P(Y=1\mid X=x).
$$

如果预测 0：

$$
R_x(0)=\eta(x).
$$

如果预测 1：

$$
R_x(1)=1-\eta(x).
$$

因此：

$$
\min\{R_x(0),R_x(1)\}
=
\min\{\eta(x),1-\eta(x)\}.
$$

所以：

$$
\eta(x)\ge\frac12
$$

时预测 1。

反之预测 0。

##### 21.3 第三步：局部最优推出整体最优

对任何分类器 \(g\)：

$$
P(f_D(x)\neq Y\mid X=x)
\le
P(g(x)\neq Y\mid X=x)
$$

对每个 \(x\) 都成立。

两边对 \(X\) 取期望：

$$
L_D(f_D)\le L_D(g).
$$

完成。

这就是 Exercise 7 要证明的结论。

#### 二十二、把 Bayes 证明压缩成一句话

> **0-1 risk 是各个 \(x\) 上条件错误率的平均，因此逐点选择条件概率最大的标签，就同时最小化每一点的错误，进而最小化整体期望错误。**

这句话比公式更值得记。

#### 二十三、这套证明真正可迁移的是什么？

这里藏着一个非常强的证明模板：

$$
\boxed{
\text{整体目标是期望}
\to
\text{条件化到 }X=x
\to
\text{逐点优化}
\to
\text{再取期望}
}
$$

以后你会反复见到它。

##### 23.1 用这个模板，可以预测平方损失的最优预测器

这不是本章正文给出的结论，但它可以直接由本章框架推出。

如果：

$$
\ell(a,y)=(a-y)^2,
$$

固定：

$$
X=x.
$$

我们要找：

$$
a^*(x)
=
\arg\min_a
\mathbb E[(a-Y)^2\mid X=x].
$$

展开：

$$
\begin{aligned}
\mathbb E[(a-Y)^2\mid x]
&=
\mathbb E[
(a-\mathbb E[Y\mid x]+\mathbb E[Y\mid x]-Y)^2
\mid x
]\\
&=
(a-\mathbb E[Y\mid x])^2
+
\operatorname{Var}(Y\mid x).
\end{aligned}
$$

第二项和 \(a\) 无关。

所以：

$$
\boxed{
a^*(x)=\mathbb E[Y\mid X=x].
}
$$

这就是为什么平方损失对应 conditional mean。

同样的世界观还能预测：

$$
\text{absolute loss}
\longrightarrow
\text{conditional median},
$$

$$
\text{0-1 loss}
\longrightarrow
\text{conditional mode}.
$$

这已经不是死记某个机器学习结论，而是在获得生成它们的“母结构”：

> **loss 决定“最佳预测”到底是哪种条件统计量。**

#### 二十四、Bayes error 表示什么？

Bayes predictor 仍可能出错。

它的风险：

$$
L_D(f_D)
$$

叫 Bayes risk。

对固定 \(x\)，最佳仍要付出的错误率是：

$$
\min\{\eta(x),1-\eta(x)\}.
$$

所以：

$$
L_D(f_D)
=
\mathbb E_X
\left[
\min\{\eta(X),1-\eta(X)\}
\right].
$$

这部分误差不是因为学习算法没学好。

而是：

> **仅凭 \(X\) 中的信息，本来就区分不了。**

这可以理解为该表示下的不可约不确定性。


### 第七部分：Agnostic PAC 的正式定义与含义

#### 二十五、为什么 Agnostic PAC 不直接要求逼近 Bayes Predictor？

这是非常重要的一步。

既然 \(f_D\) 最好，为什么不定义：

$$
L_D(h)
\le
L_D(f_D)+\epsilon
$$

呢？

因为 learner 不知道 \(D\)。

而且在对 \(D\) 完全不做结构假设的情况下，有限数据不可能保证恢复任意复杂的 Bayes rule。

所以我们还是需要 inductive bias。

也就是给定：

$$
H.
$$

然后问：

> 我能不能学到一个模型，其风险接近 \(H\) 中最好的模型？

原书明确指出，在不知道 \(D\) 且不额外假设其结构时，不能要求学习器达到 Bayes 最优，因此改为和某个 benchmark hypothesis class \(H\) 中的最佳模型比较。

#### 二十六、Agnostic PAC 的正式目标

定义：

$$
L_D^*(H)
=
\min_{h'\in H}L_D(h').
$$

那么我们要求学习算法输出的 \(h\) 满足：

$$
\boxed{
L_D(h)
\le
\min_{h'\in H}L_D(h')
+
\epsilon.
}
$$

并且这个事件发生的概率至少：

$$
1-\delta.
$$

即：

$$
\Pr_S
\left[
L_D(A(S))
\le
\min_{h'\in H}L_D(h')+\epsilon
\right]
\ge1-\delta.
$$

这就是 Definition 3.3。

#### 二十七、这里的 \(\epsilon\) 含义已经发生了微妙变化

原始 realizable PAC：

$$
L_D(h)\le\epsilon.
$$

这里的 \(\epsilon\) 是：

> 绝对错误率上限。

Agnostic PAC：

$$
L_D(h)
\le
\min_{h'\in H}L_D(h')+\epsilon.
$$

这里的 \(\epsilon\) 是：

> 你距离类内最优模型最多差多少。

也就是：

$$
\boxed{
L_D(h)-\min_{h'\in H}L_D(h')
\le\epsilon.
}
$$

这通常称为 excess risk 的思想。

原书也强调：agnostic PAC 是“相对于 \(H\) 中最好的分类器”定义成功，而原始 PAC 是要求绝对意义上的小错误。

#### 二十八、这一行公式其实把机器学习的三个误差来源分开了

从本章定义可以直接得到一个非常重要的分解。

设：

$$
f_D
$$

是 Bayes classifier。

那么：

$$
\begin{aligned}
L_D(h)-L_D(f_D)
&=
\left[
L_D(h)-\min_{h'\in H}L_D(h')
\right]\\
&\quad+
\left[
\min_{h'\in H}L_D(h')
-
L_D(f_D)
\right].
\end{aligned}
$$

第一项：

$$
L_D(h)-\min_H L_D
$$

表示：

> 你有没有把 \(H\) 这个模型类学好。

Agnostic PAC 希望它最多：

$$
\epsilon.
$$

第二项：

$$
\min_H L_D-L_D(f_D)
$$

表示：

> 就算把 \(H\) 学到完美，\(H\) 本身距离真正最优的预测规则还有多远。

这可以理解为模型类带来的 approximation error。

于是：

$$
\boxed{
\text{最终距离 Bayes 最优的差距}
=
\text{类内学习误差}
+
\text{模型类表达误差}.
}
$$

这正是后面 bias-complexity tradeoff 会进一步发展的种子。

#### 二十九、这解释了为什么 \(H\) 不能只追求越小越好或越大越好

如果 \(H\) 太小：

$$
\min_{h\in H}L_D(h)
$$

可能很大。

模型根本表达不了现实。

如果 \(H\) 很大：

$$
\min_{h\in H}L_D(h)
$$

通常会下降。

但学习这个类可能需要更多数据，甚至可能根本无法泛化。

所以：

$$
\boxed{
\text{更大的 }H
\Rightarrow
\text{更强表达能力},
}
$$

但通常也意味着：

$$
\text{更高统计复杂度}.
$$

这就是后面 Chapter 5、Chapter 6 真正要解决的矛盾。

#### 三十、为什么 Agnostic PAC 自动包含普通 PAC？

这就是 Exercise 6。

假设 realizability 成立。

那么存在：

$$
h^*\in H
$$

满足：

$$
L_D(h^*)=0.
$$

因此：

$$
\min_{h'\in H}L_D(h')=0.
$$

Agnostic PAC 保证：

$$
L_D(h)
\le
\min_{h'\in H}L_D(h')+\epsilon.
$$

代入：

$$
L_D(h)\le0+\epsilon.
$$

即：

$$
L_D(h)\le\epsilon.
$$

所以：

$$
\boxed{
\text{agnostic PAC learnable}
\Rightarrow
\text{PAC learnable}.
}
$$

这正是原书 Exercise 6。

#### 三十一、这个证明虽然只有两行，却非常值得学

它属于一个极常见的证明套路：

$$
\boxed{
\text{证明一个强定义推出弱定义}
=
\text{把弱问题嵌入强问题的特殊情形}.
}
$$

你不要想着重新证明一次泛化 bound。

只需要问：

> 普通 PAC 在 agnostic PAC 里面对应什么特殊参数？

答案就是：

$$
\min_HL_D=0.
$$

这种“特殊化证明”在数学里非常高频。

#### 三十二、从世界模型角度看，普通 PAC 与 Agnostic PAC 到底差在哪儿？

普通 PAC：

```text
x ~ D_X
   ↓
y = f(x)

标签是确定的
并且 f 可由 H 中某个模型完美表示
```

Agnostic PAC：

```text
(x,y) ~ D

P(y|x) 可以带噪声
真实关系不必属于 H
```

因此普通 PAC 同时做了两件很强的假设：

第一：

$$
Y
$$

给定 \(X\) 后是确定的。

第二：

这个确定规律可以由：

$$
H
$$

完美表示。

Agnostic 模型两个都拿掉了。
