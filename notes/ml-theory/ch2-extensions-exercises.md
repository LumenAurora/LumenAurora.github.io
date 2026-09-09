---
title: "第二章（五）：延展、层次塔与习题"
date: 2026-09-07
category: "机器学习理论"
tags:
  - "机器学习理论"
  - "Uniform Convergence"
  - "习题"
  - "抽象层次"
description: "证明之后，本章还埋下 Uniform Convergence 的伏笔、辨析「finite H 只是新手版本」等常见错觉，用抽象层次塔梳理整章逻辑，并逐题解析课后习题（记忆分类器、经验风险的无偏性、Axis-Aligned Rectangles 等），最后把第二章压缩成可长期记住的自动反应。"
---

# 第二章（五）：延展、层次塔与习题

> 证明之后，本章还埋下 Uniform Convergence 的伏笔、辨析「finite H 只是新手版本」等常见错觉，用抽象层次塔梳理整章逻辑，并逐题解析课后习题（记忆分类器、经验风险的无偏性、Axis-Aligned Rectangles 等），最后把第二章压缩成可长期记住的自动反应。

### 第八部分：深层延展与理论铺垫（Uniform Convergence、无限类与假设辨析）

#### 四十五、第二章其实已经偷偷埋下了 Uniform Convergence

这里有一个非常值得提前意识到的结构。

对于固定 \(h\)：

$$
L_S(h)\approx L_D(h)
$$

通常不难。

真正困难的是 ERM 的 \(h_S\) 是看过 \(S\) 后选出来的。

所以我们真正需要的是：

$$
\boxed{
\text{对于所有 }h\in H，
L_S(h)\text{ 和 }L_D(h)
\text{ 同时都很接近。}
}
$$

也就是某种：

$$
\sup_{h\in H}
|L_S(h)-L_D(h)|
$$

很小。

这就是后面 Chapter 4 的 uniform convergence 思想。

第二章还没有正式这样讲，但它的证明已经在干同一件事的简化版：

> 同时防止所有 bad hypotheses 在训练集上伪装得太好。

#### 四十六、为什么 finite \(H\) 只是一个“新手版本”？

因为现实中的模型类往往无限。

例如：

$$
H=
\{x\mapsto\mathbf1[w^\top x+b\ge0]:
w\in\mathbb R^d,b\in\mathbb R\}.
$$

这个 \(H\) 有无限多个分类器。

此时：

$$
|H|=\infty.
$$

直接套：

$$
|H|e^{-\epsilon m}
$$

就废掉了。

但直觉并没有废。

真正的问题变成：

> \(H\) 虽然有无限多个函数，但它到底有多大的“有效表达能力”？

于是后面才会出现 VC dimension。

因此可以把：

$$
\log|H|
$$

理解为本书遇到的第一个“模型复杂度”。

后面的理论基本是在寻找更精细的复杂度度量。

#### 四十七、Realizability 到底限制了什么？

本章假设：

$$
\exists h^*\in H,\quad L_D(h^*)=0.
$$

但现实中这经常不成立。

比如真实规律极其复杂，而你规定：

$$
H=\{\text{直线分类器}\}.
$$

没有任何直线能做到零误差。

那么：

$$
L_S(h_S)=0
$$

也未必成立。

于是本章证明中非常关键的一环：

$$
\text{ERM失败}
\Rightarrow
\text{某个 bad }h\text{ 训练误差为0}
$$

就不能直接用了。

这正是下一章为什么要引入 agnostic PAC learning。

所以不要只记：

> realizability 是个假设。

要记它在证明里的功能：

$$
\boxed{
\text{realizability}
\Longrightarrow
\text{ERM训练误差为0}.
}
$$

把这个支点拿走，证明就必须升级。

#### 四十八、i.i.d. 假设到底在哪儿用到了？

也不要只背：

> 训练数据 i.i.d.

要定位到证明中的具体原子步骤：

$$
\Pr[
h(x_1)=f(x_1),\ldots,h(x_m)=f(x_m)
]
$$

变成：

$$
\prod_{i=1}^m
\Pr[h(x_i)=f(x_i)].
$$

就是这里。

如果样本高度相关，例如：

$$
x_1=x_2=\cdots=x_m,
$$

那么虽然你有 \(m\) 个数据，实际上只观察了一个不同样本。

此时根本不能得到：

$$
(1-\epsilon)^m.
$$

所以：

$$
\boxed{
\text{i.i.d. 的 independence
负责把一次证据变成 }m\text{ 次独立证据。}
}
$$

这就是适用边界。

#### 四十九、第二章最容易产生的一个错觉

看到：

$$
\mathbb E[L_S(h)]=L_D(h)
$$

有人会想：

> 那训练误差本来就是无偏估计，ERM 不是自然就泛化了吗？

错就错在 \(h\) 是否固定。

对于：

$$
h
$$

固定，

$$
L_S(h)
$$

确实很好理解。

但：

$$
h_S=\operatorname{ERM}(S)
$$

和 \(S\) 是纠缠在一起的。

它就是专门在 \(S\) 上挑出来的。

因此通常不能直接写：

$$
\mathbb E[L_S(h_S)]
=
L_D(h_S).
$$

右边甚至也是随机变量。

这是一条极强的迁移经验：

$$
\boxed{
\text{当一个对象是“看过数据以后选择的”，
不能轻率地套对固定对象成立的概率结论。}
}
$$

统计推断、multiple testing、validation、hyperparameter tuning 中都有同一个结构。

#### 五十、现在重新看“inductive bias”，会理解得更深

inductive bias 不是某种可有可无的技巧。

有限训练样本只能约束有限信息。

永远存在无数种世界，与当前观察完全一致，但在未观察区域行为截然不同。

因此单凭数据：

$$
S
$$

根本无法逻辑推出唯一的

$$
f.
$$

所以任何学习算法都必然隐式或显式地假设：

> 某些规律比另一些规律更值得相信。

在第二章里，这种先验通过：

$$
H
$$

体现。

你只允许某类规律参加竞争。

这就是为什么原书 Chapter 1 的老鼠例子讲“prior knowledge”，Chapter 2 马上正式化为 hypothesis class。


### 第九部分：整章逻辑抽象层次塔

#### 五十一、整章抽象层次塔

现在可以把第二章压成这样：

```text
Level 0：现实问题
有限经验，如何预测没见过的数据？

        ↓

Level 1：世界建模
世界由 D 和 f 描述
D：什么样的数据常出现
f：正确答案是什么

        ↓

Level 2：数据
S ~ D^m
我们只看到有限样本

        ↓

Level 3：学习
A(S)=h_S
希望 h_S 接近 f

        ↓

Level 4：评价
真实风险 L_D(h)
但它不可观测

        ↓

Level 5：经验替代
用训练风险 L_S(h)
ERM：最小化 L_S

        ↓

Level 6：危机
L_S 小不代表 L_D 小
可能 overfit

        ↓

Level 7：解决
限制搜索空间 H
这叫 inductive bias

        ↓

Level 8：理论问题
什么时候 ERM_H 不会过拟合？

        ↓

Level 9：有限 H + realizability + i.i.d.
每个坏 h 欺骗样本的概率 ≤ e^{-εm}

        ↓

Level 10：union bound
所有坏 h 中至少一个成功欺骗的概率
≤ |H|e^{-εm}

        ↓

Level 11：sample complexity
m ≥ log(|H|/δ)/ε

        ↓

Level 12：PAC 的雏形
以至少 1-δ 的概率，
真实误差至多 ε
```

如果这棵树在脑子里是连起来的，第二章就不再是十几个陌生定义，而只是一条自然的故事。


### 第十部分：课后习题深度解析

#### 五十二、下面把本章习题也一起吃掉

原书第二章共有几组很有价值的习题，尤其 Exercise 1 和矩形分类器习题，实际上都在帮助读者理解正文，而不是单纯练计算。

#### 五十三、Exercise 1：那个变态的“记忆分类器”真的可以用多项式表示

正文中的分类器：

$$
h_S(x)=
\begin{cases}
y_i,&x=x_i\text{ for some }i,\\
0,&\text{otherwise}.
\end{cases}
$$

看起来像一个人为设计的怪物。

习题让你证明：

> 它其实可以写成 thresholded polynomial。

为什么作者要做这个习题？

因为他想打掉一种错误直觉：

> “刚才那个过拟合模型太人工了，实际模型不会这么干。”

作者要告诉你：

> 很普通、很标准的函数类，只要表达能力足够强，也可以实现这种纯记忆行为。

##### 怎么构造？

设训练集中所有正样本位置为：

$$
p_1,\ldots,p_k.
$$

定义：

$$
p_S(x)
=
-\prod_{j=1}^k
\|x-p_j\|_2^2.
$$

注意：

$$
\|x-p_j\|_2^2
=
\sum_{\ell=1}^d(x_\ell-p_{j,\ell})^2.
$$

这是一个多项式。

多个多项式相乘仍然是多项式，所以 \(p_S(x)\) 是多项式。

##### 如果 \(x=p_j\)

那么其中一个因子：

$$
\|x-p_j\|^2=0.
$$

因此：

$$
p_S(x)=0.
$$

所以：

$$
p_S(x)\ge0.
$$

于是 threshold 输出 1。

##### 如果 \(x\neq p_j\) 对所有 \(j\)

所有因子都严格为正：

$$
\|x-p_j\|^2>0.
$$

乘积严格为正。

前面有负号：

$$
p_S(x)<0.
$$

所以 threshold 输出 0。

因此：

$$
h_S(x)
=
\mathbf1[p_S(x)\ge0].
$$

完成。

一句话压缩：

> 用每个正样本到 \(x\) 的平方距离做乘积，只有恰好落在某个正样本上时乘积才为零，再在前面加负号，用 \(0\) 作为 threshold。

这个构造非常漂亮。

#### 五十四、Exercise 2：为什么 empirical risk 是 true risk 的无偏估计？

这个我们前面已经证明了。

核心就是：

$$
L_S(h)
=
\frac1m\sum_{i=1}^m
\mathbf1[h(x_i)\neq f(x_i)].
$$

取期望：

$$
\begin{aligned}
\mathbb E[L_S(h)]
&=
\frac1m
\sum_{i=1}^m
\mathbb E[
\mathbf1[h(x_i)\neq f(x_i)]
]\\
&=
\frac1m
\sum_{i=1}^m
L_D(h)\\
&=
L_D(h).
\end{aligned}
$$

这里还有一个值得迁移的细节：

这个等式本身实际上并不需要 independence。

只需要每个 \(x_i\) 边缘分布都是 \(D\)，因为期望的线性性并不需要独立。

独立性是在前面算：

$$
\Pr(\text{全部正确})
=
\prod_i\Pr(\text{第 }i\text{ 个正确})
$$

时才真正需要。

这正是“理解证明”应当达到的粒度：知道每个条件究竟被哪一步使用。

#### 五十五、Exercise 3：Axis-Aligned Rectangles（无限类的学习性示例）

现在进入一个真正像机器学习算法的例子。

在二维空间中考虑矩形：

$$
R=[a_1,b_1]\times[a_2,b_2].
$$

定义分类器：

$$
h_R(x_1,x_2)=
\begin{cases}
1,&a_1\le x_1\le b_1,\quad
a_2\le x_2\le b_2,\\
0,&\text{否则}.
\end{cases}
$$

也就是说：

> 矩形里面判正类，外面判负类。

所有这种矩形构成：

$$
H_{\mathrm{rec}}^2.
$$

这个类其实是无限的，因为边界参数是任意实数。原书特意用它说明：有限类证明只是第一步，某些无限类也完全能学。

##### 五十六、算法 \(A\)：取包住所有正样本的最小矩形

假设训练数据中正样本如图散落。

算法非常简单：

找到所有正样本的：

$$
x_1^{\min},\quad x_1^{\max},
$$

以及：

$$
x_2^{\min},\quad x_2^{\max}.
$$

然后输出：

$$
R(S)
=
[x_1^{\min},x_1^{\max}]
\times
[x_2^{\min},x_2^{\max}].
$$

就是“正样本 bounding box”。

##### 五十七、为什么它是 ERM？

假设 realizability 成立。

也就是说，存在真实矩形：

$$
R^*
$$

产生所有标签。

那么每个正样本都在：

$$
R^*
$$

内部。

因此包住这些正样本的最小矩形必然满足：

$$
R(S)\subseteq R^*.
$$

为什么？

因为：

$$
R^*
$$

本身就是一个包住全部正样本的矩形。

而 \(R(S)\) 是最小的那个。

所以不会伸到 \(R^*\) 外面。

###### 这意味着什么？

所有训练正样本：

$$
\text{都在 }R(S)
$$

所以不会发生 false negative。

所有训练负样本：

根据真实规则都在

$$
R^*
$$

外面。

而：

$$
R(S)\subseteq R^*.
$$

所以更不可能进入 \(R(S)\)。

因此没有 false positive。

于是：

$$
L_S(h_{R(S)})=0.
$$

既然训练误差不可能小于 0，

它就是 ERM。

##### 五十八、这个矩形算法会犯什么样的真实错误？

因为：

$$
R(S)\subseteq R^*,
$$

所以它永远不会把真实负样本错判为正。

唯一可能的错误是：

$$
x\in R^*
\quad\text{但}\quad
x\notin R(S).
$$

即真实是正类，但因为训练样本没覆盖到真实矩形边缘，学出来的矩形缩小了。

错误区域就是：

$$
R^*\setminus R(S).
$$

现在问题变成：

> 我需要多少样本，才能让这个没覆盖到的边缘区域概率质量不超过 \(\epsilon\)？

这就能直接用第二章同样的概率思想。

##### 五十九、为什么书中画四条边界带？

原书在 Figure 2.2 中，沿真实矩形的左、右、下、上四边各取一个狭窄区域：

$$
R_1,R_2,R_3,R_4,
$$

并让每一块的概率质量都是：

$$
D(R_i)=\frac{\epsilon}{4}.
$$

如果训练集在四个区域中都至少出现一个正样本，那么 learned rectangle 就一定逼近真实矩形的四条边。

例如左边。

只要 \(R_1\) 中出现了一个训练点，那么 \(R(S)\) 的左边界一定不会跑到这个点右侧。

所以左侧遗漏区域就被限制在 \(R_1\) 中。

四个方向都成立。

因此：

$$
R^*\setminus R(S)
\subseteq
R_1\cup R_2\cup R_3\cup R_4.
$$

于是：

$$
D(R^*\setminus R(S))
\le
\sum_{i=1}^4D(R_i)
=
4\frac{\epsilon}{4}
=
\epsilon.
$$

所以只要四块区域都“被样本击中”，模型真实错误率就最多 \(\epsilon\)。

##### 六十、某一个 \(R_i\) 完全没抽到样本的概率

因为：

$$
D(R_i)=\frac{\epsilon}{4}.
$$

一次抽样没有落入它的概率：

$$
1-\frac{\epsilon}{4}.
$$

\(m\) 次都没落进去：

$$
\left(1-\frac{\epsilon}{4}\right)^m.
$$

使用：

$$
1-x\le e^{-x},
$$

得到：

$$
\Pr(S\cap R_i=\varnothing)
\le
e^{-m\epsilon/4}.
$$

##### 六十一、四个区域中至少一个没被抽到（Union Bound）

union bound：

$$
\Pr[
\exists i,\ S\cap R_i=\varnothing
]
\le
4e^{-m\epsilon/4}.
$$

我们希望：

$$
4e^{-m\epsilon/4}\le\delta.
$$

求解：

$$
m
\ge
\frac4\epsilon
\log\frac4\delta.
$$

这正是书中习题要求得到的 bound。

##### 六十二、为什么这个例子特别值得学？

因为它证明了一个非常重要的事实：

$$
H_{\mathrm{rec}}^2
$$

明明是无限集合。

可是我们仍然可以证明它 learnable。

所以：

$$
|H|<\infty
$$

显然不是真正本质的条件。

真正本质的东西应该是：

> 一个 hypothesis class 在有限样本上能表现出多少种不同的行为？

这正是后面 VC dimension 的思想来源。

##### 六十三、推广到 \(\mathbb R^d\)

在 \(d\) 维中，axis-aligned rectangle 实际上是一个 box：

$$
[a_1,b_1]\times\cdots\times[a_d,b_d].
$$

共有：

$$
2d
$$

个边界方向。

每个方向取一个概率质量为：

$$
\frac{\epsilon}{2d}
$$

的边界带。

如果每个边界带都至少出现一个样本，那么遗漏区域总质量：

$$
\le
2d\cdot\frac{\epsilon}{2d}
=
\epsilon.
$$

某个固定区域没被抽中的概率：

$$
\le
e^{-m\epsilon/(2d)}.
$$

对 \(2d\) 个区域做 union bound：

$$
\Pr(\text{失败})
\le
2d\,e^{-m\epsilon/(2d)}.
$$

令它不超过 \(\delta\)：

$$
2d\,e^{-m\epsilon/(2d)}
\le\delta.
$$

得到：

$$
\boxed{
m
\ge
\frac{2d}{\epsilon}
\log\frac{2d}{\delta}.
}
$$

这就是 Exercise 3 的自然推广。

##### 六十四、算法运行时间为什么是 polynomial？

给定 \(m\) 个 \(d\) 维样本。

对所有正样本扫描一遍。

对每个维度维护：

$$
a_j=\min_i x_{i,j},
\qquad
b_j=\max_i x_{i,j}.
$$

每个样本看 \(d\) 个坐标。

所以复杂度：

$$
O(md).
$$

而刚才：

$$
m
=
O\left(
\frac{d}{\epsilon}
\log\frac{d}{\delta}
\right).
$$

因此：

$$
O(md)
=
O\left(
\frac{d^2}{\epsilon}
\log\frac{d}{\delta}
\right).
$$

它显然是关于

$$
d,\qquad
\frac1\epsilon,\qquad
\log\frac1\delta
$$

的多项式时间。

这就是本章最后一个习题想让你看到的事情：

> “统计上能学”之外，我们以后还要问“计算上能不能高效地学”。

这又给 Chapter 8 埋了伏笔。


### 第十一部分：最终总结——自动化思维反应与极限压缩

#### 六十五、把第二章真正学透以后，脑中应该留下哪些“自动反应”？

以后看到一个 supervised learning 理论问题，你脑中应该自动先画：

$$
(D,f)
\to S
\to A
\to h_S.
$$

看到：

$$
L_S(h)
$$

马上想到：

> 我在有限样本上实际观察到的表现。

看到：

$$
L_D(h)
$$

马上想到：

> 我真正关心但直接看不到的世界表现。

看到 ERM：

$$
\arg\min L_S
$$

马上问：

> 为什么它不会 overfit？

看到一个 hypothesis class \(H\)，马上问：

> 它提供了什么 inductive bias？
> 它的复杂度有多大？

看到 finite \(H\)，马上想到：

$$
\text{固定坏 }h
\to e^{-\epsilon m}
\to
\text{union bound over }H
\to
|H|e^{-\epsilon m}.
$$

看到：

$$
\epsilon,\delta
$$

马上翻译：

$$
\epsilon=\text{允许多差},
\qquad
\delta=\text{允许多倒霉}.
$$

看到 sample complexity：

$$
m
$$

马上问：

> 要多少数据，才能以至少 \(1-\delta\) 的概率，把真实误差压到 \(\epsilon\) 以下？

如果这些反应已经自动化，第二章才算真的学完。

#### 六十六、最后做一次“极限压缩”

如果几年以后你忘记了第二章全部细节，只允许留下六句话，我建议留下这六句：

第一句：

$$
\boxed{\text{机器学习的根本矛盾：想最小化真实风险 }L_D，
\text{但只能看到经验风险 }L_S。}
$$

第二句：

$$
\boxed{\text{ERM 直接最小化 }L_S，
\text{但模型可以利用有限样本的偶然性而过拟合。}}
$$

第三句：

$$
\boxed{\text{解决办法是加入 inductive bias：
事先把搜索限制在 hypothesis class }H。}
$$

第四句：

$$
\boxed{\text{realizability 让 ERM 必有 }L_S(h_S)=0；
\text{i.i.d. 让独立证据的概率能够相乘。}}
$$

第五句：

$$
\boxed{\text{一个真实误差 }>\epsilon\text{ 的固定坏模型，
连续 }m\text{ 次不暴露错误的概率}\le e^{-\epsilon m}.}
$$

第六句：

$$
\boxed{
\text{对所有 }|H|\text{ 个候选 union bound： }
P(\text{ERM失败})
\le |H|e^{-\epsilon m},
\quad
m\ge\frac{\log(|H|/\delta)}{\epsilon}.
}
$$

这六句话基本就是第二章的骨架、证明、直觉和世界模型全部压缩后的结果。

而下一章的全部动机，恰好来自第二章留下的三个未解决问题：

$$
\text{“学习成功”到底怎么正式定义？}
$$

$$
\text{如果不存在零误差 }h^*\text{ 怎么办？}
$$

$$
\text{第二章这种 }(\epsilon,\delta)\text{ 保证如何抽象成一般概念？}
$$

答案就是 Chapter 3 的 PAC Learning。
