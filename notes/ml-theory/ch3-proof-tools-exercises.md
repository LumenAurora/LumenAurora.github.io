---
title: "第三章（五）：证明工具箱、习题与极限压缩"
date: 2026-09-07
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "证明工具"
  - "习题"
  - "Measurability"
description: "第三章真正值钱的是可迁移的证明工具：量词审计、区分三种「未知」、pointwise→expected 优化等六个工具，以及 Measurability 等技术细节。本文逐题解析习题（Sample Complexity 单调性、无限 H 照样可学、Concentric Circles、i.i.d. 的……"
---

# 第三章（五）：证明工具箱、习题与极限压缩

> 第三章真正值钱的是可迁移的证明工具：量词审计、区分三种「未知」、pointwise→expected 优化等六个工具，以及 Measurability 等技术细节。本文逐题解析习题（Sample Complexity 单调性、无限 H 照样可学、Concentric Circles、i.i.d. 的必要性、No-Free-Lunch），最后把第三章压缩成「八句话」并预测第四章会做什么。

### 第十一部分：第三章埋藏的六个可迁移证明工具

#### 四十六、现在进入你特别要求的“理解证明”层：第三章到底教了哪些可迁移证明方式？

第三章看似是定义章，但它实际上埋了很多证明母版。

这些比死记 PAC 定义重要得多。

##### 46.1 工具一：量词审计

看到任何 learning theorem，先问：

$$
\forall D?
$$

还是只对某个 \(D\)？

$$
\forall f?
$$

还是假设 \(f\in H\)？

算法能不能依赖 \(D\)？

样本数能不能依赖 \(D\)？

概率是对：

$$
S
$$

还是对：

$$
x
$$

取的？

这是以后读学习理论定理最重要的习惯之一。

很多“看起来差不多”的 theorem，其强弱差异实际上都藏在量词顺序里。

#### 四十七、工具二：区分三种“未知”

学习问题里经常混着三种东西。

第一种：

$$
D
$$

未知。

第二种：

$$
\text{最佳 }h^*
$$

未知。

第三种：

$$
S
$$

随机。

不要把它们混成“模型不知道世界”。

PAC 的结构非常精确：

> \(D\) 固定但未知，\(S\) 从 \(D\) 随机产生，算法观察 \(S\)，输出随机的 \(A(S)\)。

很多概率证明一旦把这三个层次拆开，就会清楚很多。

#### 四十八、工具三：pointwise optimization \(\to\) expected optimization

Bayes predictor 的证明告诉我们：

如果目标是：

$$
E[\text{某种关于 }X\text{ 的局部损失}],
$$

而不同 \(x\) 之间的决策互不约束，那么可以：

$$
\boxed{
\text{固定 }x
\to
\text{求条件最优决策}
\to
\text{对 }X\text{ 求平均}.
}
$$

这是一个极强的生成模板。

它能自动生成很多 optimal predictor。

#### 四十九、工具四：证明“强概念推出弱概念”时先找特殊情形

Exercise 6：

$$
\text{agnostic PAC}
\Rightarrow
\text{PAC}
$$

根本不需要新概率工具。

只需要意识到 realizable 情况下：

$$
\min_HL_D=0.
$$

这类证明的第一反应应该是：

> 弱定义是不是强定义的某个特殊参数配置？

如果是，直接代进去。

#### 五十、工具五：benchmark-relative thinking

Agnostic PAC 把目标从：

$$
L_D(h)\le\epsilon
$$

升级为：

$$
L_D(h)
-
\min_{h'\in H}L_D(h')
\le\epsilon.
$$

这种形式以后会到处出现：

$$
\text{我的表现}
-
\text{某个 benchmark}
\le\epsilon.
$$

例如 optimization 里的 optimality gap：

$$
f(x)-f(x^*),
$$

online learning 里的 regret：

$$
\text{我的累计损失}
-
\text{最佳固定策略累计损失},
$$

统计里的 excess risk：

$$
L(h)-L(h^*).
$$

它们本质是同一个思维：

$$
\boxed{
\text{无法要求绝对完美时，
就和合理的参照系比较。}
}
$$

#### 五十一、工具六：区分“世界不可预测”与“模型没学好”

Agnostic setting 中：

$$
L_D(f_D)>0
$$

可能是世界本身的噪声。

而：

$$
\min_{h\in H}L_D(h)-L_D(f_D)
$$

是 \(H\) 表达能力造成的。

而：

$$
L_D(h)-\min_{h'\in H}L_D(h')
$$

才是“我们没把这个类学到位”。

这三个东西绝不能混。

可以画成：

```text
Bayes risk
   │
   │  世界本身不可消除的不确定性
   ▼
L_D(f_D)
   │
   │  H 的表达能力不够
   ▼
min_{h∈H} L_D(h)
   │
   │  有限数据 / 学习造成的 excess risk
   ▼
L_D(h)
```

这张图很值得长期保留。


### 第十二部分：习题深度解析

#### 五十二、现在用第三章习题把“适用边界”真正挖出来

原书这章的习题其实设计得很好，因为它们开始故意攻击正文里的假设。

#### 五十三、Exercise 1：Sample Complexity 为什么随 \(\epsilon,\delta\) 单调？

书中让证明：

如果：

$$
0<\epsilon_1\le\epsilon_2,
$$

那么：

$$
m_H(\epsilon_1,\delta)
\ge
m_H(\epsilon_2,\delta).
$$

为什么？

因为：

$$
\epsilon_1
$$

更小，要求更严格。

任何满足：

$$
L_D(h)\le\epsilon_1
$$

的模型当然也满足：

$$
L_D(h)\le\epsilon_2.
$$

所以：

> 实现严格目标所需样本数不可能少于宽松目标。

同样：

$$
0<\delta_1\le\delta_2
$$

时：

$$
m_H(\epsilon,\delta_1)
\ge
m_H(\epsilon,\delta_2).
$$

因为：

$$
1-\delta_1
$$

要求更高置信度。

这题真正练的不是不等式。

是：

> **遇到最优资源函数，通常先用“可行集合包含关系”证明单调性。**

#### 五十四、Exercise 2：一个无限大的 \(H\)，竟然照样 PAC learnable

这是特别值得讲的一题。

定义：

$$
H_{\text{Singleton}}
=
\{h_z:z\in X\}\cup\{h^-\},
$$

其中：

$$
h_z(x)
=
\begin{cases}
1,&x=z,\\
0,&x\neq z,
\end{cases}
$$

而：

$$
h^-(x)=0
$$

对所有 \(x\) 都成立。

如果 \(X\) 无限：

$$
|H_{\text{Singleton}}|=\infty.
$$

所以第二章：

$$
\log|H|
$$

那个 bound 完全没法用。

但这个类仍然很好学。

##### 54.1 先设计算法

如果训练集中出现一个正样本：

$$
(z,1),
$$

那么直接输出：

$$
h_z.
$$

如果训练集一个正样本都没出现：

$$
\text{输出 }h^-.
$$

在 realizability 下这就是一个 ERM。

##### 54.2 如果真实函数是 \(h^-\)

那什么都不用学：

$$
L_D(h^-)=0.
$$

##### 54.3 如果真实函数是 \(h_z\)

令：

$$
p=D(\{z\}).
$$

如果：

$$
p\le\epsilon,
$$

即使学习器完全没看到 \(z\)，输出：

$$
h^-
$$

也只有：

$$
p\le\epsilon
$$

的错误率。

所以已经成功。

##### 54.4 真正危险的是 \(p>\epsilon\)

此时如果训练集中见过一次 \(z\)：

$$
\text{算法就会恢复 }h_z.
$$

所以失败只能发生在：

$$
m\text{ 个样本一次都没抽到 }z.
$$

概率：

$$
(1-p)^m.
$$

因为：

$$
p>\epsilon,
$$

所以：

$$
(1-p)^m
<
(1-\epsilon)^m
\le
e^{-\epsilon m}.
$$

要求它：

$$
\le\delta,
$$

只需：

$$
m
\ge
\frac{\log(1/\delta)}{\epsilon}.
$$

所以：

$$
\boxed{
m_H(\epsilon,\delta)
\le
\left\lceil
\frac{\log(1/\delta)}{\epsilon}
\right\rceil.
}
$$

这就是原书 Exercise 2 要你证明的 PAC learnability。

#### 五十五、Singleton 这题真正证明了什么？

它直接击碎：

$$
\text{无限 hypothesis class}
\Rightarrow
\text{不可学习}
$$

这种错误直觉。

虽然这里模型有无限多个，但它们的结构极其简单：

> 每个模型最多只允许一个点是正类。

所以有效复杂度很低。

这强烈预示：

$$
\boxed{
\text{cardinality 不是本质；
模型之间能产生多少种独立变化才是本质。}
}
$$

这就是为什么后面需要 VC dimension。

#### 五十六、Exercise 3：Concentric Circles 又揭示了一层结构

书中考虑：

$$
H=\{h_r:r\in\mathbb R_+\},
$$

其中：

$$
h_r(x)
=
\mathbf1[\|x\|\le r].
$$

这是所有以原点为圆心的圆形分类器。

这里：

$$
H
$$

仍然是无限的。

但所有模型具有一个特别强的结构：

$$
r_1<r_2
\Rightarrow
\{x:h_{r_1}(x)=1\}
\subseteq
\{x:h_{r_2}(x)=1\}.
$$

也就是说这些正区域是**嵌套的**。

所以虽然有无限多个候选：

> 它们不是无限多个彼此独立的自由选择。

本质上只有一个参数：

$$
r.
$$

这再次告诉你：

$$
\boxed{
\text{“模型数量”与“模型自由度”不是一回事。}
}
$$

#### 五十七、Exercise 5：i.i.d. 中的“identically distributed”真的必不可少吗？

这题很有价值，因为它开始检查正文假设到底用到了多少。

现在：

$$
x_i\sim D_i,
$$

不同样本可以来自不同分布。

只要求它们**独立**。

定义平均分布：

$$
\bar D_m
=
\frac{D_1+\cdots+D_m}{m}.
$$

书中要求证明：

$$
P
\left[
\exists h\in H:
L_{\bar D_m,f}(h)>\epsilon,
\quad
L_S(h)=0
\right]
\le
|H|e^{-\epsilon m}.
$$

#### 五十八、Exercise 5 的证明

固定一个坏假设 \(h\)。

令：

$$
p_i=L_{D_i,f}(h).
$$

那么：

$$
L_{\bar D_m,f}(h)
=
\frac1m
\sum_{i=1}^mp_i.
$$

因为 \(h\) 是坏的：

$$
\frac1m\sum_{i=1}^mp_i>\epsilon.
$$

##### 58.1 训练集上零错误的概率

第 \(i\) 个样本没有暴露 \(h\) 错误的概率：

$$
1-p_i.
$$

样本相互独立，所以：

$$
P[L_S(h)=0]
=
\prod_{i=1}^m(1-p_i).
$$

注意：

> 到这里我们只用了 independence，没有用 identical distribution。

##### 58.2 用 AM-GM

对：

$$
1-p_1,\ldots,1-p_m
$$

使用几何均值不超过算术均值：

$$
\left(
\prod_{i=1}^m(1-p_i)
\right)^{1/m}
\le
\frac1m
\sum_{i=1}^m(1-p_i).
$$

右边：

$$
=
1-\frac1m\sum_{i=1}^mp_i
<
1-\epsilon.
$$

所以：

$$
\prod_{i=1}^m(1-p_i)
<
(1-\epsilon)^m
\le
e^{-\epsilon m}.
$$

最后对所有：

$$
h\in H
$$

union bound：

$$
P(\exists\text{ bad }h\text{ surviving})
\le
|H|e^{-\epsilon m}.
$$

完成。

#### 五十九、Exercise 5 真正应该留下的东西

正文说 i.i.d.。

但这道题告诉你：

$$
\boxed{
\text{对于这个具体泛化证明，
“identically distributed”并不是最本质的；
真正关键的是独立性和平均错误率控制。}
}
$$

这是“理解证明”与“读懂证明”的差别。

只读懂：

> 书上用了 i.i.d.

真正理解：

> 我知道 i.i.d. 的哪一部分在哪一步被用；拿掉其中一部分还能不能证明。

这正是你要求的“预测能力”。

#### 六十、再进一步：如果 independence 也没有了呢？

第二章核心一步是：

$$
P(\text{所有样本都没暴露错误})
=
\prod_iP(\text{第 }i\text{ 个没暴露错误}).
$$

一旦样本高度相关，这个乘积就不存在。

极端情况：

$$
x_1=x_2=\cdots=x_m.
$$

看似有 \(m\) 个样本，

实际上只有一次信息。

所以：

$$
m
$$

再大也未必带来：

$$
e^{-\epsilon m}
$$

的指数衰减。

因此独立性真正提供的是：

$$
\boxed{
\text{新样本提供“新证据”的能力。}
}
$$

这比“i.i.d. 是教科书标准假设”深得多。

#### 六十一、Exercise 8 又在暗示 No-Free-Lunch

书中定义：

算法 \(A\) 比 \(B\) 更好，如果对所有训练集：

$$
L_D(A(S))
\le
L_D(B(S)).
$$

然后让你研究：

> 有没有 universally better learner？

这里已经在为 Chapter 5 的 No-Free-Lunch 做铺垫。

固定一个 \(D\)：

> 当然存在“最佳算法”。

因为如果你知道 \(D\)，直接忽略数据，输出：

$$
f_D
$$

就行。

但不存在一个 learner 能对所有可能的 \(D\) 都天然占优。

为什么？

因为：

> 不同的世界要求不同的 inductive bias。

没有任何偏好的算法，不可能神奇地适合一切世界。

#### 六十二、概率化预测器为什么也打不过 Bayes classifier？

Exercise 8 还让你考虑：

$$
h(x)\in[0,1]
$$

表示以概率 \(h(x)\) 预测 1。

固定 \(x\)，令：

$$
\eta=P(Y=1\mid x),
\qquad
q=h(x).
$$

那么条件错误率：

$$
q(1-\eta)+(1-q)\eta.
$$

展开：

$$
=
\eta+q(1-2\eta).
$$

这是关于 \(q\) 的线性函数。

如果：

$$
\eta>\frac12,
$$

系数：

$$
1-2\eta<0,
$$

所以最小值在：

$$
q=1.
$$

如果：

$$
\eta<\frac12,
$$

最小值在：

$$
q=0.
$$

所以随机化没有帮助。

最优策略仍是确定性的 Bayes rule。

这揭示一个一般原则：

$$
\boxed{
\text{如果目标关于混合概率是线性的，
随机混合不能优于最佳纯策略。}
}
$$

这和优化、博弈论中的极点思想是同一个结构。


### 第十三部分：整章抽象层次塔

#### 六十三、第三章的抽象层次塔

现在把整章整理成一棵树。

```text
Level 0：我们需要形式化“学会”

        ↓

Level 1：PAC
任意 ε、δ
只要样本足够多
就能以 ≥1-δ 概率把真实错误控制到 ε

        ↓

Level 2：Sample Complexity
m_H(ε,δ)
学习一个假设类需要多少数据？

        ↓

Level 3：现实问题
realizability 太强

        ↓

Level 4：联合分布
从 D_X + f
升级到 D over X×Y

        ↓

Level 5：Bayes Optimal
如果知道 D，
逐点选择条件概率最大的标签

        ↓

Level 6：Agnostic PAC
无法要求绝对低误差
改为：
L_D(h) ≤ min_{h'∈H}L_D(h') + ε

        ↓

Level 7：分类仍太特殊

        ↓

Level 8：General Loss
ℓ : H×Z → R_+

        ↓

Level 9：Risk
L_D(h)=E_D[ℓ(h,Z)]

Empirical Risk
L_S(h)=1/m Σℓ(h,z_i)

        ↓

Level 10：General Agnostic PAC
有限样本学习出一个
接近 H 内最优 expected loss 的模型
```


### 第十四部分：第二章与第三章的衔接 + 对第四章的预测

#### 六十四、把第三章和第二章真正接起来

第二章：

$$
\boxed{
\text{有限 }H
\Rightarrow
\text{ERM 能泛化}.
}
$$

第三章问：

> 这个结论背后的“学会”到底应该怎么定义？

于是得到：

$$
\boxed{\text{PAC learnability}}
$$

然后继续追问：

> 如果真模型不在 \(H\) 里怎么办？

得到：

$$
\boxed{\text{agnostic PAC}}
$$

再问：

> 如果不是二分类怎么办？

得到：

$$
\boxed{\text{general loss}}
$$

所以 Chapter 3 本质上是在逐层剥掉 Chapter 2 的偶然条件：

$$
\text{binary}
$$

不是本质。

$$
f
$$

确定标签也不是本质。

$$
L_{0-1}
$$

也不是本质。

真正留下来的是：

$$
\boxed{
\text{有限随机样本}
\to
\text{学习规则}
\to
\text{真实 expected loss}
\to
\text{与某个 benchmark 比较}.
}
$$

#### 六十五、第三章最重要的“世界观”是什么？

##### 65.1 Learnability 是一个类的性质，不是某个训练结果的性质

“这个模型这次训练得不错”和：

$$
H\text{ is PAC learnable}
$$

完全不同。

PAC learnability 是说：

> 存在一个统一算法，对所有允许的真实世界，只要数据足够多，都能获得规定的统计保证。

这是一个非常强的 uniform statement。

##### 65.2 机器学习理论研究的是“从有限经验到总体规律”的合法性

优化解决：

$$
\min_h L_S(h).
$$

学习理论解决：

$$
L_S(h)\text{ 很小}
\quad\text{为什么能说明}\quad
L_D(h)\text{ 很小？}
$$

这是两个完全不同的问题。

一个模型可以：

$$
L_S(h)=0
$$

但根本不泛化。

所以：

$$
\boxed{
\text{optimization}
\neq
\text{generalization}.
}
$$

##### 65.3 \(H\) 是先验知识的数学接口

\(H\) 告诉学习器：

> 哪些世界解释值得考虑。

它越丰富，越容易逼近真实规律。

但也越难根据有限数据区分。

这将自然引出：

$$
\text{complexity of }H.
$$

##### 65.4 Loss 是任务语义的数学接口

\(H\) 回答：

> 我允许用哪些模型？

\(\ell\) 回答：

> 我在乎什么错误？

\(D\) 回答：

> 世界会产生什么数据？

这三个东西：

$$
\boxed{(H,\ell,D)}
$$

几乎就是整个统计学习问题的三大结构件。

#### 六十六、第三章“证明预测器”：以后遇到类似定理先预测它会怎么证明

这一点非常重要。

以后遇到：

> “证明某个 \(H\) PAC learnable。”

先别算。

先问：

##### 第一问：目标是什么？

realizable：

$$
P[L_D(A(S))>\epsilon]\le\delta.
$$

agnostic：

$$
P[
L_D(A(S))-\inf_HL_D>\epsilon
]
\le\delta.
$$

##### 第二问：什么事件会导致失败？

试图定义：

$$
\text{bad hypotheses}
$$

或者：

$$
\text{bad samples}.
$$

##### 第三问：固定一个坏对象，它“幸存”的概率是多少？

通常用：

$$
(1-\epsilon)^m,
$$

Hoeffding，

Chernoff，

或者后面更一般的 concentration inequality。

##### 第四问：需要同时控制多少个对象？

有限：

$$
\text{union bound}.
$$

无限：

> 不能直接数 \(|H|\)，要寻找 effective complexity。

于是会导向：

$$
VC,\text{ growth function, covering number, Rademacher complexity}.
$$

这就是你以后读 Chapter 4、6、26、27 时应该提前预测到的证明发展路线。

#### 六十七、从第三章可以提前预测 Chapter 4 会干什么

现在最自然的问题就是：

Agnostic setting 里 ERM 能不能学？

假设：

$$
h_S\in\arg\min_{h\in H}L_S(h).
$$

我们想证明：

$$
L_D(h_S)
\le
\min_{h\in H}L_D(h)+\epsilon.
$$

如果能够保证：

$$
\boxed{
\forall h\in H,\quad
|L_S(h)-L_D(h)|
\text{ 都很小},
}
$$

那么事情就几乎自动完成。

因为设：

$$
h^*\in\arg\min_{h\in H}L_D(h).
$$

如果对所有 \(h\) 都有：

$$
|L_S(h)-L_D(h)|\le\gamma,
$$

那么：

$$
L_D(h_S)
\le
L_S(h_S)+\gamma.
$$

ERM 给出：

$$
L_S(h_S)
\le
L_S(h^*).
$$

再用：

$$
L_S(h^*)
\le
L_D(h^*)+\gamma.
$$

于是：

$$
L_D(h_S)
\le
L_D(h^*)+2\gamma.
$$

取：

$$
\gamma=\epsilon/2,
$$

便有：

$$
L_D(h_S)
\le
\min_HL_D+\epsilon.
$$

你看，Chapter 4 甚至还没开始，我们已经可以预测它的核心工具：

$$
\boxed{\text{Uniform Convergence}}
$$

也就是：

> 经验风险和真实风险不仅对一个固定 \(h\) 接近，而是对所有 \(h\in H\) 同时接近。

这就是第三章的定义自然“生成”出的下一章。

#### 六十八、这就是所谓“后续生成能力”

如果一个知识点真的吃透，你应该能不用看目录就猜出后面必须研究什么。

第三章结束以后，逻辑上必然出现三个问题：

##### 68.1 ERM 什么时候能保证 agnostic PAC？

需要研究：

$$
L_S
\quad\text{和}\quad
L_D
$$

的统一接近程度。

于是 Chapter 4：

$$
\text{Uniform Convergence}.
$$

##### 68.2 什么 \(H\) 可以做到 uniform convergence？

有限 \(|H|\) 太粗。

于是 Chapter 6：

$$
\text{VC Dimension}.
$$

##### 68.3 更复杂的 \(H\) 是更好还是更坏？

更大 \(H\)：

$$
\text{approximation error}\downarrow
$$

但：

$$
\text{estimation difficulty}\uparrow.
$$

于是 Chapter 5：

$$
\text{Bias-Complexity Tradeoff}.
$$

这不是背目录。

是从第三章的逻辑缺口自己推出后续章节。


### 第十五部分：最终极限压缩——八句话记住第三章

#### 六十九、最后把第三章压缩到可以真正长期记住

如果几年后只允许留下八句话，我建议留这些。

第一句：

$$
\boxed{
\text{PAC 定义“可学习”：
任意 }\epsilon,\delta,
\text{足够多样本后，
以 }1-\delta\text{ 概率得到真实误差}\le\epsilon.
}
$$

第二句：

$$
\boxed{
m_H(\epsilon,\delta)
=
\text{达到指定准确度和置信度所需的最小样本量}.
}
$$

第三句：

$$
\boxed{
\text{PAC 的概率是对训练集 }S\text{ 取的；
}L_D(h)\text{ 本身已经是对未来数据取的概率。}
}
$$

第四句：

$$
\boxed{
\text{realizability 太强，因此把 }(D_X,f)
\text{ 升级为 }D(X,Y).
}
$$

第五句：

$$
\boxed{
\text{Bayes rule：
对每个 }x\text{ 选择条件概率最大的标签；
证明靠“逐点条件优化再取期望”。}
}
$$

第六句：

$$
\boxed{
\text{Agnostic PAC 不要求绝对正确，
而要求 }
L_D(h)\le\min_{h'\in H}L_D(h')+\epsilon.
}
$$

第七句：

$$
\boxed{
\text{general loss 把所有问题统一为 }
L_D(h)=E[\ell(h,Z)],
\quad
L_S(h)=\frac1m\sum_i\ell(h,z_i).
}
$$

第八句：

$$
\boxed{
\text{下一步的核心问题必然是：
什么时候 }L_S(h)\text{ 能对所有 }h\in H
\text{ 同时逼近 }L_D(h)？
}
$$

而这个问题的答案，正是第四章的 **Uniform Convergence**。
