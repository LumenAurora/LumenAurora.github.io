---
title: "第二章（二）：真实风险、经验风险与 ERM"
date: 2026-09-11
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "经验风险最小化"
  - "ERM"
  - "Loss"
description: "有了形式化框架，就可以定义「模型到底好不好」：真实风险（期望损失）与经验风险（训练误差）。本文讲清二者的区别，并引出经验风险最小化（ERM）——用「局部世界」（训练集）估计「真实世界」为何如此自然又如此合理。"
---

# 第二章（二）：真实风险、经验风险与 ERM

> 有了形式化框架，就可以定义「模型到底好不好」：真实风险（期望损失）与经验风险（训练误差）。本文讲清二者的区别，并引出经验风险最小化（ERM）——用「局部世界」（训练集）估计「真实世界」为何如此自然又如此合理。

### 第三部分：真实风险与经验风险的定义（Loss & Risk）

#### 九、现在终于可以定义“模型到底好不好”

我们真正想问的是：

> 随机从真实世界抽一个新的 \(x\)，模型 \(h\) 判断错的概率是多少？

于是定义

$$
L_{D,f}(h)
=
\Pr_{x\sim D}[h(x)\neq f(x)].
$$

也可以写成：

$$
L_{D,f}(h)
=
D\left(\{x:h(x)\neq f(x)\}\right).
$$

原书把它称为 true error、generalization error、risk，它们在这里说的是同一个东西。

##### 这个公式究竟在说什么？

先看集合

$$
E_h=\{x:h(x)\neq f(x)\}.
$$

它表示：

> 所有被 \(h\) 分类错误的地方。

然后看

$$
D(E_h).
$$

它表示：

> 真实世界落进这块“错误区域”的概率质量是多少。

所以

$$
L_{D,f}(h)
$$

根本不是“错误点的个数”。

它是错误区域占真实概率分布的多少。

这是非常重要的一点。

#### 十、用 0-1 loss 看这个公式会更自然

定义 indicator：

$$
\mathbf 1[h(x)\neq f(x)]
=
\begin{cases}
1,&h(x)\neq f(x),\\
0,&h(x)=f(x).
\end{cases}
$$

那么：

$$
L_{D,f}(h)
=
\mathbb E_{x\sim D}
\left[
\mathbf 1[h(x)\neq f(x)]
\right].
$$

为什么？

因为一个只取 \(0,1\) 的随机变量的期望就是它取 \(1\) 的概率。

所以：

$$
\boxed{
\text{分类错误率}
=
\text{0-1 loss 的期望}.
}
$$

这也是为什么机器学习理论经常把“risk”理解成 expected loss。

#### 十一、问题来了：这个东西根本算不出来

我们想最小化：

$$
L_{D,f}(h).
$$

理想上我们应该做：

$$
h^*
=
\arg\min_h L_{D,f}(h).
$$

但是：

$$
D\text{ 不知道，}\qquad f\text{ 也不知道}.
$$

所以

$$
L_{D,f}(h)
$$

根本没法直接计算。

这就逼出了整章第一个算法思想：

> 既然真正的风险算不了，那就用训练数据上的风险代替。

这就是 Empirical Risk Minimization。


### 第四部分：经验风险最小化（2.2 ERM）

#### 十二、2.2 ERM：用“局部世界”估计“真实世界”

定义训练误差：

$$
L_S(h)
=
\frac{
|\{i\in[m]:h(x_i)\neq y_i\}|
}{m}.
$$

这里

$$
[m]=\{1,\ldots,m\}.
$$

换成人话就是：

$$
L_S(h)
=
\frac{\text{训练集中判断错的数量}}
{\text{训练样本总数}}.
$$

也可以写为

$$
L_S(h)
=
\frac1m
\sum_{i=1}^m
\mathbf 1[h(x_i)\neq y_i].
$$

它又叫 empirical error 或 empirical risk。

然后我们选择

$$
h
$$

使

$$
L_S(h)
$$

最小。

这就是：

$$
\boxed{\text{ERM：Empirical Risk Minimization}}
$$

即经验风险最小化。原书正是从“真实风险不可观察，而训练风险可以计算”这个矛盾推出 ERM 的。

#### 十三、ERM 为什么看起来如此合理？

这里可以做一个非常重要的小推导。

先固定一个 \(h\)。

注意，一定是先固定 \(h\)。

定义

$$
Z_i=\mathbf1[h(x_i)\neq f(x_i)].
$$

那么

$$
L_S(h)=\frac1m\sum_{i=1}^mZ_i.
$$

由于

$$
x_i\sim D,
$$

所以

$$
\mathbb E[Z_i]
=
\Pr[h(x_i)\neq f(x_i)]
=
L_{D,f}(h).
$$

因此

$$
\begin{aligned}
\mathbb E_S[L_S(h)]
&=
\mathbb E
\left[
\frac1m\sum_{i=1}^mZ_i
\right]\\
&=
\frac1m\sum_{i=1}^m\mathbb E[Z_i]\\
&=
L_{D,f}(h).
\end{aligned}
$$

于是：

$$
\boxed{
\mathbb E_S[L_S(h)]
=
L_{D,f}(h)
}
$$

这其实就是本章 Exercise 2 要你证明的结论。

所以 empirical risk 并不是瞎造出来的。

对于一个预先固定的 \(h\)：

$$
L_S(h)
$$

确实是

$$
L_D(h)
$$

的自然估计量。
