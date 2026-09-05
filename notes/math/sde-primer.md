---
title: "随机微分方程入门：从直觉到量化金融与 Diffusion"
date: 2026-08-22
category: "数学基础"
tags:
  - "SDE"
  - "随机过程"
  - "扩散模型"
description: "你不需要知道测度论、Kolmogorov 存在性定理的证明。你需要的是："
---

# 随机微分方程入门：从直觉到量化金融与 Diffusion

## 随机微分方程（SDE）保姆级入门：从直觉到量化金融与Diffusion

### 写在前面：一张全局地图

你不需要知道测度论、Kolmogorov 存在性定理的证明。你需要的是：

1. **一套语言**：怎么写随机的"运动方程"
2. **一个核心工具**：Itô 公式（随机版链式法则）——90% 的计算都靠它
3. **两座桥梁**：
   - Feynman-Kac：SDE ↔ PDE（金融定价的核心）
   - Fokker-Planck / 反向SDE：SDE ↔ 概率分布演化（diffusion模型的核心）
4. **一个换测度技巧**：Girsanov 定理（无套利定价的核心）

这份笔记就按这个顺序讲，每个公式后面都有一句"人话"总结，记住这句话比记住公式本身更重要。


### 第二部分：随机积分——为什么要发明"Itô积分"

#### 2.1 普通积分为什么用不了

因为布朗运动路径"无穷抖动"（无穷变差），黎曼-斯蒂尔杰斯积分 $\int f\, dW$ 对普通函数不收敛，必须重新定义。

#### 2.2 Itô积分的构造思想

$$
\int_0^T f(t, W_t)\, dW_t := \lim_{n\to\infty} \sum_i f(t_i, W_{t_i}) \cdot (W_{t_{i+1}} - W_{t_i})
$$

**关键动机**：求和时用的是**区间左端点** $f(t_i, W_{t_i})$，而不是中点或右端点。

> 🔑 **人话**：为什么必须用左端点？因为在金融/物理里，你今天的决策（买多少股票）只能基于**今天已知的信息**，不能用到未来（右端点/中点会"偷看未来"）。这叫"**非预期性（non-anticipating）**"，是 Itô 积分和随机分析里最重要的哲学原则——**不能用未来信息**。

由此得到 Itô 积分两个关键性质：
- **鞅性质（martingale）**：$E[\int_0^T f\,dW_t] = 0$。人话：随机积分的期望恒为 0，因为它是纯"噪声的累积"，没有系统性偏移。
- **Itô等距（Isometry）**：$E\left[\left(\int_0^T f\,dW_t\right)^2\right] = E\left[\int_0^T f^2\,dt\right]$。人话：随机积分的"能量"（平方期望）等于被积函数平方的普通积分——这是算方差的核武器。

（顺带一提：如果用中点求和，得到的是 **Stratonovich 积分**，满足普通链式法则，但失去了鞅性质，物理上常用，金融/概率上几乎总用 Itô。）

---

### 第三部分：Itô公式——随机微积分的灵魂

这是**整个SDE理论中你必须条件反射般会用的唯一公式**。

#### 3.1 怎么推出来的（动机）

设 $X_t$ 满足 $dX_t = \mu\, dt + \sigma\, dW_t$，我们想知道 $f(X_t, t)$ 怎么变化（比如 $f$ 是期权定价函数，$X_t$ 是股价）。

**普通泰勒展开**到二阶：

$$
df = \frac{\partial f}{\partial t}dt + \frac{\partial f}{\partial x}dX + \frac{1}{2}\frac{\partial^2 f}{\partial x^2}(dX)^2 + \cdots
$$

普通微积分中 $(dX)^2$ 是二阶小量，直接舍去。但现在：

$$
(dX)^2 = (\mu\, dt + \sigma\, dW)^2 = \mu^2 (dt)^2 + 2\mu\sigma\, dt\, dW + \sigma^2 (dW)^2
$$

用第一部分的规则表：$(dt)^2=0$，$dt\, dW = 0$，但 **$(dW)^2 = dt$**！所以：

$$
(dX)^2 = \sigma^2\, dt \quad (\text{不是零！这就是普通链式法则失效的地方})
$$

代回去，得到 **Itô 公式**：

$$
\boxed{df(X_t,t) = \left(\frac{\partial f}{\partial t} + \mu\frac{\partial f}{\partial x} + \frac{1}{2}\sigma^2 \frac{\partial^2 f}{\partial x^2}\right)dt + \sigma\frac{\partial f}{\partial x}\,dW_t}
$$

> 🔑 **人话（背下这句话就够了）**：**对随机变量的函数求微分，比普通链式法则多出一项——二阶导数项 $\frac{1}{2}\sigma^2 f_{xx}$。这一项来自布朗运动的剧烈抖动（凸性效应/Jensen gap），俗称"Itô修正项"。** 只要函数是凸的（$f_{xx}>0$），随机性会系统性地把 $f$ 的期望往上推，这就是期权凸性、复利效应的数学根源。

#### 3.2 用一个例子体会"Itô修正"

求 $d(W_t^2)$：这里 $f(x)=x^2$，$\mu=0,\sigma=1$。

$$
d(W_t^2) = \left(0 + 0 + \frac{1}{2}\cdot 2\right)dt + 2W_t\, dW_t = dt + 2W_t\, dW_t
$$

积分：$W_T^2 = T + 2\int_0^T W_t\, dW_t$，即

$$
\int_0^T W_t\, dW_t = \frac{W_T^2 - T}{2}
$$

> 🔑 **人话**：如果是普通积分，$\int x\,dx = x^2/2$，没有那个 $-T/2$。这个多出来的 $-T/2$ 就是"随机性税"——每次波动都会侵蚀一点，这是 Itô 积分和普通积分本质的区别，也是后面 GBM 里 $-\sigma^2/2$ 项的根源。

---

### 第四部分：经典SDE模型——金融的两大基石

#### 4.1 几何布朗运动（GBM）—— Black-Scholes 的股价模型

$$
dS_t = \mu S_t\, dt + \sigma S_t\, dW_t
$$

> 🔑 **人话**：股价的**百分比变化**（收益率 $dS/S$）服从"确定漂移+随机噪声"，而不是股价本身的绝对值。这保证了 $S_t$ 永远为正（这是它被选做股价模型的原因）。

**求解（用Itô公式的经典范例）**：取 $f(S)=\ln S$，$f_S = 1/S$，$f_{SS}=-1/S^2$：

$$
d(\ln S_t) = \left(\mu - \frac{1}{2}\sigma^2\right)dt + \sigma\, dW_t
$$

两边积分：

$$
\boxed{S_t = S_0 \exp\left[\left(\mu-\frac{\sigma^2}{2}\right)t + \sigma W_t\right]}
$$

> 🔑 **人话**：$S_t$ 是对数正态分布。注意那个 $-\sigma^2/2$——它就是上面说的"Itô修正/随机性税"：波动率越大，**实际增长的中位数越低**（虽然期望值仍然是 $\mu$），这就是"波动率拖累（volatility drag）"，理解这个是理解杠杆ETF为什么长期跑输的关键。

#### 4.2 Ornstein-Uhlenbeck 过程（OU）—— 均值回归模型

$$
dX_t = \theta(\mu - X_t)\, dt + \sigma\, dW_t
$$

> 🔑 **人话**：$\theta(\mu-X_t)$ 是一个"弹簧力"：$X_t$ 偏离中枢 $\mu$ 越远，被拉回去的力越大，$\theta$ 是拉回速度。这是**利率模型（Vasicek）**、**波动率均值回归**的标准模型，也是 **Diffusion 模型前向过程的原型**（下面会讲）。

**解法（积分因子法，动机：把左边凑成一个可以直接积分的全微分）**：

对 $e^{\theta t}X_t$ 用 Itô（这里其实是普通规则也成立，因为没有 $X$ 的二阶导）：

$$
d(e^{\theta t}X_t) = \theta e^{\theta t}X_t\,dt + e^{\theta t}dX_t = \theta \mu e^{\theta t}dt + \sigma e^{\theta t}dW_t
$$

积分得：

$$
X_t = X_0 e^{-\theta t} + \mu(1-e^{-\theta t}) + \sigma\int_0^t e^{-\theta(t-s)}dW_s
$$

> 🔑 **人话**：$X_t$ 是均值 $\mu + (X_0-\mu)e^{-\theta t}$（随时间指数收敛到 $\mu$）、方差随时间收敛到 $\sigma^2/2\theta$ 的正态分布。**这是一个"记忆逐渐消失、最终稳定在某个分布"的过程**——这正是 diffusion 模型把数据一步步"搅乱成纯噪声"所用的动力学。

---

### 第五部分：两座桥梁（这是SDE真正有用的地方）

到目前为止我们只在描述"**一条路径**"怎么变化。但实际应用中我们经常要问两类问题：
- （金融）某个函数的**期望值**满足什么方程？→ Feynman-Kac
- （diffusion）整个**概率分布**怎么随时间演化？→ Fokker-Planck

#### 5.1 Feynman-Kac 公式：SDE ↔ PDE，期权定价的心脏

**背景动机**：Black-Scholes 最初是解一个PDE得到期权价格公式的，但我们也知道"期权价格=风险中性期望的贴现"。这两者为什么等价？Feynman-Kac 就是这个等价性的一般化。

**命题**：若 $X_t$ 满足 $dX_t = \mu(X_t,t)dt + \sigma(X_t,t)dW_t$，且 $u(x,t)$ 满足**倒向**PDE：

$$
\frac{\partial u}{\partial t} + \mu\frac{\partial u}{\partial x} + \frac{1}{2}\sigma^2\frac{\partial^2 u}{\partial x^2} = 0, \quad u(x,T)=\phi(x)
$$

那么：

$$
\boxed{u(x,t) = \mathbb{E}\left[\phi(X_T) \mid X_t = x\right]}
$$

**为什么成立（直觉推导）**：对 $u(X_t,t)$ 用 Itô 公式：

$$
du(X_t,t) = \underbrace{\left(u_t + \mu u_x + \frac12\sigma^2 u_{xx}\right)}_{=0，因为u满足PDE}dt + \sigma u_x\, dW_t
$$

drift 项恰好因为 $u$ 满足PDE而消失，只剩 $\sigma u_x dW_t$，这是纯随机项，期望为0（鞅性质！）。所以 $u(X_t,t)$ 是一个鞅，鞅的期望不随时间变：

$$
u(x,t) = \mathbb{E}[u(X_t,t)] = \mathbb{E}[u(X_T,T)] = \mathbb{E}[\phi(X_T)]
$$

> 🔑 **人话**：**PDE的解 = 沿着对应SDE跑很多次蒙特卡洛路径、看终值函数的平均值。** 这就是为什么期权定价既可以解PDE（Black-Scholes方程），也可以做蒙特卡洛模拟（跑GBM路径算payoff期望再贴现）——两者是同一个数学对象的两种计算方式。

#### 5.2 Fokker-Planck 方程：从"一条路径"到"整个分布"

**动机**：SDE $dX_t = \mu\,dt+\sigma\,dW_t$ 描述单个粒子的随机轨迹，但如果我们放出**无穷多个**服从这个SDE的粒子，它们的概率密度 $p(x,t)$ 怎么演化？

$$
\boxed{\frac{\partial p(x,t)}{\partial t} = -\frac{\partial}{\partial x}\Big[\mu(x,t)\,p(x,t)\Big] + \frac{1}{2}\frac{\partial^2}{\partial x^2}\Big[\sigma^2(x,t)\,p(x,t)\Big]}
$$

> 🔑 **人话**：这就是一个"**对流-扩散方程**"（continuity equation + diffusion）。第一项是概率被 drift "对流"（平移），第二项是概率被噪声"扩散"（摊平）。**它和 Itô 公式其实是一体两面**：Itô 公式说的是"单个函数值怎么变"，Fokker-Planck 说的是"整个概率密度怎么变"，两者可以互相推导（对Itô公式取期望，用分部积分即可得到FP方程）。

这正是理解 **diffusion 模型**的关键方程：diffusion 前向过程本质就是一个 SDE，Fokker-Planck 描述了数据分布是怎么被逐渐"扩散"成高斯噪声的。

---

### 第六部分：Girsanov 定理——无套利定价的换测度魔法

**动机**：真实世界里股票的漂移率 $\mu$（真实收益率）无法准确估计，也因人的风险偏好而"不公平"。但期权定价不应该依赖你对 $\mu$ 的主观估计——这就是"无套利定价"的哲学。解决办法：**换一个概率测度，把 drift 换成无风险利率 $r$**，这样定价只跟波动率 $\sigma$ 有关，不需要猜 $\mu$。

**Girsanov定理核心内容**：给定 $\theta_t$（"市场价格的风险"），定义新过程：

$$
\widetilde{W}_t = W_t + \int_0^t \theta_s\, ds
$$

存在一个新概率测度 $Q$（通过 Radon-Nikodym 导数 $\frac{dQ}{dP}=\exp\left(-\int_0^T\theta_s dW_s - \frac12\int_0^T\theta_s^2 ds\right)$ 定义），使得 $\widetilde{W}_t$ 在 $Q$ 下是标准布朗运动。

> 🔑 **人话**：**在原来的测度下带漂移的过程，换一个"打分方式"（测度）后，可以变成没有漂移的纯布朗运动。** 具体到金融：真实世界股价 $dS=\mu S\,dt+\sigma S\,dW$，换到"风险中性测度" $Q$ 下变成 $dS = rS\,dt + \sigma S\,d\widetilde W$——所有资产在$Q$下都以无风险利率增长。**这就是为什么定价时可以"假装所有人风险中性"来算期望再贴现，且答案不依赖真实的 $\mu$**——这是整个衍生品定价理论的基石（鞅定价法）。

---

### 第七部分：Diffusion 模型里的 SDE——AI应用

这是把上面所有工具串起来的地方，也是你说的"AI中的diffusion"。

#### 7.1 前向过程：一个把数据"搅成噪声"的SDE

DDPM/Score-based模型的连续时间统一框架（Song et al. 2021）：

$$
dX_t = f(X_t,t)\,dt + g(t)\,dW_t, \quad t: 0\to T
$$

$X_0\sim$ 真实数据分布，$X_T\approx$ 纯高斯噪声。

两种常见具体形式：

- **VP-SDE**（对应DDPM）：$dX_t = -\frac12\beta(t)X_t\, dt + \sqrt{\beta(t)}\, dW_t$
  > 这就是一个**时间相关系数的 OU 过程**！drift 把数据往0拉，同时不断加噪声，最终收敛到标准正态分布。这解释了为什么DDPM的加噪公式长得像 OU 过程的离散解。

- **VE-SDE**（对应NCSN/SMLD）：$dX_t = \sqrt{\frac{d[\sigma^2(t)]}{dt}}\,dW_t$
  > 没有drift，纯粹靠不断增大的噪声方差把数据"淹没"掉。

> 🔑 **人话**：**Diffusion模型的"前向加噪"过程，本质就是一个把数据分布逐渐推向已知简单分布（通常是高斯）的SDE**，用的正是我们上面讲的OU过程或纯扩散过程。

#### 7.2 反向过程：Anderson 反向时间SDE（这是diffusion模型能"生成"的数学核心）

**核心问题**：前向过程把数据变成了噪声，我们想反过来——从噪声生成数据，即需要一个"倒着放"的SDE。

**Anderson (1982) 定理**：如果正向SDE是 $dX_t = f(X_t,t)dt + g(t)dW_t$，且 $p_t(x)$ 是 $X_t$ 的边缘密度，那么反向时间过程（$t$ 从 $T$ 走到 $0$）满足：

$$
\boxed{dX_t = \Big[f(X_t,t) - g(t)^2 \nabla_x \log p_t(X_t)\Big]dt + g(t)\, d\bar W_t}
$$

其中 $d\bar W_t$ 是反向时间的布朗运动（时间倒流方向的独立增量）。

**这个公式怎么来的（直觉，不做严格推导）**：把 Fokker-Planck 方程反过来看——正向过程让概率"扩散摊平"，那反向过程要"聚拢"概率，就得沿着密度梯度上升的方向修正drift。数学上可以证明，只要在 drift 里加上 $-g^2\nabla\log p_t$ 这一项（称为**得分函数，score function**），反向过程的边缘分布 $p_t$ 恰好和正向过程完全一致（只是时间倒放）。

> 🔑 **人话（Diffusion模型的灵魂公式）**：**只要知道每个时刻的 $\nabla_x \log p_t(x)$（即"得分函数"，指向数据密度增大方向的向量场），就可以把加噪过程完全倒放回去，从纯噪声生成数据。** 而神经网络要学的东西，正是用一个网络 $s_\theta(x,t)$ 去拟合这个未知的 $\nabla_x\log p_t(x)$——这就是"score matching / 去噪得分匹配"训练目标的来源。DDPM里网络预测的噪声 $\epsilon_\theta$，本质上和 score 只差一个已知的常数系数。

#### 7.3 概率流ODE（Probability Flow ODE）——去掉随机性的等价视角

存在一个**确定性**的ODE，和上面的SDE有完全相同的边缘分布 $p_t(x)$：

$$
dX_t = \left[f(X_t,t) - \frac12 g(t)^2\nabla_x\log p_t(X_t)\right]dt
$$

> 🔑 **人话**：这就是为什么diffusion模型既能用随机采样（DDPM式，多样性更强），也能用确定性ODE求解器（DDIM、DPM-Solver等，更快更稳定）——它们在理论上追踪的是**同一族分布**，只是"随不随机"的区别。这也是数值ODE理论能直接搬来加速diffusion采样的原因。

---

### 第八部分：数值方法——最简单的Euler-Maruyama

当SDE没有解析解时（大多数情况），用离散化模拟：

$$
X_{n+1} = X_n + \mu(X_n,t_n)\,\Delta t + \sigma(X_n,t_n)\,\sqrt{\Delta t}\, Z_n,\quad Z_n\sim\mathcal N(0,1)
$$

> 🔑 **人话**：把 $dt\to \Delta t$，$dW_t \to \sqrt{\Delta t}\cdot Z$（因为 $W$ 的增量标准差是 $\sqrt{\Delta t}$）。这是最基础的蒙特卡洛模拟SDE路径的方法，也是DDPM采样时"一步步去噪"迭代公式的数学原型（其实DDPM采样公式就是反向SDE的Euler-Maruyama离散化）。

---

### 总结：一张记忆卡片

| 概念 | 一句话记忆 |
|---|---|
| $(dW)^2=dt$ | 布朗运动抖动剧烈，二阶项不可忽略，是整个理论的起点 |
| Itô公式 | 普通链式法则 + 二阶导修正项（凸性/Jensen效应） |
| GBM | 股价对数收益率是布朗运动，多一个 $-\sigma^2/2$ 修正 |
| OU过程 | 带"弹簧回复力"的布朗运动，均值回归，diffusion前向过程原型 |
| Feynman-Kac | PDE的解 = 对应SDE路径终值的期望（联系定价PDE与蒙特卡洛） |
| Fokker-Planck | 描述整个概率密度如何被drift平移、被noise摊平 |
| Girsanov | 换测度可以把drift换掉，是风险中性定价的理论基础 |
| 反向SDE / Score | 只要知道 $\nabla\log p_t$，就能把加噪过程完全倒放，生成数据 |

---

### 学习路线建议

1. 先彻底吃透 **Itô公式**（做几个具体例子的手推：$d(W^2)$, $d(e^{W_t})$, GBM的log变换）
2. 用 GBM + Black-Scholes PDE 把 **Feynman-Kac** 具体走一遍（这是理解"定价=期望=解PDE"三位一体最好的例子）
3. 读 Song et al. 2021《Score-Based Generative Modeling through Stochastic Differential Equations》原文，把DDPM/NCSN都映射到SDE框架里
4. 如果要严格化，再回头补 Øksendal《Stochastic Differential Equations》，那时候你已经有了直觉框架，严格证明只是"补细节"而不是"学新东西"
## SDE 完整精讲：补全定义链条与推导细节

上一版为了追求"一口气看完"牺牲了一些逻辑严密性。这一版把关键的定义和推导补全，保证你从头读到尾**逻辑链条不断裂**：每个新概念出现前，都先讲"为什么必须引入它"；每个公式，都讲清楚"从哪一步到哪一步、用了什么规则"。

---

### 第 0 部分：最小概率论词汇表（不装深奥，只讲够用的）

随机过程 $X_t$ 本质是"每个时间点 $t$，你有一个随机变量 $X_t(\omega)$"。要谈论"信息随时间积累"，需要几个词：

> **滤波（Filtration）$\{\mathcal F_t\}_{t\ge0}$**：$\mathcal F_t$ 是"截止到时刻 $t$，你所能知道的全部信息"。它随 $t$ 递增（$\mathcal F_s\subset\mathcal F_t,\ s<t$），因为信息只会累积不会遗忘。

> **适应过程（Adapted process）**：如果 $X_t$ 的取值仅依赖于 $\mathcal F_t$（即"在时刻 $t$ 你已经知道 $X_t$ 是多少"），就说 $X_t$ 关于 $\{\mathcal F_t\}$ 适应。

🔑 **人话**：滤波就是"随时间展开的信息树"。"适应"就是要求一个过程**不能偷看未来**——这是上一版提到"非预期性"的严格数学化。之所以要专门定义它，是因为随机积分（下面马上讲）**必须**用适应过程去积分，否则会出现"用未来信息套利"这种荒谬结果。

> **（离散/连续时间）鞅（Martingale）**：适应过程 $M_t$ 满足
> $$\mathbb E[|M_t|]<\infty,\qquad \mathbb E[M_t\mid \mathcal F_s] = M_s,\quad \forall s<t$$

🔑 **人话**：鞅就是"公平游戏"——给定现在的全部信息，对未来值的最优预测就是现在的值，既不会系统性上升也不会系统性下降。**为什么这个概念贯穿整个SDE理论**：Itô积分是鞅（马上会证明为什么）；无套利定价的核心洞察就是"贴现后的资产价格在正确的测度下应该是鞅"（否则就能构造套利策略）。**鞅是"随机性但没有可预测趋势"这一直觉的精确数学表达。**

---

### 第 1 部分：布朗运动——严格定义 + 二次变差是怎么"证明"出来的

> **定义（标准布朗运动）**：适应过程 $\{W_t\}_{t\ge0}$ 称为标准布朗运动，若：
> 1. $W_0=0$（几乎必然）；
> 2. 独立增量：对 $s<t$，$W_t-W_s$ 独立于 $\mathcal F_s$；
> 3. 增量正态：$W_t - W_s \sim \mathcal N(0, t-s)$；
> 4. 路径 $t\mapsto W_t(\omega)$ 几乎必然连续。

**为什么用这四条公理，而不是别的？** 因为它们精确刻画了"没有记忆、没有偏向、抖动幅度随时间线性增长（方差），但路径不断裂"这个物理直觉。（存在性需要 Kolmogorov 延拓定理，这里我们承认它存在，不做严格构造。）

#### 1.1 二次变差：不是拍脑袋规定的，是算出来的

**动机**：想知道 $\sum (\Delta W_i)^2$ 到底趋于什么，才能判断"普通泰勒展开二阶项能不能忽略"。

把 $[0,t]$ 均匀分成 $n$ 份，$\Delta t = t/n$，记 $\Delta W_i = W_{t_{i+1}}-W_{t_i}$。定义

$$
Q_n = \sum_{i=0}^{n-1}(\Delta W_i)^2
$$

**计算期望和方差**（这是能亲手验证的，不是玄学）：

- 由公理 3，$\mathbb E[(\Delta W_i)^2] = \Delta t$，所以 $\mathbb E[Q_n] = n\cdot \Delta t = t$。
- 由公理 2（独立增量），不同 $i$ 之间协方差为 0，只需算单项方差。对正态变量 $Z\sim\mathcal N(0,\Delta t)$，$\mathrm{Var}(Z^2)=2(\Delta t)^2$。所以
$$
\mathrm{Var}(Q_n) = \sum_i 2(\Delta t)^2 = 2n(\Delta t)^2 = \frac{2t^2}{n}\xrightarrow{n\to\infty}0
$$

**结论**：$Q_n$ 的均值恒为 $t$，方差趋于 0，由 Chebyshev 不等式，$Q_n$ **依概率收敛**到常数 $t$：

$$
\boxed{[W,W]_t := \lim_{n\to\infty}\sum(\Delta W_i)^2 = t \quad(\text{几乎处处，这个极限称为二次变差})}
$$

🔑 **人话（这次是严格算出来的，不是断言）**：布朗运动增量平方和不会像普通函数那样趋于 0，而是稳稳地收敛到时间长度本身。**方差趋于 0 意味着这个极限几乎是"确定性"的**——尽管每一步 $\Delta W_i$ 都是随机的，但它们的平方加起来却"随机性互相抵消"，收敛到一个必然的数 $t$。这就是符号规则 $(dW_t)^2=dt$ 的真正来源：它不是符号操作的巧合，而是大数定律式的精确极限。

同样可以证明：$\sum \Delta W_i \Delta t_i \to 0$（交叉项，因为量级是 $O(\Delta t\cdot\sqrt{\Delta t})$，比 $\Delta t$ 更小），以及 $\sum(\Delta t_i)^2\to0$。这就是完整的符号表：

$$
dt\cdot dt = 0,\qquad dt\cdot dW = 0,\qquad dW\cdot dW = dt
$$

---

### 第 2 部分：Itô 积分——从"简单过程"逼近开始，一步步搭出来

#### 2.1 为什么普通积分行不通

黎曼-斯蒂尔杰斯积分要求被积路径"有界变差"（$\sum|\Delta W_i|$ 有限）。但布朗运动路径的变差是**无穷**的（这是它处处不可导的另一种说法）。所以必须重新定义"对 $dW_t$ 积分"是什么意思。

#### 2.2 构造思路：先对"阶梯过程"定义，再逼近一般过程

**第一步**：对**简单（阶梯）适应过程** $H_t = \sum_i h_i\,\mathbf 1_{[t_i,t_{i+1})}(t)$（$h_i$ 是 $\mathcal F_{t_i}$-可测的随机变量，即"在 $t_i$ 时刻已知的量"），直接定义：

$$
\int_0^T H_t\,dW_t := \sum_i h_i(W_{t_{i+1}}-W_{t_i})
$$

**关键动机**：为什么系数 $h_i$ 必须是 $\mathcal F_{t_i}$-可测（用区间**左端点**信息）？因为这是在模拟"用今天已有的信息决定仓位 $h_i$，然后承受下一时刻的价格变动 $\Delta W_i$"——这正是真实交易的时序结构，用不了未来信息。

**第二步（Itô 等距，L² 逼近的关键）**：对简单过程直接计算，利用独立增量、均值为0：

$$
\mathbb E\left[\left(\sum_i h_i \Delta W_i\right)^2\right] = \sum_i \mathbb E[h_i^2]\,\mathbb E[(\Delta W_i)^2] = \sum_i \mathbb E[h_i^2]\Delta t_i = \mathbb E\left[\int_0^T H_t^2\,dt\right]
$$

（交叉项 $i\ne j$ 之所以消失：不妨设 $i<j$，则 $h_ih_j\Delta W_i$ 关于 $\mathcal F_{t_j}$ 可测，乘以独立于 $\mathcal F_{t_j}$ 的 $\Delta W_j$，取条件期望后为 0。）

这就是 **Itô 等距**：

$$
\boxed{\mathbb E\left[\left(\int_0^T H_t\,dW_t\right)^2\right] = \mathbb E\left[\int_0^T H_t^2\,dt\right]}
$$

**第三步（推广到一般过程）**：对满足 $\mathbb E\int_0^T H_t^2\,dt<\infty$ 的一般适应过程 $H_t$，可以找到一列简单过程 $H_t^{(n)}\to H_t$（在 $L^2$ 意义下），Itô 等距保证 $\int H^{(n)}dW$ 是 Cauchy 列，从而收敛到某个极限，定义为 $\int_0^T H_t\,dW_t$。

🔑 **人话**：**Itô积分不是"求一个函数的原函数再代入"，而是"用越来越细的阶梯函数去逼近，且逼近的误差用 Itô 等距（把随机积分的方差转化为普通积分）来控制收敛"。** 这套构造保证了两个宝贵性质自动成立：

> **Itô积分的性质**：设 $I_t=\int_0^t H_s\,dW_s$，则
> 1. **鞅性**：$I_t$ 是鞅，$\mathbb E[I_t]=0$；
> 2. **等距**：$\mathbb E[I_t^2] = \mathbb E\int_0^t H_s^2\,ds$；
> 3. **线性**：$\int(aH+bK)dW = a\int H dW + b\int K dW$。

🔑 **鞅性为什么自动成立**：因为构造它的每一块 $h_i\Delta W_i$，在给定 $\mathcal F_{t_i}$ 的条件下，$\Delta W_i$ 独立同分布均值为0，条件期望自然为0，一步步累加保持这个性质（这是鞅的"增量条件期望为零"的直接体现）。

---

### 第 3 部分：一般 Itô 过程的二次变差与协变差

> **Itô 过程**：形如 $X_t = X_0+\int_0^t \mu_s\,ds + \int_0^t \sigma_s\,dW_s$ 的过程，简写 $dX_t=\mu_t\,dt+\sigma_t\,dW_t$。

> **二次变差（一般定义）**：$[X,X]_t := \lim\sum(X_{t_{i+1}}-X_{t_i})^2$（依概率收敛意义下）。对 Itô 过程可以证明：
> $$[X,X]_t = \int_0^t \sigma_s^2\,ds$$
> （直觉：drift 项 $\mu\,dt$ 贡献的平方是 $O(dt^2)$，可忽略；只有扩散项贡献二次变差，且贡献率正是 $\sigma^2$。）

> **协变差（两个过程一起动时要用）**：若 $dX=\mu_1dt+\sigma_1dW^{(1)}$，$dY=\mu_2dt+\sigma_2dW^{(2)}$，且 $dW^{(1)}dW^{(2)}=\rho\,dt$（两个布朗运动的"相关系数"是 $\rho$），则
> $$[X,Y]_t = \int_0^t \rho_s\,\sigma_1(s)\sigma_2(s)\,ds$$

🔑 **人话**：二次变差衡量"这个过程自身抖得多剧烈"，协变差衡量"两个随机过程一起抖的时候，抖动方向有多同步"。多资产模型（比如两只股票的联合动态）里，Itô 公式的推广就是靠这个协变差算交叉项。

---

### 第 4 部分：Itô 公式——完整的推导链条

#### 4.1 一维情形：把每一步的"为什么"钉死

**目标**：求 $Y_t = f(X_t,t)$（$f\in C^{2,1}$，二阶连续可微）的微分形式，其中 $dX_t=\mu_t\,dt+\sigma_t\,dW_t$。

**第一步——为什么要展开到二阶**：普通微积分里，$\Delta f \approx f_t\Delta t + f_x \Delta X + \frac12 f_{xx}(\Delta X)^2+\cdots$，高阶项被认为是 $o(\Delta t)$ 而舍弃。**但现在我们必须先检查 $(\Delta X)^2$ 到底是几阶小量**，不能想当然地舍弃。

**第二步——计算 $(\Delta X)^2$ 的阶数**：

$$
(\Delta X)^2 = (\mu\Delta t + \sigma\Delta W)^2 = \mu^2(\Delta t)^2 + 2\mu\sigma\,\Delta t\Delta W + \sigma^2(\Delta W)^2
$$

用第1部分建立的符号表：$(\Delta t)^2=o(\Delta t)$，$\Delta t\Delta W = o(\Delta t)$（因为 $\Delta W\sim\sqrt{\Delta t}$，所以 $\Delta t \Delta W \sim \Delta t^{3/2}$），但 $(\Delta W)^2 = \Delta t + o(\Delta t)$（这是二次变差的结论，误差项方差趋于0）。所以：

$$
(\Delta X)^2 = \sigma^2\Delta t + o(\Delta t)
$$

**第三步——代入泰勒展开，只保留 $O(\Delta t)$ 项**：

$$
\Delta f \approx f_t\Delta t + f_x(\mu\Delta t+\sigma\Delta W) + \frac12 f_{xx}\cdot\sigma^2\Delta t
$$

取极限 $\Delta t\to0$（更严格地说，是对求和取极限，用类似 Itô 积分构造的逼近论证，这里从略），得到 **Itô 公式**：

$$
\boxed{df(X_t,t) = \left(f_t + \mu f_x + \frac12\sigma^2 f_{xx}\right)dt + \sigma f_x\,dW_t}
$$

🔑 **人话**：**唯一区别于普通链式法则的地方，就是多了 $\frac12\sigma^2 f_{xx}$ 这一项**——它来自"布朗运动二阶抖动不可忽略"这一事实，本质是 Jensen 不等式的无穷小版本：如果 $f$ 是凸的（$f_{xx}>0$），噪声会在"平均"意义上系统性推高 $f$ 的值。

#### 4.2 多维 Itô 公式（实际应用中经常需要）

设 $\mathbf X_t=(X_t^1,\dots,X_t^n)$ 是向量 Itô 过程，$dX_t^i = \mu^i\,dt + \sum_j \sigma^{ij}\,dW_t^j$，$f(\mathbf x,t)$ 二阶可微，则：

$$
df = f_t\,dt + \sum_i f_{x_i}\,dX_t^i + \frac12\sum_{i,k} f_{x_ix_k}\,d[X^i,X^k]_t
$$

其中 $d[X^i,X^k]_t = \left(\sum_j\sigma^{ij}\sigma^{kj}\right)dt$（用协变差规则算出交叉项）。

🔑 **人话**：多维情形就是把 Hessian 矩阵和"瞬时协方差矩阵" $\Sigma\Sigma^T$ 做内积——一维的 $\frac12\sigma^2 f_{xx}$ 自然推广成 $\frac12\mathrm{tr}(\Sigma\Sigma^T \nabla^2f)$。这一项在多元期权定价（一篮子期权）、多因子模型中随处可见。

---

### 第 5 部分：SDE 本身——定义、什么时候"有解"

> **SDE（随机微分方程）**：
> $$dX_t = \mu(X_t,t)\,dt + \sigma(X_t,t)\,dW_t,\qquad X_0=x_0$$
> 严格意思是它的积分形式：$X_t = x_0+\int_0^t\mu(X_s,s)ds+\int_0^t\sigma(X_s,s)dW_s$。

**一个必须问的问题**：给定任意的 $\mu,\sigma$，这个方程一定有（唯一）解吗？—— 不一定！这和普通 ODE 一样：$\frac{dx}{dt}=x^{2/3}$ 在原点处有无穷多条解曲线（因为 $x^{2/3}$ 在 0 处不 Lipschitz）。SDE 也有类似的病态情形。

> **存在唯一性定理（Itô）**：若 $\mu,\sigma$ 满足
> 1. **Lipschitz 条件**：$|\mu(x,t)-\mu(y,t)|+|\sigma(x,t)-\sigma(y,t)|\le K|x-y|$
> 2. **线性增长条件**：$|\mu(x,t)|+|\sigma(x,t)|\le K(1+|x|)$
>
> 则 SDE 存在唯一强解，且 $\mathbb E[X_t^2]<\infty$（不会在有限时间内爆炸）。

🔑 **人话**：Lipschitz 条件保证"解不会在某一点分叉成两条路径"（唯一性），线性增长条件保证"解不会在有限时间内冲向无穷大"（存在性/不爆炸）。**这不是数学家的洁癖**，在实践中真的会踩坑：例如 CIR 利率模型 $dr_t=\kappa(\theta-r_t)dt+\sigma\sqrt{r_t}\,dW_t$ 里的 $\sqrt{r_t}$ 在 $r=0$ 处不 Lipschitz，需要额外证明（Feller 条件 $2\kappa\theta\ge\sigma^2$）来保证 $r_t$ 不会碰到 0 以下、模型良定义。**任何时候你自己发明一个新的 diffusion 系数，都应该先检查这两个条件，否则数值模拟可能会给出没有理论意义的"解"。**

> **强解 vs 弱解（简单认知即可）**：强解要求 $X_t$ 是给定的布朗运动 $W_t$ 的显式（可测）函数；弱解只要求存在**某个**概率空间和布朗运动，使得方程在分布意义上成立。做定价理论时通常默认强解；证明一些存在性结果时会退而求其次找弱解。

---

### 第 6 部分：经典模型（补充完整解的推导逻辑）

#### 6.1 几何布朗运动（GBM）

$$
dS_t = \mu S_t\,dt+\sigma S_t\,dW_t
$$

**求解动机**：直接积分 $dS_t$ 不行（$\mu S_t,\sigma S_t$ 里含未知的 $S_t$ 自己），标准技巧是**找一个变换把 SDE"线性化"**。取 $f(x)=\ln x$，因为对数能把乘法结构变成加法结构，直觉上正适合"百分比变化"模型。

代入一维 Itô 公式（$f_x=1/x,\ f_{xx}=-1/x^2$）：

$$
d(\ln S_t) = \left(\mu - \frac{\sigma^2}{2}\right)dt + \sigma\,dW_t
$$

右边不再含未知函数，是纯粹的"drift+扩散"常系数形式，可以直接积分：

$$
\ln S_t - \ln S_0 = \left(\mu-\frac{\sigma^2}2\right)t + \sigma W_t \implies \boxed{S_t=S_0\exp\left[\left(\mu-\frac{\sigma^2}2\right)t+\sigma W_t\right]}
$$

🔑 **人话**：这一步"取对数"的操作本质是在找 Itô 公式意义下的"配方"，让二阶导数项恰好抵消掉未知量，变成可积分的形式——这是解非线性SDE最常用的核心技巧（叫做"寻找 Itô 变换使方程线性化"）。$-\sigma^2/2$ 就是二阶导数项 $f_{xx}=-1/x^2$ 贡献的、无法避免的"随机性拖累"。

#### 6.2 Ornstein-Uhlenbeck 过程

$$
dX_t=\theta(\mu-X_t)dt+\sigma dW_t
$$

**求解动机**：这是线性SDE，标准解法是 ODE 里的"积分因子法"照搬过来（因为 $\sigma$ 是常数，不依赖 $X_t$，不需要 Itô 二阶修正项）。取积分因子 $e^{\theta t}$，对 $Y_t=e^{\theta t}X_t$ 用（这里其实退化为普通乘积法则，因为 $Y_t$ 关于 $X_t$ 是线性的，$f_{xx}=0$）：

$$
dY_t = \theta e^{\theta t}X_t\,dt + e^{\theta t}dX_t = e^{\theta t}\left[\theta X_t\,dt+\theta(\mu-X_t)dt+\sigma dW_t\right]=\theta\mu e^{\theta t}dt+\sigma e^{\theta t}dW_t
$$

两边积分：

$$
X_t = X_0e^{-\theta t}+\mu(1-e^{-\theta t})+\sigma\int_0^t e^{-\theta(t-s)}dW_s
$$

由 Itô 等距，方差为 $\sigma^2\int_0^t e^{-2\theta(t-s)}ds = \frac{\sigma^2}{2\theta}(1-e^{-2\theta t})$。

🔑 **人话**：$X_t$ 是正态分布，均值指数地从 $X_0$ 收敛到 $\mu$，方差指数地从 0 收敛到 $\sigma^2/2\theta$。**长时间后，$X_t$ 会稳定在 $\mathcal N(\mu,\sigma^2/2\theta)$**——这个"极限分布"的存在性，正是 diffusion 模型选它作为前向过程原型的原因：只要跑得够久，无论初始数据是什么分布，都会被"吃"成一个固定的高斯分布，这样反向生成时才能从固定的高斯噪声出发。

---

### 第 7 部分：鞅表示定理——通往 Girsanov 与对冲的关键桥梁

> **鞅表示定理**：设 $\{\mathcal F_t\}$ 是布朗运动 $W_t$ 生成的滤波，$M_t$ 是关于此滤波的（平方可积）鞅，则存在唯一的适应过程 $Z_t$，使得
> $$M_t = M_0 + \int_0^t Z_s\,dW_s$$

🔑 **人话**：**在布朗运动生成的信息结构里，任何"公平游戏"（鞅）都可以被写成对布朗运动的随机积分**——换句话说，布朗运动是这个信息系统里唯一的"随机性来源"，所有随机波动都能拆解成"对 $dW_t$ 的某种加权累积"。

**这为什么重要**：在金融里，如果一个衍生品的贴现价格是鞅，鞅表示定理保证**存在一个对冲策略 $Z_t$**（在动态调整持仓 $Z_t$ 份标的资产），使得组合价值随时间的变化恰好复制这个鞅——这就是"完全市场里任何衍生品都可以被动态对冲"这一命题的数学根源。

---

### 第 8 部分：Girsanov 定理——完整表述与推导思路

#### 8.1 想解决的问题

真实世界下 $dS_t=\mu S_tdt+\sigma S_tdW_t$，$\mu$ 是主观、难以估计的真实收益率。我们想找一个新的概率测度 $Q$，使得在 $Q$ 下，$S_t$ 的drift变成已知的无风险利率 $r$，从而定价不依赖 $\mu$。

#### 8.2 构造

设 $\theta_t$ 是适应过程（叫"风险的市场价格"），定义**指数鞅（Radon-Nikodym 密度过程）**：

$$
Z_t = \exp\left(-\int_0^t\theta_s\,dW_s - \frac12\int_0^t\theta_s^2\,ds\right)
$$

**为什么长这个样子——动机**：这个形式恰好是"随机指数"，用 Itô 公式验证：令 $L_t=-\int\theta dW-\frac12\int\theta^2ds$，则 $Z_t=e^{L_t}$，

$$
dZ_t = Z_t\,dL_t + \frac12 Z_t\,d[L,L]_t = Z_t\left(-\theta_t dW_t-\frac12\theta_t^2dt\right)+\frac12 Z_t\theta_t^2dt = -\theta_t Z_t\,dW_t
$$

**关键观察**：$dZ_t$ **没有 drift 项**，纯粹是随机积分——这正是为了保证 $Z_t$ 是鞅（$\mathbb E[Z_t]=Z_0=1$，恒为1），从而可以合法地作为一个新概率测度的密度（密度积分必须归一化为1）。

> **Novikov 条件**：若 $\mathbb E\left[\exp\left(\frac12\int_0^T\theta_s^2ds\right)\right]<\infty$，则 $Z_t$ 确实是（真）鞅（而不仅仅是"局部鞅"），保证 $\mathbb E[Z_T]=1$，$Q$ 是良定义的概率测度。

🔑 **人话**：这是一个技术性但不能省略的条件——没有它，$Z_t$ 有可能"期望值泄漏"（局部鞅但非真鞅），导致 $Q$ 不是一个合法的概率测度（总概率小于1）。实践中只要 $\theta_t$（比如夏普比率）有界或增长可控，这个条件基本自动满足。

#### 8.3 定理内容

定义新测度 $\dfrac{dQ}{dP}\Big|_{\mathcal F_T} = Z_T$。则在 $Q$ 下：

$$
\widetilde W_t := W_t + \int_0^t\theta_s\,ds \quad\text{是标准布朗运动}
$$

**为什么成立（思路，不做完整证明）**：可以证明 $\widetilde W_t$ 在 $Q$ 下是**连续鞅**，且其二次变差仍是 $t$（因为二次变差是路径性质，加一个绝对连续的 drift 不改变它）。这时借助：

> **Lévy 刻画定理**：一个连续局部鞅，若二次变差恰好是 $[M,M]_t=t$，则它必然是标准布朗运动。

直接得出 $\widetilde W_t$ 是 $Q$-布朗运动。

🔑 **人话**：Girsanov 定理说的是——**在原来的概率测度下带着 drift $\theta_t$ 的过程 $W_t+\int\theta ds$，只要你换一套"打分方式"（概率测度），它摇身一变就成了没有 drift 的纯布朗运动。** 应用到金融：$dS=\mu Sdt+\sigma SdW$，取 $\theta = (\mu-r)/\sigma$（夏普比率），则 $dW_t = d\widetilde W_t - \theta\,dt$，代入：

$$
dS_t = \mu S_t dt + \sigma S_t(d\widetilde W_t-\theta dt) = (\mu-\sigma\theta)S_tdt+\sigma S_td\widetilde W_t = rS_tdt+\sigma S_td\widetilde W_t
$$

在 $Q$（"风险中性测度"）下，所有资产都以无风险利率 $r$ 增长，**这就是"风险中性定价"合法性的完整来源**：定价 = 在 $Q$ 测度下算期望再用 $r$ 贴现，且这个答案与真实世界的 $\mu$ 无关（$\mu$ 已经被换测度"吸收"掉了）。

---

### 第 9 部分：Feynman-Kac 公式——一般形式（含贴现率）+ 完整推导

#### 9.1 一般形式

设 $u(x,t)$ 满足带**贴现（killing）率** $r(x,t)$ 的倒向抛物型 PDE：

$$
\frac{\partial u}{\partial t}+\mu u_x+\frac12\sigma^2u_{xx} - r(x,t)u=0,\qquad u(x,T)=\phi(x)
$$

则

$$
\boxed{u(x,t) = \mathbb E\left[\exp\left(-\int_t^Tr(X_s,s)ds\right)\phi(X_T)\,\middle|\,X_t=x\right]}
$$

（$X_t$ 满足 $dX_t=\mu(X_t,t)dt+\sigma(X_t,t)dW_t$）

#### 9.2 推导（把"贴现"塞进 Itô 公式）

**动机**：直接对 $u(X_t,t)$ 用 Itô 公式，drift 项因 PDE 而消失（上一版讲过），但现在 PDE 里多了 $-ru$ 这一项，需要把"贴现因子"也放进去凑成鞅。

定义 $D_t = \exp\left(-\int_0^tr(X_s,s)ds\right)$（贴现因子），考虑乘积过程 $Y_t = D_t\,u(X_t,t)$，用乘积法则（即 Itô 公式的推广，$d(AB)=AdB+BdA+d[A,B]$，这里 $D_t$ 是有限变差过程，$d[D,u]=0$）：

$$
dY_t = D_t\,du(X_t,t) + u(X_t,t)\,dD_t
$$

其中 $dD_t = -r(X_t,t)D_t\,dt$（$D_t$ 是普通的关于 $t$ 的指数衰减，无随机项）。代入 $du$ 的 Itô 公式：

$$
dY_t = D_t\left[\left(u_t+\mu u_x+\frac12\sigma^2u_{xx}\right)dt+\sigma u_x\,dW_t\right] - D_t\,r\,u\,dt
$$

$$
= D_t\underbrace{\left(u_t+\mu u_x+\frac12\sigma^2u_{xx}-ru\right)}_{=0，恰好是PDE}dt + D_t\sigma u_x\,dW_t
$$

drift 项因 PDE 恰好为零，剩下 $Y_t$ 是纯随机积分（鞅），所以 $\mathbb E[Y_t]$ 不随时间变：

$$
Y_t = \mathbb E[Y_T\mid\mathcal F_t]\implies D_t\,u(X_t,t)=\mathbb E\left[D_T\,\phi(X_T)\mid\mathcal F_t\right]
$$

两边除以 $D_t$（并用 $D_T/D_t=\exp(-\int_t^Tr\,ds)$）即得结论。

🔑 **人话**：**Feynman-Kac 的核心技巧永远是同一招——把 PDE 硬凑成"某个过程的 drift"，然后用 Itô 公式把这个 drift 项消掉，剩下的必然是鞅，鞅的期望不随时间变，首尾相接就是答案。** Black-Scholes 方程正是这个一般公式在 $\mu=rS,\ \sigma=\sigma S,\ r(x,t)=r$（常数无风险利率）时的特例——这就是为什么解 Black-Scholes PDE 和做风险中性测度下的蒙特卡洛模拟，本质是同一件事的两种算法。

---

### 第 10 部分：Fokker-Planck 方程——从 Itô 公式"取期望"严格推导出来

#### 10.1 动机回顾

Itô 公式讲的是"一条路径上函数值怎么变"；但我们经常更关心"如果放出无穷多条独立路径（即整个概率密度 $p(x,t)$），密度本身怎么演化"。这需要一个新的推导，不能直接照搬 Itô 公式。

#### 10.2 推导（弱形式 + 分部积分，逻辑严密的标准做法）

**第一步**：取任意光滑、紧支撑的**测试函数** $\varphi(x)$（不显式依赖 $t$）。对 $\varphi(X_t)$ 用 Itô 公式：

$$
d\varphi(X_t) = \left[\mu(X_t,t)\varphi'(X_t)+\frac12\sigma^2(X_t,t)\varphi''(X_t)\right]dt + \sigma\varphi'(X_t)\,dW_t
$$

**第二步——取期望消掉随机项**：假设正则性条件使随机积分项的期望为0（鞅性质），两边取期望并对 $t$ 求导：

$$
\frac{d}{dt}\mathbb E[\varphi(X_t)] = \mathbb E\left[\mu(X_t,t)\varphi'(X_t)+\frac12\sigma^2(X_t,t)\varphi''(X_t)\right]
$$

**第三步——把期望写成对密度的积分**（这一步是关键，把"路径语言"翻译成"密度语言"）：

$$
\frac{d}{dt}\int\varphi(x)p(x,t)\,dx = \int\left[\mu(x,t)\varphi'(x)+\frac12\sigma^2(x,t)\varphi''(x)\right]p(x,t)\,dx
$$

**第四步——分部积分，把导数从 $\varphi$ "转移"到 $(\mu p)$ 和 $(\sigma^2 p)$ 上**（因为我们想得到的是 $p$ 满足的方程，$\varphi$ 只是辅助工具，要想办法让它从方程里消失）：

$$
\int \mu\varphi' p\,dx = -\int \varphi\,\partial_x(\mu p)\,dx,\qquad \int \frac12\sigma^2\varphi'' p\,dx = \int \varphi\cdot\frac12\partial_x^2(\sigma^2 p)\,dx
$$

（边界项因 $\varphi$ 紧支撑而为0；用了两次分部积分处理二阶导数项。）

**第五步——两边都写成"$\int\varphi\cdot(\cdots)dx$"的形式**：

$$
\int\varphi(x)\left[\partial_tp(x,t)\right]dx = \int\varphi(x)\left[-\partial_x(\mu p)+\frac12\partial_x^2(\sigma^2p)\right]dx
$$

**第六步——因为 $\varphi$ 任意**，由变分法基本引理（两个函数对任意测试函数的积分都相等，则这两个函数几乎处处相等），得到：

$$
\boxed{\partial_t p(x,t) = -\partial_x\big[\mu(x,t)p(x,t)\big] + \frac12\partial_x^2\big[\sigma^2(x,t)p(x,t)\big]}
$$

这就是 **Fokker-Planck 方程**（又称向前 Kolmogorov 方程）。

🔑 **人话**：整个推导的核心技巧是**"弱形式"**——不直接对 $p$ 求方程，而是先证明"对任意测试函数 $\varphi$，两边积分相等"，再用任意性"抠出"$p$ 满足的方程。这一招在 PDE、有限元方法、物理场论里反复出现，值得记住这个套路本身。**结论的直觉**：$-\partial_x(\mu p)$ 是"概率被 drift 定向搬运"（对流项），$\frac12\partial_x^2(\sigma^2p)$ 是"概率被噪声摊平"（扩散项）——这就是为什么它长得像热传导方程，因为本质上就是"随机搬运+扩散"的连续性方程。

---

### 第 11 部分：反向时间 SDE——严格匹配 Fokker-Planck，推出 Anderson 公式

这是 diffusion 模型最核心的数学结果，上一版只给了公式没有推导，这里补全。

#### 11.1 问题精确化

前向过程 $dX_t=f(X_t,t)dt+g(t)dW_t$（$0\to T$），密度 $p_t(x)$ 满足上面的 Fokker-Planck 方程（这里 $\sigma=g(t)$ 与 $x$ 无关，简化交叉项）：

$$
\partial_tp = -\partial_x(fp)+\frac12g^2\partial_x^2p
$$

**我们想找**一个反向时间过程（令 $\tau=T-t$，$\tau$ 从 $0$ 增加到 $T$ 时，$t$ 从 $T$ 减少到 $0$），它的边缘分布 $q(x,\tau):=p(x,T-\tau)$，**并且**这个反向过程本身也是一个扩散过程

$$
dX_\tau = \tilde f(X_\tau,\tau)\,d\tau + g(T-\tau)\,d\bar W_\tau
$$

（**关键假设/构造思路**：我们假设反向过程和正向过程有**相同的瞬时波动率** $g$——这是合理的，因为布朗运动的"局部粗糙程度"在时间反转下是对称的，唯一需要重新配平的是"净漂移方向"）。**目标是解出满足这个假设所需的 $\tilde f$**。

#### 11.2 推导：让两个 Fokker-Planck 方程"对齐"

**第一步**：对 $q(x,\tau)=p(x,T-\tau)$ 求 $\tau$ 偏导（链式法则，注意时间方向反了要加负号）：

$$
\partial_\tau q(x,\tau) = -\partial_t p(x,t)\Big|_{t=T-\tau} = \partial_x(fp) - \frac12g^2\partial_x^2p
$$

**第二步——恒等变形，为凑出"能重新表达为漂移项"的形式**。核心技巧：把二阶导数项拆开一半，用 $\partial_xp = p\,\partial_x\log p$ 这个恒等式改写：

$$
\partial_x^2(g^2p) = \partial_x\big[g^2\partial_xp\big] = \partial_x\big[g^2p\,\partial_x\log p\big]
$$

（这里默认 $g$ 不依赖 $x$，可以直接提出来）。所以原方程可以写成：

$$
\partial_\tau q = \partial_x(fq) - \frac12\partial_x\big[g^2q\,\partial_x\log q\big] \tag{★}
$$

**第三步——目标形式匹配**：我们希望（★）式最终能整理成标准 Fokker-Planck 形式 $\partial_\tau q = -\partial_x(\tilde fq)+\frac12g^2\partial_x^2q$（对应我们假设的反向 SDE）。把（★）式右边硬凑成这个形状：

$$
\partial_x(fq) - \frac12\partial_x[g^2q\partial_x\log q] = -\partial_x\Big\{-fq + \frac12g^2q\,\partial_x\log q\Big\}
$$

再和标准形式 $-\partial_x(\tilde f q)+\frac12\partial_x^2(g^2q)$ 比较，注意 $\frac12\partial_x^2(g^2q)=\frac12\partial_x[g^2q\partial_x\log q]$（上面用过的恒等式），代回标准形式：

$$
-\partial_x(\tilde f q) + \frac12\partial_x[g^2q\partial_x\log q]
$$

对比（★）式右边 $\partial_x(fq)-\frac12\partial_x[g^2q\partial_x\log q]$，要让两者相等（逐项匹配对流项部分）：

$$
-\tilde f q = -fq - \frac12g^2q\,\partial_x\log q - \frac12g^2q\,\partial_x\log q
$$

（把两处 $\frac12g^2q\partial_x\log q$ 合并，因为一处来自左边移项，一处是要凑出的扩散项贡献）整理得：

$$
\tilde f = f - g^2\,\partial_x\log q
$$

即（换回原始时间变量、把 $q(x,\tau)$ 换回 $p_t(x)$）：

$$
\boxed{\tilde f(x,t) = f(x,t) - g(t)^2\,\nabla_x\log p_t(x)}
$$

代回反向 SDE：

$$
\boxed{dX_t = \Big[f(X_t,t)-g(t)^2\nabla_x\log p_t(X_t)\Big]dt + g(t)\,d\bar W_t}
$$

这正是 Anderson (1982) 反向时间 SDE。

🔑 **人话**：**整个推导的思路是"假设反向过程也是同类型的扩散过程（相同噪声强度），然后要求它的 Fokker-Planck 方程和正向过程反着看必须完全吻合，代数上解出唯一满足条件的漂移修正量"。** 修正量恰好是 $-g^2\nabla\log p_t$——这个向量场叫**得分函数（score function）**，指向"概率密度增大最快的方向"。直觉上：正向过程往"熵增"方向（摊平概率）走，反向过程要往"熵减"方向（聚拢概率）走，而聚拢的方向正是密度梯度上升的方向，噪声越大（$g^2$越大）就需要越强的修正力度去把它拉回来。**这就是为什么 diffusion 模型训练的核心目标就是让神经网络学会预测 $\nabla_x\log p_t(x)$——只要学到它，就能把"加噪"完全倒放，从纯噪声一步步走回真实数据分布。**

#### 11.3 概率流 ODE（作为推导的自然副产品）

如果不假设反向过程"保留相同扩散强度"，而是要求它是**确定性**过程（无噪声项），只需让 Fokker-Planck 的扩散项被完全吸收进漂移项：直接用（★）式，两个 $\frac12g^2q\partial_x\log q$ 项只留一个（不是凑成标准FP形式，而是直接凑成纯对流形式 $\partial_\tau q=-\partial_x(\hat fq)$）：

$$
\hat f = f - \frac12g^2\nabla_x\log p_t
$$

$$
\boxed{\frac{dX_t}{dt} = f(X_t,t) - \frac12g(t)^2\nabla_x\log p_t(X_t)}
$$

🔑 **人话**：这是一个**没有随机项的常微分方程**，但它的解在每个时刻 $t$ 的分布，和原来的随机过程 $X_t$ 完全一致（只是每条轨迹不再随机抖动，而是沿着一条"平均流线"确定性地走）。修正系数是 $\frac12g^2$（一半），而不是反向SDE里的整个 $g^2$——差的这一半正是"噪声项自己贡献的那部分扩散"，被吸收进确定性的漂移里了。这就是 DDIM、概率流采样比 DDPM 随机采样更"平滑"、可逆、适合用高阶ODE求解器加速的数学原因。

---

### 第 12 部分：数值方法——离散化误差怎么来的

#### 12.1 Euler-Maruyama 格式

$$
X_{n+1} = X_n + \mu(X_n,t_n)\Delta t + \sigma(X_n,t_n)\Delta W_n,\qquad \Delta W_n\sim\mathcal N(0,\Delta t)
$$

**收敛阶**：可以证明**强收敛阶为 $1/2$**（$\mathbb E|X_T-X_T^{(n)}|=O(\sqrt{\Delta t})$），**弱收敛阶为 $1$**（$|\mathbb E[\phi(X_T)]-\mathbb E[\phi(X_T^{(n)})]|=O(\Delta t)$）。

🔑 **人话——为什么强收敛阶只有 1/2，比普通 ODE 的欧拉法（阶为1）差**：因为 Itô 公式告诉我们，函数值的变化里包含 $\frac12\sigma^2 f_{xx}\Delta t$ 这一项，Euler-Maruyama 格式**没有显式包含这一项的精确信息**——它虽然量级是 $O(\Delta t)$，但这一项实际上是通过 $(\Delta W)^2$ 波动"隐式"产生的，而 $(\Delta W)^2$ 本身在单步来看有 $O(\Delta t)$ 量级的随机涨落（不是精确等于 $\Delta t$，只是均值是 $\Delta t$），这个涨落的标准差是 $O(\Delta t)$，但相对于步长本身是 $O(\Delta t^{1/2})$ 量级的"额外误差"，累积起来就拖累了强收敛阶。

#### 12.2 Milstein 格式（把二阶修正项精确加进去）

$$
X_{n+1} = X_n+\mu\Delta t+\sigma\Delta W_n + \frac12\sigma\sigma'(X_n)\left[(\Delta W_n)^2-\Delta t\right]
$$

🔑 **人话**：Milstein 格式的动机直接来自 Itô 公式——把 $\sigma(X_t)$ 自己也用 Itô 公式再展开一次（$\sigma$ 关于 $X$ 求导），显式地把 $(\Delta W)^2-\Delta t$ 这个"随机涨落项"精确纳入格式，而不是像 Euler-Maruyama 那样把它当作二阶小量丢弃。这样强收敛阶提升到 1。**在金融蒙特卡洛模拟里，如果需要精确路径依赖型定价（比如亚式期权），通常用 Milstein 或更高阶格式；如果只关心终值分布（欧式期权定价），Euler-Maruyama 的弱收敛阶已经够用。**

---

### 全局总结表（这次每一句话都对应一个严格推导，不是空泛断言）

| 概念 | 精确定义/结论 | 推导核心技巧 | 一句话直觉 |
|---|---|---|---|
| 二次变差 | $[W,W]_t=t$ | 均值方差计算+Chebyshev | 抖动剧烈到二阶不可忽略 |
| Itô积分 | 简单过程逼近+L²极限 | Itô等距控制收敛 | 用今天的信息决定仓位，随机积分是鞅 |
| Itô公式 | $df=(f_t+\mu f_x+\frac12\sigma^2f_{xx})dt+\sigma f_xdW$ | 泰勒展开+$(dW)^2=dt$ | 链式法则+凸性修正项 |
| SDE适定性 | Lipschitz+线性增长 | 压缩映射（Picard迭代思想） | 保证解存在唯一不爆炸 |
| 鞅表示定理 | 鞅=对dW的随机积分 | （非本文推导范围） | 布朗运动是唯一随机性来源，可对冲 |
| Girsanov | 换测度消去drift | 构造指数鞅+Lévy刻画定理 | 无套利定价不依赖真实收益率 |
| Feynman-Kac | PDE解=SDE路径期望 | 构造鞅（drift被PDE抵消） | 定价PDE⇔蒙特卡洛模拟 |
| Fokker-Planck | 密度演化的PDE | 弱形式+分部积分+测试函数任意性 | 概率被对流+扩散 |
| 反向SDE | drift减去$g^2\nabla\log p_t$ | 匹配正反Fokker-Planck方程 | 学会得分函数即可把加噪倒放 |
| 概率流ODE | drift减去$\frac12g^2\nabla\log p_t$ | 同上，但吸收全部扩散进漂移 | 同分布的确定性轨迹 |
