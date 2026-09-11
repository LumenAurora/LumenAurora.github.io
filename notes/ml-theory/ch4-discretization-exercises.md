---
title: "第四章（六）：Discretization、习题与极限压缩"
date: 2026-09-11
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "Discretization"
  - "习题"
  - "极限压缩"
description: "无限类能否先粗暴离散化？Remark 4.1 的 Discretization Trick 给出一种思路。本文解析习题 1（高概率趋零 ⇔ 期望趋零）、习题 2（Loss Range 推广），最后用世界模型与抽象层次塔收束第四章，并做极限压缩与对后续的前瞻。"
---

# 第四章（六）：Discretization、习题与极限压缩

> 无限类能否先粗暴离散化？Remark 4.1 的 Discretization Trick 给出一种思路。本文解析习题 1（高概率趋零 ⇔ 期望趋零）、习题 2（Loss Range 推广），最后用世界模型与抽象层次塔收束第四章，并做极限压缩与对后续的前瞻。

### 第十六部分：习题 2——Loss Range 的推广

#### 二十五、习题 2：loss range 从 \([0,1]\) 推广到 \([a,b]\)

原书 Exercise 4.5.2：

如果：

$$
\ell(h,z)\in[a,b],
$$

证明：

$$
m_H(\epsilon,\delta)
\le
m_H^{UC}(\epsilon/2,\delta)
\le
\left\lceil
\frac{
2\log(2|H|/\delta)(b-a)^2
}{
\epsilon^2
}
\right\rceil.
$$

这题其实是在检查：

> Corollary 4.6 中 \([0,1]\) 到底被用在哪里？

答案：只被用在 Hoeffding 的：

$$
b-a=1.
$$

其他证明全部不用改。

#### 二十六、习题 2 第一步：固定一个 \(h\)

固定：

$$
h\in H.
$$

定义：

$$
\theta_i
=
\ell(h,z_i).
$$

因为：

$$
\ell(h,z)\in[a,b],
$$

所以：

$$
a\le\theta_i\le b.
$$

并且：

$$
E[\theta_i]
=
L_D(h).
$$

而：

$$
L_S(h)
=
\frac1m\sum_i\theta_i.
$$

因此 Hoeffding 直接给：

$$
P
\left[
|L_S(h)-L_D(h)|>\gamma
\right]
\le
2
\exp
\left(
-\frac{2m\gamma^2}{(b-a)^2}
\right).
$$

这里我故意先用：

$$
\gamma
$$

而不是 \(\epsilon\)。

因为 uniform convergence 的精度和最终 agnostic PAC 的精度稍后还要有一个 \(1/2\) 转换。

这样不容易把两个 \(\epsilon\) 混掉。

#### 二十七、习题 2 第二步：对整个有限 \(H\) union bound

定义：

$$
E_h
=
\{
|L_S(h)-L_D(h)|>\gamma
\}.
$$

那么：

$$
\begin{aligned}
P
\left[
\exists h\in H:E_h
\right]
&\le
\sum_{h\in H}P(E_h)\\
&\le
|H|
\cdot
2
\exp
\left(
-\frac{2m\gamma^2}{(b-a)^2}
\right).
\end{aligned}
$$

所以：

$$
\boxed{
P
\left[
\sup_{h\in H}|L_S(h)-L_D(h)|>\gamma
\right]
\le
2|H|
\exp
\left(
-\frac{2m\gamma^2}{(b-a)^2}
\right).
}
$$

#### 二十八、习题 2 第三步：反解 uniform convergence sample complexity

希望失败概率至多：

$$
\delta.
$$

要求：

$$
2|H|
\exp
\left(
-\frac{2m\gamma^2}{(b-a)^2}
\right)
\le
\delta.
$$

除以：

$$
2|H|,
$$

得到：

$$
\exp
\left(
-\frac{2m\gamma^2}{(b-a)^2}
\right)
\le
\frac{\delta}{2|H|}.
$$

取 log：

$$
-\frac{2m\gamma^2}{(b-a)^2}
\le
-\log\frac{2|H|}{\delta}.
$$

乘以 \(-1\)：

$$
\frac{2m\gamma^2}{(b-a)^2}
\ge
\log\frac{2|H|}{\delta}.
$$

所以：

$$
m
\ge
\frac{
(b-a)^2
\log(2|H|/\delta)
}{
2\gamma^2
}.
$$

因此：

$$
\boxed{
m_H^{UC}(\gamma,\delta)
\le
\left\lceil
\frac{
(b-a)^2
\log(2|H|/\delta)
}{
2\gamma^2
}
\right\rceil.
}
$$

#### 二十九、习题 2 第四步：从 uniform convergence 转成 agnostic PAC

Lemma 4.2 要最终 excess risk：

$$
\le\epsilon,
$$

只需要：

$$
\gamma=\frac\epsilon2.
$$

代入：

$$
m_H(\epsilon,\delta)
\le
m_H^{UC}(\epsilon/2,\delta).
$$

再代上界：

$$
m_H^{UC}(\epsilon/2,\delta)
\le
\left\lceil
\frac{
(b-a)^2
\log(2|H|/\delta)
}{
2(\epsilon/2)^2
}
\right\rceil.
$$

由于：

$$
(\epsilon/2)^2
=
\frac{\epsilon^2}{4},
$$

所以分母：

$$
2\cdot\frac{\epsilon^2}{4}
=
\frac{\epsilon^2}{2}.
$$

因此：

$$
\boxed{
m_H(\epsilon,\delta)
\le
m_H^{UC}(\epsilon/2,\delta)
\le
\left\lceil
\frac{
2(b-a)^2\log(2|H|/\delta)
}{
\epsilon^2
}
\right\rceil.
}
$$

恰好是题目要求。

#### 三十、习题 2 还能怎样想到？——归一化视角

这题还有一个很漂亮的理解方式。

如果：

$$
\ell\in[a,b],
$$

定义归一化损失：

$$
\tilde\ell
=
\frac{\ell-a}{b-a}.
$$

那么：

$$
\tilde\ell\in[0,1].
$$

而：

$$
\tilde L_D(h)
=
\frac{L_D(h)-a}{b-a},
$$

$$
\tilde L_S(h)
=
\frac{L_S(h)-a}{b-a}.
$$

所以：

$$
|\tilde L_S(h)-\tilde L_D(h)|
=
\frac{
|L_S(h)-L_D(h)|
}{
b-a
}.
$$

原尺度要求：

$$
|L_S-L_D|\le\gamma
$$

等价于归一化尺度要求：

$$
|\tilde L_S-\tilde L_D|
\le
\frac\gamma{b-a}.
$$

把 \([0,1]\) 情形的：

$$
m
\sim
\frac1{\tilde\gamma^2}
$$

代入：

$$
\tilde\gamma
=
\frac\gamma{b-a},
$$

就得到：

$$
m
\sim
\frac{(b-a)^2}{\gamma^2}.
$$

这解释了为什么 range width 是平方出现：

$$
\boxed{(b-a)^2}.
$$

##### 30.1 为什么只出现 \(b-a\)，而不关心 \(a\) 和 \(b\) 各自多大？

例如两个 loss：

$$
[0,1]
$$

和：

$$
[1000,1001].
$$

从 estimation 的角度难度完全一样。

因为第二个只是整体加了 1000。

所有模型的经验风险与真实风险都一起平移：

$$
L\mapsto L+1000.
$$

差值：

$$
L_S-L_D
$$

完全不变。

所以 concentration 只应依赖：

$$
\boxed{b-a}
$$

而不是绝对位置。

这是一个很好的 sanity check。

#### 三十一、习题 2 的精髓压缩

###### 定理内容

> 如果 loss 位于任意有限区间 \([a,b]\)，有限假设类仍然 agnostic PAC learnable，样本复杂度相比 \([0,1]\) 情形只多一个 \((b-a)^2\) 因子。

###### 证明思想

> 固定假设后直接套一般区间版 Hoeffding，再 union bound；最后把 uniform 精度设置为 \(\epsilon/2\)。

###### 世界模型

> **真正影响均值估计难度的不是损失的绝对大小，而是单次损失能够波动的范围。**

###### 机械化模板

以后看到：

$$
X_i\in[a,b],
$$

自动替换：

$$
[0,1]\text{ Hoeffding}
\quad\to\quad
\exp\left(
-\frac{2m\epsilon^2}{(b-a)^2}
\right).
$$

其余 finite-class uniform convergence 证明原封不动。


### 第十七部分：第四章的世界模型与抽象层次塔

#### 三十二、第四章真正建立的“学习理论世界模型”

学完这一章以后，最好不要把脑中留下的东西变成：

> “finite class + Hoeffding + union bound。”

那还是太低层。

真正应该留下的是这张结构图：

```text
真实世界给每个 h 一个真实风险
            L_D(h)

                  ↑
                  │  我们看不到
                  │
            随机训练样本 S
                  │
                  ↓

训练集给每个 h 一个经验风险
            L_S(h)

如果对所有 h：
|L_S(h)-L_D(h)| 都很小

        ↓

经验风险地形 ≈ 真实风险地形

        ↓

ERM 在经验地形找最低点

        ↓

这个最低点在真实地形中也近似最低
```

这是本章真正的核心模型：

$$
\boxed{
\text{Generalization}
=
\text{risk landscape preservation}.
}
$$

#### 三十三、第四章的抽象层次塔

##### 第一层：我们最终要什么？

Agnostic PAC：

$$
L_D(h_S)
\le
\inf_{h\in H}L_D(h)+\epsilon.
$$

##### 第二层：怎样保证 ERM 做到？

只要：

$$
\sup_{h\in H}
|L_S(h)-L_D(h)|
\le
\epsilon/2.
$$

##### 第三层：怎样让这件事高概率发生？

研究：

$$
P
\left[
\sup_h|L_S(h)-L_D(h)|>\epsilon
\right].
$$

##### 第四层：有限 \(H\) 怎么办？

union bound：

$$
P(\sup_h\cdots)
\le
\sum_hP(\cdots).
$$

##### 第五层：固定 \(h\) 怎么办？

$$
L_S(h)
=
\frac1m\sum_i\ell(h,z_i)
$$

是 i.i.d. 样本均值。

所以 concentration。

##### 第六层：有界 loss 用什么 concentration？

Hoeffding：

$$
P(|L_S-L_D|>\epsilon)
\le
2e^{-2m\epsilon^2/(b-a)^2}.
$$

##### 第七层：合起来

$$
P
\left[
\sup_h|L_S-L_D|>\epsilon
\right]
\le
2|H|e^{-2m\epsilon^2/(b-a)^2}.
$$

##### 第八层：反解样本数

$$
m
=
O\left(
\frac{
(b-a)^2
(\log|H|+\log(1/\delta))
}{
\epsilon^2
}
\right).
$$


### 第十八部分：极限压缩与前瞻

#### 三十四、只记五句话，如何现场重建整章？

如果以后只允许保留五句话，我建议保留这些。

第一句：

$$
\boxed{
\text{固定 }h\text{ 泛化不够，因为 ERM 的 }h_S
\text{ 是看过数据以后选的。}
}
$$

第二句：

$$
\boxed{
\text{所以要控制 }
\sup_{h\in H}|L_S(h)-L_D(h)|,
\text{这就是 uniform convergence。}
}
$$

第三句：

$$
\boxed{
L_D(h_S)
\le
L_S(h_S)+\gamma
\le
L_S(h^*)+\gamma
\le
L_D(h^*)+2\gamma.
}
$$

第四句：

$$
\boxed{
\text{固定 }h：
\text{Hoeffding }e^{-2m\epsilon^2};
\qquad
\text{所有 }h：
\text{union bound }\times|H|.
}
$$

第五句：

$$
\boxed{
m
=
O\left(
\frac{
\log|H|+\log(1/\delta)
}{
\epsilon^2
}
\right),
}
$$

所以 finite \(H\) 在 bounded loss 下是 agnostic PAC learnable。

如果这五句话能够从脑中自动展开，第四章的主体基本已经真正掌握。

#### 三十五、从第四章可以预测后面为什么必然要出现 VC Dimension

第四章现在卡在一个非常明确的位置：

$$
P
\left[
\sup_{h\in H}
|L_S(h)-L_D(h)|>\epsilon
\right].
$$

有限 \(H\) 时可以粗暴做：

$$
\sum_{h\in H}.
$$

但无限 \(H\) 不行。

所以接下来真正的问题已经不再是：

> \(H\) 有多少个元素？

而是：

> **当我们只观察有限的 \(m\) 个样本时，\(H\) 到底能在这些样本上制造多少种实质不同的行为？**

如果一个无限类虽然有无限多个参数值，但在任意 \(m\) 个点上只产生很有限的 labeling patterns，它仍然可能 uniform converge。

这就是 growth function 与 VC dimension 的逻辑来源。

换句话说，Chapter 6 不是作者突然发明 VC dimension。

它是第四章的 union bound 在：

$$
|H|=\infty
$$

时被逼出来的。

而在那之前，Chapter 5 还会先追问另一个更根本的问题：

> **既然小 \(H\) 容易泛化，大 \(H\) 更能逼近真实规律，那么 \(H\) 到底应该选多大？**

这就进入下一章的 **Bias-Complexity Tradeoff**。
