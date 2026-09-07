---
title: "第三章（四）：General Loss 抽象化与 Proper/Improper Learning"
date: 2026-09-07
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "Loss"
  - "General Loss"
  - "Proper Learning"
description: "「分类」只是外壳。本文把 Loss 抽象成任务自己定义的「什么叫犯错」，得到 True Risk / Empirical Risk 的最终形式，使回归等任务自然进入框架；进而定义 General Agnostic PAC，并区分 Proper Learning 与 Improper Learning……"
---

# 第三章（四）：General Loss 抽象化与 Proper/Improper Learning

> 「分类」只是外壳。本文把 Loss 抽象成任务自己定义的「什么叫犯错」，得到 True Risk / Empirical Risk 的最终形式，使回归等任务自然进入框架；进而定义 General Agnostic PAC，并区分 Proper Learning 与 Improper Learning——二者真正区分的是「你允许哪些候选解」。

### 第八部分：General Loss——彻底抽象化（3.2.2）

#### 三十三、3.2.2：为什么“分类”也只是一个外壳？

到目前为止仍然在讨论：

$$
Y=\{0,1\}.
$$

但现实任务还包括：

$$
Y=\{\text{猫、狗、鸟、……}\}
$$

的多分类，

以及：

$$
Y=\mathbb R
$$

的回归。

原书因此继续把模型推广到 multiclass classification 和 regression。

但作者很快意识到：

> 真正应该抽象的，不是标签空间 \(Y\) 长什么样，而是“一个预测究竟坏多少”的衡量方式。

于是 loss function 出现了。

#### 三十四、Loss Function：把“什么叫错误”交给任务自己定义

定义一个一般的 example space：

$$
Z.
$$

定义假设类：

$$
H.
$$

定义损失函数：

$$
\boxed{
\ell:H\times Z\to\mathbb R_+.
}
$$

其中：

$$
\ell(h,z)
$$

表示：

> 模型 \(h\) 在样本 \(z\) 上付出多少代价。

原书特别把 \(Z\) 写成一般集合，而不是强制：

$$
Z=X\times Y.
$$

因为这样以后连非监督任务也能够放入同样框架。

#### 三十五、True Risk 的最终抽象形式

如果：

$$
z\sim D,
$$

那么定义：

$$
\boxed{
L_D(h)
=
\mathbb E_{z\sim D}
[\ell(h,z)].
}
$$

这句话值得直接翻译：

> 一个模型真正的好坏，就是它在真实世界随机样本上的平均损失。

这已经是极其通用的机器学习定义。

#### 三十六、Empirical Risk 的最终形式

我们看不到整个 \(D\)。

只能看到：

$$
S=(z_1,\ldots,z_m).
$$

于是：

$$
\boxed{
L_S(h)
=
\frac1m
\sum_{i=1}^m
\ell(h,z_i).
}
$$

这就是：

> 用有限样本平均损失估计真实期望损失。

原书式 (3.3)、(3.4) 正是这个统一形式。

#### 三十七、到这里，其实机器学习的统计骨架已经完全形成

可以压缩成：

$$
\boxed{
L_D(h)
=
\mathbb E_D[\ell(h,Z)]
}
$$

但 \(D\) 不知道，所以我们只能算：

$$
\boxed{
L_S(h)
=
\frac1m\sum_i\ell(h,z_i).
}
$$

然后核心问题永远是：

$$
\boxed{
L_S(h)\text{ 小}
\quad\Longrightarrow?\quad
L_D(h)\text{ 小}.
}
$$

第二章是：

$$
0\text{-}1\text{ loss}
+
\text{realizable}
+
|H|<\infty
$$

下的第一个答案。

后面的几十章基本都是在换：

$$
H,\ell,\text{算法},\text{数据模型}
$$

以后继续回答同一个问题。

#### 三十八、0-1 Loss 只是一般 Loss 的一个特例

定义：

$$
\ell_{0-1}(h,(x,y))
=
\begin{cases}
0,&h(x)=y,\\
1,&h(x)\neq y.
\end{cases}
$$

那么：

$$
L_D(h)
=
\mathbb E[
\mathbf 1(h(X)\neq Y)
].
$$

由于 indicator 的期望等于事件概率：

$$
L_D(h)
=
P[h(X)\neq Y].
$$

所以前面的分类错误率完全被统一进：

$$
\mathbb E[\ell].
$$

原书特意说明了这个等价关系。

#### 三十九、Square Loss：回归也进来了

对于回归：

$$
h(x)\in\mathbb R,
\qquad
y\in\mathbb R.
$$

定义：

$$
\ell_{\mathrm{sq}}(h,(x,y))
=
(h(x)-y)^2.
$$

于是：

$$
L_D(h)
=
\mathbb E_{(x,y)\sim D}
[(h(x)-y)^2].
$$

这正是原书用出生体重预测为例给出的 regression risk。

#### 四十、Loss 的选择其实是在定义“什么叫一个好模型”

这个洞察非常重要。

同一个预测错误：

$$
h(x)-y=10
$$

在不同 loss 下受到的惩罚完全不同。

Square loss：

$$
10^2=100.
$$

Absolute loss：

$$
|10|=10.
$$

0-1 loss 如果只是关心对错：

$$
1.
$$

所以：

$$
\boxed{
\ell
\text{ 不是一个数学附件，它实际上定义了任务目标。}
}
$$

“哪个模型最好”不是脱离 loss 独立存在的。

必须先回答：

> 你认为什么样的错误更严重？


### 第九部分：General Agnostic PAC 与 Proper/Improper Learning

#### 四十一、General Agnostic PAC：现在终于得到这一章最终版本

原书 Definition 3.4：

给定：

$$
H,
\qquad
Z,
\qquad
\ell:H\times Z\to\mathbb R_+.
$$

如果存在学习算法和 sample complexity：

$$
m_H(\epsilon,\delta)
$$

使得对任意：

$$
D\text{ over }Z,
$$

当：

$$
m\ge m_H(\epsilon,\delta)
$$

时，以至少：

$$
1-\delta
$$

概率输出：

$$
h\in H
$$

满足：

$$
\boxed{
L_D(h)
\le
\min_{h'\in H}L_D(h')
+\epsilon,
}
$$

那么 \(H\) 关于这个 loss 是 agnostic PAC learnable。

到这里，“木瓜二分类”的具体故事几乎全部消失了。

只剩：

$$
\boxed{
(Z,D,H,\ell,S,A).
}
$$

这就是抽象层次塔的顶层。

#### 四十二、这一层抽象为什么强？

因为现在你以后看到不同机器学习问题，可以先问五件事：

##### 42.1 数据是什么？

$$
z\in Z.
$$

##### 42.2 世界怎么产生数据？

$$
z\sim D.
$$

##### 42.3 我允许哪些候选解？

$$
h\in H.
$$

##### 42.4 什么叫犯错？

$$
\ell(h,z).
$$

##### 42.5 从有限数据怎样找到低真实风险的 \(h\)？

$$
S\to A(S).
$$

几乎所有统计学习问题都可以先拆成这五个接口。

这是一种很强的建模能力。

#### 四十三、Proper Learning 和 Improper Learning

原书还有一个带星号的 Remark 3.2。

前面的定义要求：

$$
h\in H.
$$

即学习算法最后输出的模型也必须属于 benchmark class \(H\)。

这叫 proper learning。

但有时我们允许输出：

$$
h'\in H'
$$

其中：

$$
H\subset H'.
$$

只要最后仍能和：

$$
\min_{h\in H}L_D(h)
$$

竞争：

$$
L_D(h')
\le
\min_{h\in H}L_D(h)+\epsilon.
$$

这叫 representation-independent learning，也常被叫 improper learning。

#### 四十四、Proper / Improper 真正区分的是什么？

这里其实区分了两个概念：

$$
\text{benchmark class}
$$

和：

$$
\text{output class}.
$$

它们不一定非得一样。

你可以说：

> “我的目标是至少做到和所有线性分类器里最好的那个一样好。”

但最后算法输出的预测器不一定非得本身就是一个线性分类器。

这说明：

$$
\boxed{
H
\text{首先是一个比较基准，
不必永远等于算法最终的表示形式。}
}
$$

这个观念在后面的学习理论中非常有用。


### 第十部分：技术性细节（Measurability）

#### 四十五、Measurability 为什么被作者塞进一个 Remark？

Definition 3.4 用：

$$
L_D(h)=E[\ell(h,Z)].
$$

但想谈期望，就必须保证：

$$
\ell(h,\cdot)
$$

是合法随机变量。

这在严格概率论里意味着 measurability。

原书因此做了一个技术性说明。

如果当前目标是学习机器学习理论主干，可以把它压缩成一句：

> **measurability 是为了确保我们写的概率和期望真的在数学上有定义。**

它不是本章学习思想的核心。
