# 一、这份导读在做什么

机器学习理论（ML Theory）这 17 篇，是对一本 Understanding ML 类教材的逐章精读笔记，按"第二章 → 第三章 → 第四章"切分。它们**已经是天然的学习路径**，缺的只是一个"章与章之间在升级什么"的导读。本页补上这个骨架，并标出三篇习题章作为可选附录。

**一句话总纲**：三章在 progressively 放宽假设——
- 第二章固定"有限假设类 + Realizable"；
- 第三章升级为"可学习性 / PAC"，去掉 Realizability，引入 Agnostic；
- 第四章用 Uniform Convergence 把样本复杂度收束成可计算的界。

# 二、精读路径

## 数学预读（先读这个再进第二章）

- [以数学观之：ML 理论证明的数学工具对应关系](./math-viewpoint)：把教材里用到的测度/概率/集中不等式工具先对照一遍，避免读正文章节时卡在符号。

## 第二章 · A Gentle Start（有限类 + Realizable）

1. [（一）从世界模型到形式化框架](./ch2-world-model-framework)
2. [（二）真实风险、经验风险与 ERM](./ch2-risk-and-erm)
3. [（三）过拟合的本质与归纳偏置](./ch2-overfitting-inductive-bias)
4. [（四）有限假设类的泛化保证](./ch2-finite-generalization-proof)

> 第二章的目标：在"假设类有限 + 数据来自同一分布"的最简设定下，证明经验风险最小化会收敛。这是后续所有推广的基线。

## 第三章 · A Formal Learning Model（升级为 PAC / Agnostic）

5. [（一）PAC 学习：从能泛化到可学习](./ch3-pac-definition)
6. [（二）Sample Complexity 与 Agnostic PAC](./ch3-sample-complexity-agnostic)
7. [（三）Bayes Optimal 与 Agnostic PAC](./ch3-bayes-agnostic-pac)
8. [（四）General Loss 与 Proper/Improper](./ch3-general-loss)

> 第三章的关键跃迁：不再要求"存在零误差假设"（去掉 Realizability），改为问"在最优假设附近能学到多好"（Agnostic）。样本复杂度的定义随之改变。

## 第四章 · Learning via Uniform Convergence（收束样本复杂度）

9. [（一）动机与 ε-representative](./ch4-motivation-representative)
10. [（二）核心引理与有限类证明](./ch4-core-lemma-uc-finite)
11. [（三）Hoeffding 不等式](./ch4-hoeffding)
12. [（四）放回 ML、Union Bound 与样本复杂度](./ch4-back-to-ml-union-bound)
13. [（五）证明工具箱与适用边界](./ch4-toolbox-applicability)

> 第四章用"对整个假设类一致收敛"的思路，把第二章的有限类证明推广到无限类，并明确工具的适用边界（H 无限、loss 不有界、数据不独立时各会怎样崩）。

# 三、习题与延展（附录，按需）

这三篇是各章的习题解答与延展，内容独立、非主线，建议读正文时遇到对应章节再回头做：

- [第二章（五）延展、层次塔与习题](./ch2-extensions-exercises)
- [第三章（五）证明工具箱、习题与压缩](./ch3-proof-tools-exercises)
- [第四章（六）Discretization、习题与压缩](./ch4-discretization-exercises)

# 四、配套数学笔记

若想补随机过程 / 扩散模型一侧的数学，见 [随机微分方程入门](/notes/math/sde-primer)、[学习理论的数学](/notes/math/math-for-learning)、[深度学习中的数学概念解读](/notes/math/math-interpretation)。

# 五、相关导读

本站其他导读枢纽：

- 机制可解释性学习路径 → [机制可解释性 · 学习路径总览](/notes/interpretability/roadmap)
- 研究方法论总览 → [研究方法论总览](/notes/methodology/hub)
- 领域综述导读 → [领域综述导读](/notes/surveys/hub)
- 随笔总览 → [随笔总览](/notes/essays/hub)
- 研究品味 → [什么是「有趣」的研究](/notes/research-taste/what-is-interesting)
