---
title: "第四章（一）：动机与 ε-representative sample"
date: 2026-09-11
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "Uniform Convergence"
  - "ε-representative"
  - "ERM"
description: "第二章只证明「固定一个 h」时经验风险逼近真实风险；但 ERM 选出的 h_S 依赖训练集，不是固定的。本文讲清这个漏洞为何致命，并引入 ε-representative sample——训练集「足够代表世界」时，ERM 的 h_S 也近似最优。这是 Uniform Convergence 故事的真……"
---

# 第四章（一）：动机与 ε-representative sample

> 第二章只证明「固定一个 h」时经验风险逼近真实风险；但 ERM 选出的 h_S 依赖训练集，不是固定的。本文讲清这个漏洞为何致命，并引入 ε-representative sample——训练集「足够代表世界」时，ERM 的 h_S 也近似最优。这是 Uniform Convergence 故事的真正起点。

### 引言：本章要解决的根本问题

> 第三章最后我们已经把问题逼到了一个非常明确的位置：
>
> 给定假设类 \(H\)，真实风险是
>
> $$
> L_D(h)=\mathbb E_{z\sim D}[\ell(h,z)],
> $$
>
> 但我们看不到 \(D\)，只能看到训练样本
>
> $$
> S=(z_1,\ldots,z_m),
> $$
>
> 于是能计算的只有经验风险
>
> $$
> L_S(h)=\frac1m\sum_{i=1}^m\ell(h,z_i).
> $$
>
> ERM 做的是：
>
> $$
> h_S\in\arg\min_{h\in H}L_S(h).
> $$
>
> 可是我们真正想要的是：
>
> $$
> L_D(h_S)\approx \min_{h\in H}L_D(h).
> $$
>
> 因此第三章留下的核心问题就是：
>
> > **凭什么“经验风险最小”能推出“真实风险接近最小”？**
>
> 第四章第一次给出一个非常一般的回答：
>
> > 如果一批训练数据不仅能正确估计某一个固定模型的真实风险，而是能**同时正确估计 \(H\) 中所有模型的真实风险**，那么训练集上的风险地形就和真实世界中的风险地形差不多。此时在训练地形上找到最低点，自然不会离真实地形的最低点太远。
>
> 这就是 **uniform convergence，统一收敛**。
>
> 原书明确把第四章的目标概括为：发展 uniform convergence 这一一般工具，并用它证明，只要损失有界，任何有限假设类都是 agnostic PAC learnable。


### 第一部分：全局预览——本章的完整逻辑链

#### 一、本章的 storyline：真正发生了什么？

先不要急着看 Hoeffding、union bound。

整章只有这样一条主线：

```text
我们想证明 ERM 泛化
        ↓
ERM 选出的 h_S 依赖于训练集 S
        ↓
所以只证明“固定 h 的经验风险接近真实风险”不够
        ↓
必须让所有 h∈H 同时满足
L_S(h) ≈ L_D(h)
        ↓
这叫 uniform convergence
        ↓
如果 uniform convergence 成立
ERM 自动接近真实最优
        ↓
有限 H 怎么证明 uniform convergence？
        ↓
对一个固定 h：Hoeffding concentration
        ↓
对所有 h：union bound
        ↓
得到
P(∃h: |L_S(h)-L_D(h)|>ε)
≤2|H|e^{-2mε²}
        ↓
反解 m
        ↓
finite H agnostic PAC learnable
```

这一章最值得留下的并不是某个常数 \(2\)，而是这个证明母版：

$$
\boxed{
\text{先控制一个固定对象}
\quad+\quad
\text{再把控制升级为对整个类同时成立}.
}
$$

这将成为后面 VC dimension、Rademacher complexity、covering number 等理论的祖先。


### 第二部分：动机——为什么“固定一个 \(h\)”不够

#### 二、为什么“固定一个 \(h\)”还不够？

这是第四章真正的起点。如果这一点没吃透，uniform convergence 会显得像作者凭空发明了一个很强的条件。

##### 2.1 对固定模型，事情其实很简单

假设在抽训练数据之前，我们已经固定好了一个模型：

$$
h.
$$

定义随机变量：

$$
\theta_i=\ell(h,z_i).
$$

因为：

$$
z_i\overset{\text{i.i.d.}}{\sim}D,
$$

所以：

$$
\mathbb E[\theta_i]
=
\mathbb E_{z\sim D}[\ell(h,z)]
=
L_D(h).
$$

而：

$$
L_S(h)
=
\frac1m\sum_{i=1}^m\theta_i.
$$

于是：

$$
\mathbb E_S[L_S(h)]
=
L_D(h).
$$

换句话说，对于一个**提前固定**的模型：

> 经验风险只是很多独立损失的平均，它天然应该围绕真实风险波动。

原书正是这样把

$$
|L_S(h)-L_D(h)|
$$

解释成“样本均值偏离其期望”的 concentration 问题。

##### 2.2 但 ERM 的 \(h_S\) 不是固定的

ERM 输出：

$$
h_S\in\arg\min_{h\in H}L_S(h).
$$

注意下标：

$$
h_S.
$$

它是**看过 \(S\) 以后专门挑出来的**。

这就产生了 selection bias。

假设有一万人做一道完全靠运气的考试。

每个人事先考满分的概率都很低。

但你考试结束以后，从一万人里挑出成绩最好的那个，再说：

> “这个人考了满分，所以他的真实能力一定特别强。”

显然不成立。

问题不是每个人的考试成绩不是能力的估计。

问题在于：

> **你专门根据这次考试结果挑了一个极端者。**

ERM 正在做同样的事情：

$$
h_S=\text{“在当前样本上表现最漂亮的那个”}.
$$

所以：

$$
\boxed{
\text{固定 }h\text{ 的 concentration}
\not\Rightarrow
\text{数据依赖的 }h_S\text{ 也泛化}.
}
$$

##### 2.3 那怎样才能彻底堵住这个漏洞？

一个很强但非常自然的办法：

让所有 \(h\in H\) 都同时满足

$$
L_S(h)\approx L_D(h).
$$

如果做到这一点，ERM 就无处钻空子。

它无论根据 \(S\) 选择谁，那个 \(h\) 的经验风险都没有严重骗人。

于是出现第四章的核心对象：

$$
\sup_{h\in H}
|L_S(h)-L_D(h)|.
$$

uniform convergence 就是在控制它。


### 第三部分：核心概念——\(\epsilon\)-representative sample

#### 三、\(\epsilon\)-representative sample：训练集什么时候“足够代表世界”？

原书 Definition 4.1 定义：

如果对所有

$$
h\in H
$$

都有：

$$
|L_S(h)-L_D(h)|\le\epsilon,
$$

那么称训练集 \(S\) 是一个 \(\epsilon\)-representative sample。

也就是：

$$
\boxed{
S\text{ 是 }\epsilon\text{-representative}
\iff
\sup_{h\in H}|L_S(h)-L_D(h)|\le\epsilon.
}
$$

##### 3.1 为什么叫 representative？

因为 \(S\) 不仅能代表总体对某一个模型的评价。

而是：

> 它对整个候选模型集合 \(H\) 的评分都和真实世界差不多。

可以把 \(L_D\) 和 \(L_S\) 想成两张“风险地形图”。

真实地形：

$$
h\mapsto L_D(h).
$$

训练地形：

$$
h\mapsto L_S(h).
$$

如果 \(S\) 是 \(\epsilon\)-representative，那么对每个位置 \(h\)：

$$
L_S(h)
$$

与

$$
L_D(h)
$$

的高度差都至多 \(\epsilon\)。

也就是说，整张地图没有某个地方突然塌出一个“训练集专属深坑”。

这就是 uniform 的核心。
