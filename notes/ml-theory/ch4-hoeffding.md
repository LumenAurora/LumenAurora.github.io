---
title: "第四章（三）：Hoeffding 不等式及其完整证明"
date: 2026-09-11
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "Hoeffding"
  - "集中不等式"
  - "证明"
description: "固定一个 h 时，经验风险与真实风险的差距由 Hoeffding 不等式控制。本文从直觉讲到有限样本版「大数定律」，再从头拆开证明 Hoeffding（中心化、指数化、凸性、Hoeffding's Lemma、选择 λ、上下尾），把它压缩成可复现的模板。"
---

# 第四章（三）：Hoeffding 不等式及其完整证明

> 固定一个 h 时，经验风险与真实风险的差距由 Hoeffding 不等式控制。本文从直觉讲到有限样本版「大数定律」，再从头拆开证明 Hoeffding（中心化、指数化、凸性、Hoeffding's Lemma、选择 λ、上下尾），把它压缩成可复现的模板。

### 第七部分：Hoeffding Inequality——固定 \(h\) 的集中工具

#### 七、固定一个 \(h\)：为什么问题变成 Hoeffding？

固定：

$$
h\in H.
$$

注意“固定”特别重要：

> \(h\) 必须在抽 \(S\) 之前选好。

定义：

$$
\theta_i=\ell(h,z_i).
$$

那么：

$$
L_S(h)
=
\frac1m\sum_{i=1}^m\theta_i.
$$

而：

$$
\mathbb E[\theta_i]
=
L_D(h).
$$

所以：

$$
|L_S(h)-L_D(h)|
=
\left|
\frac1m\sum_{i=1}^m\theta_i
-
\mathbb E[\theta_i]
\right|.
$$

这已经完全不是机器学习问题了。

它变成一个纯概率论问题：

> \(m\) 个 i.i.d. 有界随机变量的样本均值，会偏离真实均值多少？

原书在这里强调：大数定律只能告诉你 \(m\to\infty\) 时会收敛，但 PAC learning 需要的是**有限 \(m\) 时的定量概率界**，所以引入 Hoeffding inequality。

#### 八、Hoeffding Inequality：有限样本版“大数定律”

原书 Lemma 4.5：

设：

$$
\theta_1,\ldots,\theta_m
$$

i.i.d.，满足：

$$
\mathbb E[\theta_i]=\mu,
$$

并且几乎必然：

$$
a\le\theta_i\le b.
$$

那么：

$$
\boxed{
P\left(
\left|
\frac1m\sum_{i=1}^m\theta_i-\mu
\right|>\epsilon
\right)
\le
2\exp
\left(
-\frac{2m\epsilon^2}{(b-a)^2}
\right).
}
$$

##### 8.1 这个式子应该怎样读？

右边：

$$
2e^{-2m\epsilon^2/(b-a)^2}.
$$

看三个变量。

样本越多：

$$
m\uparrow
\quad\Rightarrow\quad
\text{失败概率指数下降}.
$$

允许误差越大：

$$
\epsilon\uparrow
\quad\Rightarrow\quad
\text{失败概率指数下降}.
$$

随机变量变化范围越大：

$$
b-a\uparrow
\quad\Rightarrow\quad
\text{越难估均值}.
$$

也就是说：

$$
\boxed{
\text{样本平均误差的典型尺度}
\sim
\frac{b-a}{\sqrt m}.
}
$$

反过来，要达到：

$$
|L_S-L_D|\lesssim\epsilon,
$$

一般需要：

$$
m\sim\frac1{\epsilon^2}.
$$

这就是第四章为什么出现：

$$
\frac1{\epsilon^2},
$$

而不是第二章的：

$$
\frac1\epsilon.
$$

后面我们还会专门解释。


### 第八部分：Hoeffding 证明的完整拆解

#### 九、Hoeffding 为什么成立？从头拆开证明

原书把证明放在 Appendix B，而第四章正文只引用结果。既然这条不等式是本章的发动机，我们把附录中的证明完整拆开。

证明的母思想可以先压成一句：

> **想控制“随机变量很大”的概率，就把它指数化，再用 Markov；独立性让指数矩可以相乘，有界性控制每个指数矩，最后优化一个自由参数。**

整个 concentration theory 中，这个套路会反复出现。

##### 9.1 第一步：中心化

定义：

$$
X_i
=
Z_i-\mathbb E[Z_i].
$$

于是：

$$
\mathbb E[X_i]=0.
$$

定义平均：

$$
\bar X
=
\frac1m\sum_{i=1}^mX_i.
$$

由于：

$$
\bar X
=
\frac1m\sum_iZ_i-\mu,
$$

所以我们要控制的就是：

$$
P(|\bar X|>\epsilon).
$$

###### 为什么要中心化？

因为 concentration 的核心问题是：

$$
\text{随机量}-\text{它的均值}.
$$

把均值减掉以后，后面所有表达式围绕 0 展开会更干净。

##### 9.2 第二步：为什么突然指数化？

先控制单边：

$$
P(\bar X\ge\epsilon).
$$

直接对 \(\bar X\) 用 Markov 不行，因为 \(X_i\) 可以为负。

Markov 要求非负随机变量。

于是我们构造：

$$
e^{\lambda\bar X},
\qquad
\lambda>0.
$$

它有两个好性质：

第一，它永远非负。

第二，指数函数单调递增，所以：

$$
\bar X\ge\epsilon
\iff
e^{\lambda\bar X}
\ge
e^{\lambda\epsilon}.
$$

因此：

$$
\begin{aligned}
P(\bar X\ge\epsilon)
&=
P(
e^{\lambda\bar X}\ge e^{\lambda\epsilon}
)\\
&\le
\frac{
\mathbb E[e^{\lambda\bar X}]
}{
e^{\lambda\epsilon}
}
\end{aligned}
$$

由 Markov inequality。

于是：

$$
\boxed{
P(\bar X\ge\epsilon)
\le
e^{-\lambda\epsilon}
\mathbb E[e^{\lambda\bar X}].
}
$$

这正是附录证明第一步。

##### 9.3 为什么这种招数如此常见？

因为我们把一个难处理的：

$$
P(X\ge t)
$$

转成了：

$$
E[e^{\lambda X}].
$$

后者叫 moment generating function / exponential moment。

这就是 Chernoff method 的核心世界观：

$$
\boxed{
\text{tail probability}
\longrightarrow
\text{exponential moment}.
}
$$

为什么指数特别好？

因为：

$$
e^{x_1+\cdots+x_m}
=
e^{x_1}\cdots e^{x_m}.
$$

所以它和 independence 天生匹配。

##### 9.4 第三步：独立性终于发挥作用

因为：

$$
\bar X
=
\frac1m\sum_iX_i,
$$

所以：

$$
e^{\lambda\bar X}
=
e^{\lambda\sum_iX_i/m}
=
\prod_{i=1}^m
e^{\lambda X_i/m}.
$$

取期望：

$$
E[e^{\lambda\bar X}]
=
E
\left[
\prod_{i=1}^m
e^{\lambda X_i/m}
\right].
$$

由于 \(X_i\) 独立：

$$
\boxed{
E[e^{\lambda\bar X}]
=
\prod_{i=1}^m
E[e^{\lambda X_i/m}].
}
$$

这一步是 independence 的精确使用位置。

#### 十、Hoeffding's Lemma：为什么“有界”能够控制指数矩？

现在只剩：

$$
E[e^{tX}]
$$

如何上界。

其中：

$$
E[X]=0,
\qquad
X\in[a,b].
$$

Hoeffding lemma 给出：

$$
\boxed{
E[e^{\lambda X}]
\le
\exp\left(
\frac{\lambda^2(b-a)^2}{8}
\right).
}
$$

原书附录 Lemma B.7。

下面完整解释。

##### 10.1 第一步：利用指数函数的凸性

因为：

$$
f(x)=e^{\lambda x}
$$

是凸函数。

凸函数最重要的几何性质：

> 图像位于任意两端点连线的下方。

对于：

$$
x\in[a,b],
$$

可以写成：

$$
x
=
\frac{b-x}{b-a}a
+
\frac{x-a}{b-a}b.
$$

注意两个权重：

$$
\frac{b-x}{b-a},
\qquad
\frac{x-a}{b-a}
$$

都非负，且和为 1。

由凸性：

$$
e^{\lambda x}
\le
\frac{b-x}{b-a}e^{\lambda a}
+
\frac{x-a}{b-a}e^{\lambda b}.
$$

###### 直觉

一个有界随机变量虽然可能在区间里有各种复杂分布，但对于凸指数函数来说：

> 最坏情况可以被区间两个端点控制。

这就是“只知道范围也能 concentration”的根源。

##### 10.2 第二步：取期望

对两边取期望：

$$
E[e^{\lambda X}]
\le
\frac{b-E[X]}{b-a}e^{\lambda a}
+
\frac{E[X]-a}{b-a}e^{\lambda b}.
$$

因为：

$$
E[X]=0,
$$

得到：

$$
E[e^{\lambda X}]
\le
\frac{b}{b-a}e^{\lambda a}
-
\frac{a}{b-a}e^{\lambda b}.
$$

##### 10.3 第三步：为什么引入 \(p\) 和 \(h\)？

令：

$$
p=\frac{-a}{b-a},
$$

那么：

$$
1-p
=
\frac b{b-a}.
$$

再令：

$$
h=\lambda(b-a).
$$

注意：

$$
a=-p(b-a),
$$

所以：

$$
\lambda a=-ph.
$$

而：

$$
b=(1-p)(b-a),
$$

所以：

$$
\lambda b=(1-p)h.
$$

于是前面的上界可以整理成：

$$
E[e^{\lambda X}]
\le
e^{-ph}
(1-p+pe^h).
$$

取 log，定义：

$$
L(h)
=
-ph+\log(1-p+pe^h).
$$

那么只要证明：

$$
L(h)\le\frac{h^2}{8},
$$

就得到：

$$
E[e^{\lambda X}]
\le
e^{h^2/8}
=
e^{\lambda^2(b-a)^2/8}.
$$

##### 10.4 最后一步：为什么 \(L(h)\le h^2/8\)？

计算：

$$
L(0)=0.
$$

再求导：

$$
L'(h)
=
-p
+
\frac{pe^h}{1-p+pe^h}.
$$

所以：

$$
L'(0)
=
-p+p
=
0.
$$

再求二阶导。

令：

$$
q(h)
=
\frac{pe^h}{1-p+pe^h}.
$$

则：

$$
L''(h)
=
q(h)(1-q(h)).
$$

由于：

$$
0\le q(h)\le1,
$$

而函数：

$$
q(1-q)
$$

在：

$$
q=\frac12
$$

处最大，最大值：

$$
\frac14.
$$

因此：

$$
L''(h)\le\frac14.
$$

由 Taylor 定理：

$$
L(h)
=
L(0)+L'(0)h+\frac12L''(\xi)h^2
$$

对某个 \(\xi\) 成立。

所以：

$$
L(h)
\le
0+0+\frac12\cdot\frac14h^2
=
\frac{h^2}{8}.
$$

因此：

$$
\boxed{
E[e^{\lambda X}]
\le
e^{\lambda^2(b-a)^2/8}.
}
$$

Hoeffding lemma 证完。

#### 十一、回到 Hoeffding Inequality

我们已经有：

$$
P(\bar X\ge\epsilon)
\le
e^{-\lambda\epsilon}
E[e^{\lambda\bar X}].
$$

而：

$$
E[e^{\lambda\bar X}]
=
\prod_{i=1}^m
E[e^{\lambda X_i/m}].
$$

每个 \(X_i\) 的区间宽度仍然是：

$$
b-a.
$$

Hoeffding lemma 给：

$$
E[e^{\lambda X_i/m}]
\le
\exp
\left(
\frac{\lambda^2(b-a)^2}{8m^2}
\right).
$$

乘 \(m\) 个：

$$
E[e^{\lambda\bar X}]
\le
\exp
\left(
\frac{\lambda^2(b-a)^2}{8m}
\right).
$$

因此：

$$
P(\bar X\ge\epsilon)
\le
\exp
\left(
-\lambda\epsilon
+
\frac{\lambda^2(b-a)^2}{8m}
\right).
$$

这正是原书附录得到的指数形式。

##### 11.1 为什么突然“选择 \(\lambda\)”？

前面的不等式对于任意：

$$
\lambda>0
$$

都成立。

所以我们应该选最有利的那个。

要最小化：

$$
-\lambda\epsilon
+
\frac{\lambda^2(b-a)^2}{8m}.
$$

这是关于 \(\lambda\) 的二次函数。

求导：

$$
-\epsilon
+
\frac{\lambda(b-a)^2}{4m}
=
0.
$$

于是：

$$
\lambda^*
=
\frac{4m\epsilon}{(b-a)^2}.
$$

代回：

$$
P(\bar X\ge\epsilon)
\le
\exp
\left(
-\frac{2m\epsilon^2}{(b-a)^2}
\right).
$$

原书也是在这里选择这个最优 \(\lambda\)。

##### 11.2 下尾怎么办？

对：

$$
-\bar X
$$

做完全一样的事情：

$$
P(\bar X\le-\epsilon)
\le
\exp
\left(
-\frac{2m\epsilon^2}{(b-a)^2}
\right).
$$

而：

$$
\{|\bar X|>\epsilon\}
=
\{\bar X>\epsilon\}
\cup
\{\bar X<-\epsilon\}.
$$

union bound：

$$
P(|\bar X|>\epsilon)
\le
2
\exp
\left(
-\frac{2m\epsilon^2}{(b-a)^2}
\right).
$$

这就是 Hoeffding。

##### 11.3 Hoeffding 证明压缩

###### 定理内容

> \(m\) 个独立同分布、有界随机变量的样本均值，以指数高概率落在真实均值附近。

###### 证明思想

> 指数化偏差事件，用 Markov 把尾概率转成指数矩；独立性把总指数矩分解成乘积；有界性通过凸性控制每个指数矩；最后优化指数参数。

###### 世界模型

> **独立样本的偶然偏差想要同方向累积到一个固定规模，需要付出指数级小的概率。**

###### 最值得迁移的证明模板

$$
\boxed{
P(X\ge t)
\to
P(e^{\lambda X}\ge e^{\lambda t})
\to
\text{Markov}
\to
E[e^{\lambda X}]
\to
\text{independence}
\to
\text{MGF bound}
\to
\min_\lambda.
}
$$

这就是 concentration inequality 的核心母版之一。
