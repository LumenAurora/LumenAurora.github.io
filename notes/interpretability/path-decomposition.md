---
title: "路径分解：把 Transformer 展开成一串虚拟权重"
date: 2026-08-28
category: "机制可解释性"
tags:
  - "可解释性"
  - "路径分解"
  - "虚拟权重"
  - "Induction Head"
description: "利用残差流的线性性，可以把一整个（去除 MLP 的）Transformer 展开成「路径之和」：先合成虚拟权重，再解剖 QK 电路与 OV 电路，最后用 skip-trigram 与 Induction Head 两个真实例子走完全流程。"
---

# 路径分解：把 Transformer 展开成一串虚拟权重

> 利用残差流的线性性，可以把一整个（去除 MLP 的）Transformer 展开成「路径之和」：先合成虚拟权重，再解剖 QK 电路与 OV 电路，最后用 skip-trigram 与 Induction Head 两个真实例子走完全流程。

## 纯attention网络分析（去除MLP）——路径分解
先用一句话抓住第六点的核心：**Transformer 的残差流是线性的，所以我们可以把"从输入 token 到输出 logits"这一整段计算，像展开一个乘积一样拆成若干条独立的"路径"，每条路径的两端落在有特权基、天然可解释的组件上（token、注意力模式、MLP 神经元、logits），中间夹的全是线性矩阵——而线性矩阵就算没有特权基也没关系，因为它们可以被自由地乘开、折叠、合并。**【turn0search3】

下面分七步，把这件事从零讲到能自己推公式。

---

### 一、起点：为什么残差流的线性性让"路径分解"成为可能

先回忆一个最基本的事实：Transformer 的每一层都做两件事——

- **读**：用一个矩阵 $W_{in}$ 把残差流 $x$ 投影到这一层需要的子空间；
- **写**：算完之后，用 $W_{out}$ 把结果投影回残差流维度，再**加**进去：$x \leftarrow x + W_{out}(\cdot)$。

注意"加"这个字。残差流本身不做任何处理，它只是一个所有层都往里读、往里写的**通信通道**。每一层加进去的东西会一直留在那里，除非有别的层主动来删掉它。Anthropic 把这叫做"residual stream as a communication channel"。【turn9find0】

这个"通信通道"的比喻是整个框架的种子。想象一个办公室里有很多人在传纸条：每个人既可以往公共桌上放一张纸条（写），也可以从桌上拿走一张纸条看（读）。桌上堆着的所有纸条的总和，就是残差流。我们关心的问题不是"桌上每一张纸条本身是什么意思"（残差流没有特权基，第 137 张纸条本身没语义），而是"谁写了什么给谁"——也就是**每一条从写者到读者的通信路径**。

为什么这件事能做？因为线性。残差流是**纯加法**的：第 $L$ 层的残差流等于原始 embedding 加上每一层的贡献之和：

$$x_L = W_E \, t + \sum_{l=1}^{L} \text{layer}_l(\text{前面所有层写的东西}).$$

加法意味着可以拆开。线性意味着可以把相邻的矩阵乘在一起（虚拟权重）。这两个性质合在一起，就允许我们把整个网络从 token 到 logits 的计算，展开成一组"端到端路径"之和。这就是 Anthropic 的"Path Expansion Trick"。【turn4fetch0】

---

### 二、虚拟权重：把"中间一串矩阵"预先乘成一个

在正式展开之前，先理解一个更小的积木：**虚拟权重**。

假设残差流前后有两个线性变换 $W_O^{(1)}$（第 1 层的写矩阵）和 $W_I^{(2)}$（第 2 层的读矩阵），中间隔着一段残差流：

$$\text{第 2 层看到的输入} = W_I^{(2)} \cdot (\text{残差流}) = W_I^{(2)} \cdot W_O^{(1)} \cdot (\text{第 1 层算出的东西}).$$

因为中间没有非线性，这两个矩阵可以**直接乘成一个**：$W_I^{(2)} W_O^{(1)}$。这个乘积就是"虚拟权重"——它直接刻画了"第 1 层写出的信息，有多少被第 2 层读到"，仿佛两层之间有一根直达的线，绕过了残差流。【turn9find0】

更一般地，任意两层之间（哪怕隔了 50 层）都可以这样算出虚拟权重，只要中间没有非线性挡着。在纯 attention-only 模型里，相邻 attention 层之间确实没有非线性（attention 的 softmax 在每层内部，不在层间的残差流上），所以虚拟权重可以一路乘到底。

这个观察有个直接推论：**残差流本身不是我们必须研究的对象**。残差流是很多路径加在一起的"和"，研究它等于研究一堆东西混在一起的大杂烩；而研究"虚拟权重"等于研究一条条独立的通信线路，干净得多。这就是 Anthropic 框架的第一个关键转向：**不要直接分析残差流，要把它拆成路径**。【turn9find0】

---

### 三、把一整个 Transformer 写成一个乘积

现在看一个最小的真实例子：**一层 attention-only Transformer**。它由三部分组成：

1. **Token embedding**：$W_E$，把 one-hot 的 token 向量 $t$（维度 $n_{\text{vocab}}$）映射到残差流空间（维度 $d_{\text{model}}$）。
2. **一个 attention 层**：里面有若干个独立的 head $h$，每个 head 读取残差流、根据注意力模式 $A^h$ 在位置间搬运信息、再写回残差流。
3. **Unembedding**：$W_U$，把残差流映射回 logits 空间（维度 $n_{\text{vocab}}$）。

Anthropic 的写法是把整个 attention 层表示成

$$\text{Attention 层} = \text{Id} \otimes I + \sum_{h} A^h \otimes W_{OV}^h,$$

这里 $A^h$ 是"位置到位置的搬运矩阵"（第 $i$ 行第 $j$ 列表示 token $i$ 有多关注 token $j$），$W_{OV}^h = W_O^h W_V^h$ 是"读什么、怎么写"的复合矩阵。$\text{Id} \otimes I$ 那一项表示"残差流原样穿过"（恒等路径）。

于是整个一层 Transformer 从 token 到 logits 的计算就是三个因子的乘积：

$$\text{logits} = W_U \cdot \left( \text{Id} \otimes I + \sum_h A^h \otimes W_{OV}^h \right) \cdot W_E \cdot t.$$

注意：这只是一个普通的矩阵乘积。到目前为止没有任何新东西，只是换了个写法。【turn4fetch0】

---

### 四、Path Expansion Trick：把乘积展开成"路径之和"

关键一步来了。我们有一个**乘积**（每一项对应一层），我们把它**展开**成一个**求和**（每一项对应一条端到端路径）。

具体怎么展开？就是把括号乘开。注意 $\text{Id} \otimes I + \sum_h A^h \otimes W_{OV}^h$ 是一个求和，它跟左右两边的 $W_U$、$W_E$ 相乘时，可以逐项分配：

$$\text{logits} = \underbrace{W_U \cdot W_E \cdot t}_{\text{直接路径}} + \sum_h \underbrace{W_U \cdot W_{OV}^h \cdot W_E \cdot (A^h \, t)}_{\text{head } h \text{ 的路径}}.$$

这就是"路径展开"。原来一个看起来复杂的乘积，被拆成了若干条独立的路径之和：【turn4fetch0】

- **直接路径**：$W_U W_E$。token → embedding → 直接穿过 attention 层（恒等）→ unembedding → logits。这条路径**不在位置间搬运任何信息**，只能贡献 bigram 统计（"看到 Barack 就倾向于输出 Obama"那种）。
- **每条 head 路径**：$W_U W_{OV}^h W_E$，再乘上注意力模式 $A^h$。token → embedding → 被 head $h$ 在位置间搬运 → 写回残差流 → unembedding → logits。

Anthropic 的原话是：'Our key trick is to simply expand the product. This transforms the product (where every term corresponds to a layer), into a sum where every term corresponds to an end-to-end path. We claim each of these end-to-end path terms is tractable to understand, can be reasoned about independently, and additively combine to create model behavior.'【turn4fetch0】

为什么能"独立地理解每一条路径"？因为它们是**加法**关系。要研究 head 3 在干什么，就单独看 $W_U W_{OV}^3 W_E$ 这一项；要研究直接路径，就单独看 $W_U W_E$。它们对 logits 的贡献是相加的，互不干扰（至少在一层模型里是这样）。

---

### 五、解剖一条路径：QK 电路与 OV 电路

现在放大看一条 head 路径 $W_U W_{OV}^h W_E$。它本身还可以拆成两个**完全独立**的部分：

- **OV 电路**：$W_U W_{OV}^h W_E = W_U W_O^h W_V^h W_E$。它回答的问题是："如果某个 token 被 head $h$ 搬运过来了，它会让输出 logits 怎么变？" 这是一条从 source token 到 out token 的线性映射，是个 $n_{\text{vocab}} \times n_{\text{vocab}}$ 的矩阵。
- **QK 电路**：$W_E^T W_{QK}^h W_E$，其中 $W_{QK}^h = W_Q^h W_K^h$（注意 $W_Q$ 和 $W_K$ 总是一起出现，永远不分离）。它回答的问题是："destination token 有多想关注 source token？" 这也是个 $n_{\text{vocab}} \times n_{\text{vocab}}$ 的矩阵，决定了注意力模式 $A^h$。【turn4fetch0】

这两个电路是**可分离的**：QK 决定"看哪里"，OV 决定"搬来什么、怎么用"。Anthropic 给了一个很干净的思想实验来证明这一点是原则性的——**冻结注意力模式**：先跑一次模型，记录下每个 head 的注意力模式 $A^h$；再跑第二次，但这次把 $A^h$ 钉死成第一次记录的值。这时候 attention head 就变成了一个**纯线性操作**，整个网络变成了 token 的线性函数。【turn4fetch0】

这个"冻结"的视角极其有用。它意味着：

- 注意力模式 $A^h$ 是一条路径上唯一真正的非线性来源（softmax 产生它）；
- 一旦固定了 $A^h$，剩下的全是线性代数，可以随便乘、随便拆。

而 $A^h$ 本身——也就是"哪个位置关注哪个位置"——是**内在可解释的**（位置本身有意义，"第 5 个 token 关注第 2 个 token"是个清晰的人类语言陈述）。所以 $A^h$ 是路径上一个"有特权基的端点"。

---

### 六、一个端到端的例子：skip-trigram

把上面三步合起来，就能读出一个具体的可解释结构。

假设词表是 ~50000 个 token。那么 OV 电路 $W_U W_{OV}^h W_E$ 是一个 $50000 \times 50000$ 的矩阵，它的第 $(s, o)$ 个元素表示："如果 head $h$ 把 source token $s$ 搬到当前位置，那么下一个 token 是 $o$ 的 logit 会增加多少"。QK 电路 $W_E^T W_{QK}^h W_E$ 也是 $50000 \times 50000$，第 $(d, s)$ 个元素表示："destination token $d$ 有多想关注 source token $s$"。

把这两个矩阵合在一起读，每个 head 实现的就是一组 **skip-trigram**：

$$[\text{source}] \dots [\text{destination}] \to [\text{out}].$$

意思是："当上下文里出现过 source token，并且当前是 destination token 时，预测下一个 token 是 out。"【turn5fetch0】

举个 Anthropic 在论文里给的真实例子：模型学会了 LaTeX，于是有 skip-trigram `lambda … $\lambda`——意思是"前面出现过 lambda 这个词，当前是 $ 符号，那么下一个 token 倾向于输出 \lambda"。这种规则可以直接从 OV/QK 矩阵的大元素里**读出来**，不需要跑模型。【turn5fetch0】

再看一个更微妙的：token 化时，" Ralph"（带前导空格）是一个 token，但"Ralph"（不带空格）会被切成 "R" + "alph"。模型会学到一类 skip-trigram，当它看到碎片 "R" 时，回看前面是否出现过完整的 " Ralph"，然后预测 "alph"。这已经是一种非常初级的 in-context learning。【turn5fetch0】

这就是路径分解的威力：原本是一堆几百万维的权重矩阵，展开后变成了若干张"可读的查表"——每张表是 $50000 \times 50000$ 确实巨大，但每一项的含义是清楚的。

---

### 七、为什么端点可解释、中间不可解释也没关系

现在可以正面回答你的困惑了。一条路径长这样：

$$\text{token} \xrightarrow{W_E} \text{残差流} \xrightarrow{W_V^h} \text{value 向量} \xrightarrow{A^h} \text{搬运后的 result} \xrightarrow{W_O^h} \text{残差流} \xrightarrow{W_U} \text{logits}.$$

逐个看这些组件的"特权基状态"：

- **token**：有特权基（词表）；
- **残差流**：没有特权基；
- **value 向量**：没有特权基（它夹在 $W_V$ 和 $W_O$ 两个线性变换之间，是低秩分解的中间产物）；
- **$A^h$（注意力模式）**：有特权基（位置）；
- **logits**：有特权基（词表）。

所以一条路径的端点（token、$A^h$、logits）都有特权基、都内在可解释，但中间那一串线性变换没有特权基。这看起来是个问题——实际上完全不是，原因有二：

**第一，中间的线性变换可以被乘成一个虚拟权重。** $W_U W_O^h W_V^h W_E$ 直接乘出来就是 OV 电路，一个从 token 直接到 logits 的 $n_{\text{vocab}} \times n_{\text{vocab}}$ 矩阵。我们根本不需要关心中间的残差流坐标、value 向量坐标是什么——它们被乘掉了。换句话说，"没有特权基"意味着"坐标任意"，而"坐标任意"对乘积的结果毫无影响。线性变换的可组合性把不可解释的中间层"折叠"掉了。【turn9find0】

**第二，唯一不能被乘掉的非线性是 $A^h$，而它恰好是可解释的。** softmax 产生 $A^h$，它不可约简——你不能把 softmax 之前的 $W_Q$、$W_K$ 跟 softmax 之后的 $W_O$、$W_V$ 乘在一起。但 $A^h$ 表示"位置间的注意力"，本身就是人类能直接读懂的东西。所以路径上"卡住"我们、不让我们一路乘到底的那个非线性，正好是可解释的端点。

这就是整个框架的精妙之处：**线性段没有特权基，但正因为线性，可以被任意重组、乘开；非线性段有特权基、内在可解释，正好是路径的天然端点。** 没有特权基的残差流不是障碍，反而是让路径可展开的前提条件——如果残差流上有非线性，我们反而没法把它乘开了。【turn9find1】

---

### 八、扩展到两层：路径组合与"虚拟注意力头"

一层模型只是热身。真正的威力在两层以上，因为 attention head 可以**组合**。

回忆每个 head 读残差流的三个子空间（由 $W_Q$、$W_K$、$W_V$ 决定），写一个子空间（由 $W_O$ 决定）。因为 $d_{\text{head}} \ll d_{\text{model}}$（比如 64 vs 4096），不同 head 通常占用不相交的子空间，互不干扰。但当某个 head 的写子空间正好被另一个 head 的读子空间覆盖时，就发生了**组合**。有三种：【turn7fetch0】

- **Q-Composition**：第 2 层 head 的 $W_Q$ 读取了第 1 层 head 写过的子空间；
- **K-Composition**：第 2 层 head 的 $W_K$ 读取了第 1 层 head 写过的子空间；
- **V-Composition**：第 2 层 head 的 $W_V$ 读取了第 1 层 head 写过的子空间。

对两层模型做 path expansion，logits 的展开式会多出一类项——**虚拟注意力头**，形如 $A^{h_2} A^{h_1} \otimes W_{OV}^{h_2} W_{OV}^{h_1}$。它对应一条"经过 head $h_1$ 再经过 head $h_2$"的路径，可以看作一个合成的虚拟 head $h_2 \circ h_1$，有自己的复合注意力模式 $A^{h_2} A^{h_1}$ 和复合 OV 矩阵 $W_{OV}^{h_2} W_{OV}^{h_1}$。【turn3find1】

V-Composition 创造虚拟 head（信息搬运 → 信息搬运 = 信息搬运），而 Q/K-Composition 改变第二层的注意力模式本身（让第二层 head 能"看到"第一层 head 搬过来的东西，从而实现远比一层模型复杂的注意力模式）。【turn7fetch0】

---

### 九、一个真实的两层例子：Induction Head

两层模型里最著名的发现是 **induction head**，它实现了一种真正的 in-context learning。

算法极其简单。假设上下文是 `… the quick brown fox … the quick brown`，模型要预测下一个词。induction head 做的事是：

1. **第 1 层有个 previous-token head**：它总是关注当前位置的前一个 token。当前是 "brown"，它就把 "quick" 的信息搬到当前位置。
2. **第 2 层的 induction head**：它的 key 由"前一个 token 的信息"计算（通过 K-Composition），它的 query 由"当前 token"计算。所以它实际上在问："前面那个位置上，是不是有一个 token，它的前一个 token 跟我现在的 token 一样？" 如果是，就强烈关注那个位置。
3. **通过 OV 电路**，induction head 把被关注位置**后面那个 token** 复制到输出——也就是 `fox`。

合起来：induction head 实现了"如果出现过 [A][B] 这种 pattern，并且现在又是 A，那么预测 B"——这就是 in-context learning 的最简形式。【turn6fetch0】

这个算法**完全靠 K-Composition 才能实现**。如果你只看第 2 层 head 的注意力模式，你会看到它关注了某个遥远的 token，但你完全不知道为什么——因为"为什么关注那里"的答案藏在第 1 层的 previous-token head 通过 K-Composition 注入的信息里。Anthropic 特别强调：这是 naive 地解读注意力模式会误导的经典案例。【turn3find1】

路径分解在这里的作用是：它告诉你"第 1 层的 previous-token head 和第 2 层的 induction head 必须作为一条组合路径来理解，单独看任何一个都会看错"。

---

### 十、MLP 怎么进入这个框架

到目前为止只讲了 attention-only 模型。真实的 Transformer 还有 MLP 层，而且 MLP 占了约 2/3 的参数量。MLP 怎么纳入路径分解？

MLP 层的结构是：读残差流（$W_I^m$）→ 逐元素非线性（GELU/ReLU）→ 写回残差流（$W_O^m$）。**关键区别在于那个逐元素非线性**——它不能被乘掉。所以不能像 attention 层那样一路线性展开穿过 MLP。【turn8fetch0】

但可以做两件替代的事：

**第一，研究 MLP 的 pre-activation（非线性之前的线性部分）。** 把 $W_I^m$ 乘到残差流上，得到的是第 $m$ 个 MLP 层每个神经元的 pre-activation。这个东西本身是残差流的线性函数，所以可以继续用 attention-only 的公式展开：【turn8fetch0】

$$a^m_{\text{pre}} = W_I^m W_E \, t + \sum_h A^h \otimes (W_I^m W_{OV}^h W_E) \, t.$$

这告诉我们：每个神经元"被哪些 token 激活、被哪些 attention head 搬来的信息激活"，是一个可以读出来的线性表。

**第二，研究 MLP 的输出对 logits 的影响。** MLP 最后一层的 $W_O^m$ 之后、到 logits 之间全是线性（如果是网络的最后一个 MLP），所以 $W_U W_O^m$ 直接告诉我们"每个神经元的激活会让哪些 logits 变化"。【turn8fetch0】

夹在中间的、真正非线性的部分——也就是 ReLU/GELU 作用后的神经元激活——正好是**有特权基的**（因为逐元素非线性挑出了标准基）。所以 MLP 的"不可线性穿越"部分，恰好落在了一个可解释的端点上。这就是为什么 Anthropic 说："features as neurons"假设如果成立，MLP 就可以被纳入同样的路径分解框架——只是每条路径在穿过 MLP 时会"卡"在神经元激活这一可解释节点上，而不能像 attention 那样一路乘穿。

---

### 十一、Logit Lens：一个朴素但相关的技巧

顺带提一个和路径分解同源的实用技巧，叫 **Logit Lens**（Nostalgebraist 提出）。它观察到：既然残差流是线性的、$W_U$ 也是线性的，那么我们可以在任何一层把 $W_U$ 乘到当时的残差流上，得到"如果模型在这里就停了，它会预测什么"。这相当于在每一层都对 logits 做一次"快照"，看预测如何随层演化。【turn9find1】

Anthropic 的框架可以看作 Logit Lens 的进阶版：Logit Lens 直接看残差流 $x_l$（一锅大杂烩），而路径分解把 $x_l$ 拆成"哪些 head 写了什么、哪些路径贡献了多少"，再分别投射到 logits 空间。前者粗，后者细。

---

### 十二、框架的边界

最后诚实地讲这套框架的局限：

1. **路径数量随深度爆炸。** 两层模型展开出来有"直接路径 + 一阶 head 项 + 二阶虚拟 head 项"，三层就会有三阶项，每多一阶，项数按 head 数量的幂次增长。Anthropic 给了一个算法来测量"第 $n$ 阶项的边际贡献"——通过多次跑模型、用上一次的激活替换本次的输出，从而只保留到第 $n$ 阶。在小模型上发现二阶项贡献很小，但大模型上是否仍然如此未知。【turn9find1】

2. **MLP 的非线性使得穿过 MLP 的路径不能完整展开。** 框架在 attention-only 模型上是精确的数学等价，一旦加入 MLP，就只能做到"分段线性化"——在每个 MLP 神经元激活这个端点处切开。这依赖"特征即神经元"假设，而实际上 MLP 神经元常常是多义的（polysemantic），叠加严重。【turn8fetch0】

3. **QK 电路在两层以上需要变成高维张量。** 一层时 QK 是个矩阵，两层时因为 Q-Composition 和 K-Composition 同时作用，QK 电路要写成 6 维张量（一个 (4,2)-张量），每一项形如 $A_q \otimes A_k \otimes W$。这对应"query 侧信息怎么搬、key 侧信息怎么搬、它们怎么乘出 attention score"。抽象上可理解，但具体读起来已经很难了。【turn3find1】

4. **冻结注意力模式的线性化是近似。** 真实模型里，改变输入会改变 $A^h$，所以"冻结后是线性"只在固定输入下成立。要理解模型对输入的反应，还得考虑 $A^h$ 本身怎么变。

尽管有这些边界，路径分解仍然是目前机械可解释性最核心的工具之一。它把"一坨乱七八糟的权重"变成了"一组端点可解释、中间可乘开的路径之和"，让我们至少能理解大模型的**一部分**——尤其是那些主要由 attention head 和 embedding 构成的电路。【turn9find1】

---

### 收尾

回到你最初的困惑：第六点说的"把模型分解为路径，连接着内在可解释且拥有特权基的组件"，具体就是这样一件事——

利用残差流的线性性，把从 token 到 logits 的整个乘积展开成求和，每一项是一条端到端路径；路径的非线性端点（token、注意力模式、MLP 神经元、logits）有特权基、可直接读；路径的线性中段（$W_E$、$W_V$、$W_O$、$W_U$、残差流本身）没有特权基，但可以乘成虚拟权重折叠掉。结果就是：原本无从下手的几百万维权重，变成了若干张"可读的查表"之和。
