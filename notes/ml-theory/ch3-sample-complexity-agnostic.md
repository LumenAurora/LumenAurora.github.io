---
title: "第三章（二）：Sample Complexity 与 Agnostic PAC"
date: 2026-09-11
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "Sample Complexity"
  - "Agnostic PAC"
  - "Realizability"
description: "把第二章的有限类定理重新解释为 PAC 样本复杂度，再迈出关键一步：删掉 Realizability 假设，进入 Agnostic PAC——世界不再有确定的 f，而是直接定义联合分布 D over X×Y。本文讲清这一「世界模型」升级为何必要，以及它如何让理论更贴近真实。"
---

# 第三章（二）：Sample Complexity 与 Agnostic PAC

> 把第二章的有限类定理重新解释为 PAC 样本复杂度，再迈出关键一步：删掉 Realizability 假设，进入 Agnostic PAC——世界不再有确定的 f，而是直接定义联合分布 D over X×Y。本文讲清这一「世界模型」升级为何必要，以及它如何让理论更贴近真实。

### 第四部分：Sample Complexity 与有限类 PAC 定理

#### 九、Sample Complexity：把“学得会”变成“需要多少信息”

原书把：

$$
m_H:(0,1)^2\to\mathbb N
$$

称为 \(H\) 的 sample complexity。

严格来说，满足 PAC 定义的函数不唯一。

例如如果 100 个样本够了，那么写 1000 个样本也当然够。

所以原书进一步把 sample complexity 定义成满足要求的**最小样本数函数**。

这其实非常值得重视。

“可学习”只是一个 yes/no 问题：

$$
H\text{ learnable or not}.
$$

sample complexity 则告诉你：

$$
\boxed{
\text{这个问题有多难学。}
}
$$

这和算法复杂度中的：

$$
O(n),O(n^2)
$$

角色非常相似。

#### 十、第二章的有限类定理，现在被重新解释成 PAC 定理

第二章已经证明：

$$
m
\ge
\frac{\log(|H|/\delta)}{\epsilon}
$$

足够。

因此第三章立刻得到：

$$
\boxed{
\text{任何有限假设类都是 PAC learnable。}
}
$$

并且：

$$
m_H(\epsilon,\delta)
\le
\left\lceil
\frac{\log(|H|/\delta)}{\epsilon}
\right\rceil.
$$

这就是原书 Corollary 3.2。

#### 十一、这一结论该怎样“理解证明”？

##### 11.1 一句话定理

> 候选规则只有有限多个时，足够多的独立样本可以高概率淘汰所有真实错误率超过 \(\epsilon\) 的候选规则。

##### 11.2 一句话证明

> 每个坏假设连续 \(m\) 次不暴露错误的概率最多 \(e^{-\epsilon m}\)，再对 \(|H|\) 个候选做 union bound。

##### 11.3 一句话世界模型

> **数据的作用不是直接“发现正确模型”，而是不断排除错误模型。**

这个视角非常重要。

每来一个新样本：

$$
\text{一些和现实不一致的假设被杀掉}.
$$

如果一个假设真实错误率很大，它越难长期存活。

所以学习可以理解成：

$$
\boxed{
\text{版本空间逐渐收缩}
}
$$

而不是神秘地“从数据中创造知识”。

#### 十二、这里已经能预测出一个重要问题

有限类 bound 用了：

$$
\log|H|.
$$

如果：

$$
|H|=\infty,
$$

这个证明就炸了。

可是：

> 无限多个模型真的一定不可学习吗？

显然不一定。

原书就在这里提醒：存在无限假设类也能够 PAC learn，后面真正决定 learnability 的将不是 cardinality，而是 VC dimension。

这告诉我们：

$$
\boxed{
|H|
\text{ 只是“复杂度”的第一个粗糙代理。}
}
$$

真正的问题不是：

> 有多少个模型？

而应该是：

> 这些模型在数据上能够表现出多少种实质不同的行为？

这正是 Chapter 6 的 VC dimension 会回答的问题。


### 第五部分：Agnostic PAC——删除 Realizability（3.2.1）

#### 十三、3.2 A More General Learning Model：为什么必须把第二章的世界拆掉？

第二章和 PAC 基础定义都依赖：

$$
\exists h^*\in H:
L_D(h^*)=0.
$$

也就是 realizability。

这句话相当于：

> **真实规律恰好就在我们事先设计的模型集合 \(H\) 里。**

现实里这往往太强。

原书仍然用木瓜举例：

> 我们真的能保证仅凭颜色和硬度，就存在一个矩形能够 100% 决定木瓜好不好吃吗？

显然没什么理由。

所以 Chapter 3 的下一步是：

$$
\boxed{
\text{删除 realizability。}
}
$$

原书把这一推广作为 3.2 的第一部分。

#### 十四、3.2.1 Agnostic PAC：世界不再有确定的 \(f\)

这是第三章真正重要的第二次抽象跃迁。

之前的世界是：

$$
x\sim D_X,
$$

然后：

$$
y=f(x).
$$

也就是说：

$$
x
\longrightarrow
f(x)
$$

标签完全由 \(x\) 决定。

#### 十五、为什么这个模型不够真实？

假设你只记录木瓜的：

$$
x=(\text{颜色},\text{硬度}).
$$

两个木瓜完全一样：

$$
x_1=x_2.
$$

它们难道必然一样好吃吗？

当然未必。

可能还有：

$$
\text{品种、糖度、成熟方式、储存温度、虫害……}
$$

这些变量没有被输入 \(X\)。

因此：

$$
P(Y=1\mid X=x)
$$

完全可能既不是 0，也不是 1。

例如：

$$
P(Y=1\mid X=x)=0.7.
$$

意思是：

> 这种颜色和硬度的木瓜中，大约 70% 好吃。

现在世界本身就带有不确定性。

这时根本不存在确定的：

$$
f(x)
$$

能够永远答对。

#### 十六、新的世界模型：直接定义联合分布 \(D\) over \(X\times Y\)

于是书中把原来的：

$$
D_X+f
$$

合并成：

$$
D
$$

一个定义在：

$$
X\times Y
$$

上的联合分布。

即：

$$
(x,y)\sim D.
$$

原书进一步解释，可以把这个联合分布理解成：

$$
D_X(x)
$$

和：

$$
D(y\mid x)
$$

两部分。

前者描述：

> 什么样的输入容易出现？

后者描述：

> 在给定这个输入以后，各个标签出现的概率是多少？

#### 十七、这是一个非常重要的概念升级

以前：

$$
D_X
$$

描述世界里有哪些木瓜。

$$
f
$$

描述每个木瓜的唯一正确答案。

现在变成：

$$
D(X,Y)
$$

统一描述：

> 世界会产生怎样的“输入—标签”对。

可以把老模型看成新模型的特例：

$$
P(Y=f(x)\mid X=x)=1.
$$

也就是说：

$$
\boxed{
\text{realizable PAC 世界}
\subset
\text{agnostic 世界}.
}
$$

这是后面 Exercise 6 “agnostic PAC learnable \(\Rightarrow\) PAC learnable”几乎一眼就能看出的根本原因。

#### 十八、True Risk 也要重新定义

原来：

$$
L_{D,f}(h)
=
P_{x\sim D}[h(x)\neq f(x)].
$$

现在没有确定 \(f\) 了。

所以自然变成：

$$
\boxed{
L_D(h)
=
P_{(x,y)\sim D}[h(x)\neq y].
}
$$

也就是：

> 从真实世界随机产生一个输入—标签对，模型预测错的概率。

原书式 (3.1) 正是：

$$
L_D(h)
=
D\left(
\{(x,y):h(x)\neq y\}
\right).
$$

经验风险仍然是：

$$
L_S(h)
=
\frac{
|\{i:h(x_i)\neq y_i\}|
}{m}.
$$

#### 十九、现在出现了一个严肃问题：零错误率可能根本不存在

比如某一个输入 \(x\)：

$$
P(Y=1\mid x)=0.7,
\qquad
P(Y=0\mid x)=0.3.
$$

你无论输出什么，都不可能总正确。

输出：

$$
1
$$

仍有：

$$
30\%
$$

概率错。

输出：

$$
0
$$

则有：

$$
70\%
$$

概率错。

所以：

$$
\min_h L_D(h)>0
$$

完全可能。

那么 PAC 里原来的目标：

$$
L_D(h)\le\epsilon
$$

对于任意小 \(\epsilon\) 根本不可能。

这不是算法不够强。

是世界本身含有不可预测性。
