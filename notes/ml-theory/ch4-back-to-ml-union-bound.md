---
title: "第四章（四）：放回机器学习、Union Bound 与样本复杂度"
date: 2026-09-11
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "Union Bound"
  - "样本复杂度"
  - "Agnostic PAC"
description: "把 Hoeffding 放回机器学习，用 Union Bound 从固定 h 升级到整个有限 H；反解样本复杂度，得到 Agnostic PAC 的样本复杂度界。本文还解释一个反直觉的点：第二章是 1/ε，第四章却变成 1/ε²——二者解决的是本质不同的任务。"
---

# 第四章（四）：放回机器学习、Union Bound 与样本复杂度

> 把 Hoeffding 放回机器学习，用 Union Bound 从固定 h 升级到整个有限 H；反解样本复杂度，得到 Agnostic PAC 的样本复杂度界。本文还解释一个反直觉的点：第二章是 1/ε，第四章却变成 1/ε²——二者解决的是本质不同的任务。

### 第九部分：把 Hoeffding 放回机器学习

#### 十二、把 Hoeffding 放回机器学习

第四章正文进一步假设：

$$
\ell(h,z)\in[0,1].
$$

固定 \(h\)。

令：

$$
\theta_i=\ell(h,z_i).
$$

则：

$$
a=0,\qquad b=1.
$$

所以 Hoeffding 给：

$$
\boxed{
P
\left[
|L_S(h)-L_D(h)|>\epsilon
\right]
\le
2e^{-2m\epsilon^2}.
}
$$

这正是原书式 (4.2)。

这里是非常关键的一刻：

> 对于一个固定模型，样本复杂度与 \(H\) 有多大完全无关。

因为我们根本没在挑模型。

复杂度代价是在下一步同时控制所有模型时才出现的。


### 第十部分：Union Bound——从固定 \(h\) 升级到整个 \(H\)

#### 十三、Union Bound：从一个模型升级到整个有限 \(H\)

我们已有：

$$
P(E_h)
\le
2e^{-2m\epsilon^2}.
$$

其中：

$$
E_h
=
\{|L_S(h)-L_D(h)|>\epsilon\}.
$$

于是：

$$
\begin{aligned}
P(\exists h\in H:E_h)
&=
P\left(\bigcup_{h\in H}E_h\right)\\
&\le
\sum_{h\in H}P(E_h)\\
&\le
\sum_{h\in H}
2e^{-2m\epsilon^2}\\
&=
2|H|e^{-2m\epsilon^2}.
\end{aligned}
$$

这就是原书最终的 uniform convergence bound。

##### 13.1 这个式子到底在说什么？

$$
\boxed{
P
\left[
\sup_{h\in H}
|L_S(h)-L_D(h)|>\epsilon
\right]
\le
2|H|e^{-2m\epsilon^2}.
}
$$

右边分成两部分：

$$
|H|
$$

代表：

> 有多少次“碰巧估歪”的机会。

而：

$$
e^{-2m\epsilon^2}
$$

代表：

> 对一个固定模型，估歪这么多到底有多困难。

这两个力量在竞争：

$$
\boxed{
\text{模型越多，越容易找到一个偶然骗过数据的模型；
样本越多，每一个模型都越难骗过数据。}
}
$$

这和第二章其实是完全相同的世界观。


### 第十一部分：样本复杂度与 Agnostic PAC

#### 十四、反解 sample complexity

我们希望：

$$
2|H|e^{-2m\epsilon^2}
\le\delta.
$$

逐步解。

先除：

$$
e^{-2m\epsilon^2}
\le
\frac{\delta}{2|H|}.
$$

取 log：

$$
-2m\epsilon^2
\le
\log\frac{\delta}{2|H|}.
$$

右边：

$$
=
-\log\frac{2|H|}{\delta}.
$$

乘 \(-1\)：

$$
2m\epsilon^2
\ge
\log\frac{2|H|}{\delta}.
$$

因此：

$$
\boxed{
m
\ge
\frac{
\log(2|H|/\delta)
}{
2\epsilon^2
}.
}
$$

所以：

$$
\boxed{
m_H^{UC}(\epsilon,\delta)
\le
\left\lceil
\frac{\log(2|H|/\delta)}
{2\epsilon^2}
\right\rceil.
}
$$

这就是 Corollary 4.6 的 uniform convergence sample complexity。

#### 十五、从 Uniform Convergence 得到 Agnostic PAC 的样本复杂度

但刚才得到的是：

$$
\epsilon\text{-representative}.
$$

为了最终让 ERM excess risk：

$$
\le\epsilon,
$$

Lemma 4.2 要求：

$$
\frac\epsilon2\text{-representative}.
$$

所以代入：

$$
\gamma=\frac\epsilon2.
$$

有：

$$
m_H(\epsilon,\delta)
\le
m_H^{UC}(\epsilon/2,\delta).
$$

于是：

$$
m_H(\epsilon,\delta)
\le
\frac{
\log(2|H|/\delta)
}{
2(\epsilon/2)^2
}.
$$

计算分母：

$$
2\cdot\frac{\epsilon^2}{4}
=
\frac{\epsilon^2}{2}.
$$

所以：

$$
\boxed{
m_H(\epsilon,\delta)
\le
\left\lceil
\frac{
2\log(2|H|/\delta)
}{
\epsilon^2
}
\right\rceil.
}
$$

这正是原书 Corollary 4.6 最终得到的 agnostic PAC bound。


### 第十二部分：\(1/\epsilon\) vs \(1/\epsilon^2\)——两个任务的本质差异

#### 十六、为什么第二章是 \(1/\epsilon\)，第四章却变成 \(1/\epsilon^2\)？

这是整章非常值得理解的地方。

第二章 realizable：

$$
m
\sim
\frac{\log|H|}{\epsilon}.
$$

第四章 agnostic：

$$
m
\sim
\frac{\log|H|}{\epsilon^2}.
$$

为什么差了一个 \(\epsilon\)？

##### 16.1 第二章解决的是“抓住一个明显坏模型”

如果一个坏模型：

$$
L_D(h)>\epsilon.
$$

realizability 下 ERM 最终需要训练误差：

$$
L_S(h)=0.
$$

所以坏模型想幸存，必须：

> \(m\) 个样本一次都没有落入它至少 \(\epsilon\) 大小的错误区域。

概率：

$$
(1-\epsilon)^m
\approx e^{-\epsilon m}.
$$

令：

$$
e^{-\epsilon m}\approx\delta
$$

得到：

$$
m\sim\frac1\epsilon.
$$

##### 16.2 第四章解决的是“精确估计两个非常接近的均值”

agnostic 情况没有：

$$
L_S(h)=0.
$$

你需要区分两个风险可能只差：

$$
\epsilon
$$

的模型。

而样本均值的随机波动典型尺度是：

$$
\frac1{\sqrt m}.
$$

要让它小于：

$$
\epsilon,
$$

需要：

$$
\frac1{\sqrt m}\lesssim\epsilon.
$$

于是：

$$
\boxed{
m\gtrsim\frac1{\epsilon^2}.
}
$$

所以这不是证明技巧造成的偶然差异。

它反映了两个统计任务真的不同：

$$
\boxed{
\text{发现一个概率 }\epsilon\text{ 的错误区域}
\quad\text{vs}\quad
\text{估计一个均值到加性误差 }\epsilon.
}
$$

原书附录后面也指出 Bernstein inequality 可以在 Chapter 2 的 \(1/\epsilon\) 与 Chapter 4 的 \(1/\epsilon^2\) 两种 rate 之间插值。
