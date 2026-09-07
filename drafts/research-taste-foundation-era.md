# 一、旧假设 vs 新现实

深度学习时代的分析范式通常隐含以下假设，而大模型时代的现实已经改变：

| 旧假设 | 大模型时代的现实 |
| :--- | :--- |
| 训练集已知或可构造 | 预训练语料、数据配比通常不可见 |
| 测试集独立于训练集 | benchmark 广泛存在于互联网和合成数据中 |
| 模型是固定函数 | 行为依赖 prompt、system message、采样、工具和记忆 |
| 每题推理成本固定 | test-time compute 可以变化几个数量级 |
| 输出由客观指标评价 | 越来越多输出由另一个 LLM 评价 |
| 人类反馈代表单一目标 | 偏好具有文化、个体和情境异质性 |
| 微调只增加能力 | 微调可能破坏安全、知识和原有行为 |
| 神经元/注意力头是自然分析单位 | 大模型存在 superposition，功能分布在稀疏特征和电路中 |
| 推理是单次前向过程 | agent、自反思、自训练形成反馈闭环 |
| 模型规模是主要自变量 | 数据、后训练、推理预算、verifier 同样决定能力 |

现在研究的不再是一个固定的 $f_\theta(x)$，而是一个有隐藏变量、有反馈、有策略互动、推理时计算可变的闭环系统：

**训练数据 → 基础模型 → 后训练 → 提示/工具/搜索 → 生成轨迹 → LLM Judge/人类反馈 → 合成数据 → 下一代模型**

新时代分析论文真正要解决的，是六类识别问题：我们观察到的是能力还是训练暴露？是基础模型更强还是获得了更多推理预算？是模型真的更好还是成功欺骗了评测器？是安全能力被真正改变还是只改变了开头几个 token？是模型产生了新信息还是从已有分布中进行了更强搜索？内部表示只是"包含信息"还是因果性地使用了信息？

# 二、重定义"有趣"：新增三个量

大模型时代只用"惊讶 × 重要性"还不够，因为很多现象的半衰期只有三个月。更合理的定义是：

$$I = \frac{ \text{可信信息增益} \times \text{结构中心性} \times \text{跨模型半衰期} \times \text{可干预性} \times \text{资产复用性} }{ \text{对特定模型和 prompt 的依赖} }$$

**结构中心性**：结论是否关于大模型系统的结构，而不是某个模型的偶然行为？"GPT-X 在某个 prompt 下会改变答案"——低结构性；"LLM judge 存在可被与问题无关的常量答案利用的攻击面"——高结构性。

**跨模型半衰期**：短半衰期论文通常研究某个 prompt 技巧、某个闭源版本的排行榜、一个具体越狱字符串、单个模型的某个神经元。长半衰期论文通常研究生成器与验证器的不对称、benchmark 与训练分布的内生关系、评测器的 Goodhart 攻击面、test-time compute 的资源分配、自训练闭环的覆盖率与稳定性、数据/表示/输出之间的因果链。

**资产复用性**：论文是否留下了下一篇可以直接复用的黑盒审计统计量、计算归一化协议、judge 攻击与校准工具、训练动态记录框架、稀疏特征字典、因果干预库、自改进稳定性理论。新时代真正的 edge 不是"比别人早两周测了新模型"，而是新模型发布后，你已经有一套别人没有的仪器。

# 三、十条范本拆解

## 1. Proving Test Set Contamination in Black-Box Language Models（ICLR 2024 Oral）

大家都怀疑闭源模型见过 benchmark，但看不到训练数据、看不到权重，仅仅答对题目不能证明污染。作者使用了一个漂亮的黑盒 side channel——样本的规范顺序。在无污染假设下，如果 benchmark 样本是可交换的，不同排列应当具有相同地位。于是可以比较：

$$T = \log P_\theta(D_{\text{canonical}}) - \log P_\theta(D_{\text{permuted}})$$

再通过随机置换构造具有精确假阳性保证的检验。惊讶点不是"模型可能污染"，而是不需要训练集和权重，也能利用顺序记忆对污染进行有统计保证的黑盒证明。它开启了一条"黑盒模型审计"研究线。

## 2. Training on the Test Task Confounds Evaluation and Emergence（ICLR 2025 Oral）

作者区分了三种概念：training on test data（直接训练测试样本）、contamination（训练数据泄漏 benchmark）、training on the test task（合法加入与目标任务高度相关的数据）。第三种不是违规，但同样会混淆比较——两个模型都没见过 MMLU 测试题，但其中一个在预训练中大量学习了 MMLU 式多选题。它揭示了比普通污染更难处理的问题：即使所有研究者都遵守规则，benchmark 仍可能失去模型比较和能力归因的效度。

## 3. Cheating Automatic LLM Benchmarks: Null Models Achieve High Win Rates（ICLR 2025 Oral）

作者构造了一个 null model：无论用户问什么，都输出同一个与问题无关的常量答案。按定义它没有任何 instruction-following 能力，但通过专门构造输出，它能在 AlpacaEval 2.0 拿到 86.5% length-controlled win rate、Arena-Hard-Auto 83.0、MT-Bench 9.55。这是新时代最强的一类负对照——如果理论上没有目标能力的模型仍然得高分，评测效度就被直接击穿，不需要争论具体模型是否"其实部分理解了任务"。它展示的是 construct validity 的灾难性失败。

## 4. Scaling LLM Test-Time Compute Optimally Can Be More Effective than Scaling Parameters（ICLR 2025 Oral）

以前能力通常写成 Performance = f(parameters, pretraining compute)，但推理模型时代能力还取决于采样多少条解、搜索深度、verifier 质量、是否允许回溯、是否根据题目难度动态分配计算。关键发现是：不同扩展策略的效率高度依赖题目难度，最优策略不是对所有题目统一 best-of-N，而是学习难度条件下的资源分配：

$$c^*(x) = \arg\max_c \frac{\mathbb{E}[\text{utility} \mid x, c]}{\text{FLOPs}(c)}$$

compute-optimal 分配比 best-of-N 提高了超过 4 倍的推理计算效率；在特定条件下，小模型通过推理时计算能够超过参数量大 14 倍的模型。真正的认知更新是：模型能力不是一个常数，而是一条由题目难度、生成器、验证器和推理预算共同决定的资源—性能曲面。

## 5. Safety Alignment Should Be Made More Than Just a Few Tokens Deep（ICLR 2025 Oral）

当前安全训练可能主要改变模型输出最开始几个 token 的分布。通过后缀攻击、assistant prefilling、改变解码参数、少量微调绕过开头拒绝 token，原有有害生成分布可能重新暴露。论文用"安全深度"统一解释多类此前看似分散的攻击：

$$D_t = D_{\text{KL}} \left( P_{\text{aligned}}(y_t \mid y_{<t}, x) \,\middle\|\, P_{\text{base}}(y_t \mid y_{<t}, x) \right)$$

如果 $D_t$ 只在最前几个 token 很大、随后迅速衰减，就形成 shallow alignment。这就是高质量分析论文的压缩性：一个机制统一多个攻击面。

## 6. Self-Improvement in Language Models: The Sharpening Mechanism（ICLR 2025 Oral）

如果模型没有外部信息，它如何通过自己的输出训练自己获得新能力？作者指出，自我改进不一定创造新知识，它可能把模型已有分布中的低概率正确答案集中到更高概率区域：$\pi_0(y \mid x) \longrightarrow \pi_{\text{sharp}}(y \mid x)$。关键不对称是——验证正确答案，可能比直接生成正确答案更容易。真正值得分析的是闭环：Generator → Candidate set → Verifier → Selection → Training → New generator。核心变量包括初始 coverage、verifier—generator gap、on-policy/off-policy、搜索多样性、reward hacking、错误自强化、固定点与坍缩。

## 7. Sparse Feature Circuits（ICLR 2025 Oral）

以 attention head 或单神经元作为基本单位有两个问题：单元往往 polysemantic，真正功能可能分布在许多神经元上。论文将稀疏特征作为分析单位，并寻找对行为具有因果作用的特征子网络：从激活中学习稀疏特征 → 将模型行为分解到特征层 → 估计特征之间的因果连接 → 得到 sparse feature circuit → 对特征进行消融或编辑 → 检查目标行为是否按预测变化。它从"模型在哪里储存信息？"转向"哪些可解释特征在因果上共同实现了这个行为，并且能否通过编辑改变行为？"这是"可读出"到"实际使用"的升级。

## 8. Roll the Dice & Look Before You Leap（ICML 2025 Outstanding）

next-token prediction 适合流畅续写，但开放式创造任务需要先进行远距离规划、探索多个全局结构、引入随机性但保持整体一致。论文没有直接用"写诗是否有创造力"这种不可识别任务，而是构造最小算法任务——在抽象知识图上发现新连接、构造新的组合和模式，并对新颖性、多样性、正确性进行精确测量。结果表明多 token 方法在这些开放任务上更擅长产生多样且原创的结构；输入端注入随机 seed 可以在保持一致性的同时产生变化。这是新时代 synthetic science 的正确用法：合成任务不是为了展示玩具现象，而是隔离真实系统中不可识别的结构变量。

## 9. Train for the Worst, Plan for the Best（ICML 2025 Outstanding）

Masked diffusion language model 理论上可以任意顺序填充 token，但性能经常落后于左到右自回归模型。作者发现主要困难来自训练与推断不对称：训练时要覆盖指数级的 mask 子问题，但推理时并不需要按照最差顺序解 mask。一个简单策略是优先解开模型最有把握的位置：

$$i_t = \arg\max_{i \in M_t} \max_v P_\theta(x_i = v \mid x_{\setminus M_t})$$

仅改变 token ordering，就让 Sudoku 准确率从约 7% 提升到接近 90%。失败的可能不是模型，而是读取模型的策略——训练必须面对最坏的 mask 组合，但推理可以主动规划最有信息的生成顺序。

## 10. PRISM Alignment Dataset（NeurIPS 2024 Outstanding）

RLHF 通常把人类偏好压缩成一个标量 reward $r(x, y)$，隐含假设存在大致统一的"人类偏好"。PRISM 收集 75 个国家的 1500 名参与者、与 21 个 LLM 进行的 8011 次真实对话，关键不是数据量，而是把反馈与"谁在什么情境下表达什么偏好"连接起来：$r(x, y, u, c)$，其中 $u$ 是用户，$c$ 是文化与情境。Alignment 不是寻找唯一的"正确 reward"，而可能是偏好分布建模、个性化、群体公平、冲突偏好协商、明确由谁决定规范目标。这是改变问题本体的论文，而不是把现有 reward model 做得更准。

# 四、新时代的技术栈

1. **黑盒统计识别**：模型不可见时，不再执着于内部消融，而是寻找可观测 side channel——顺序似然、token log-probability、输出协方差、API 精度、时间和版本差异、交换性、重复查询稳定性。
2. **计算量归一化**：新时代比较必须至少控制（预训练计算、后训练计算、推理计算、外部工具计算），参数量不再是能力的充分代理变量。
3. **评测器红队**：每个新 benchmark 都应先尝试 constant-output null model、长度攻击、风格攻击、身份泄露、位置交换、循环偏好、与问题无关但"像好答案"的元话语、judge 同源偏好、adversarial paraphrase。如果 null model 都能得高分，就没有必要继续比较真实模型。
4. **按 token、步骤和训练阶段分析动态**：聚合准确率太粗，应记录每个 token 上的 KL 变化、safety alignment depth、每个 training step 对不同回答的影响、reasoning trace 中的答案翻转、verifier 置信度、checkpoint 间能力出现和消失、知识源活跃程度、自训练轮次中的熵与多样性坍缩。
5. **从神经元转向特征和电路**：现代 mechanistic analysis 的基本路线是 Activation → Sparse feature → Circuit → Causal intervention → Behavioral prediction。attention map、线性 probe 和单神经元案例已经很难单独构成高等级贡献。
6. **闭环稳定性分析**：只分析一次生成不够，真正重要的是模型评价自己的输出、模型用自己的输出训练自己、agent 调用工具后继续更新计划、synthetic data 回流到下一代模型、judge 与生成器共同演化。要研究的是覆盖率、固定点、错误放大、奖励投机和分布坍缩。

# 五、如何自上而下产生新时代课题

新的母结构应当是一张闭环图：

**D → M0 → A → π_infer → Y → J → D_synthetic → M1**

其中 D 是预训练数据，M0 是基础模型，A 是 alignment/post-training，π_infer 是搜索/采样/工具策略，Y 是生成结果和轨迹，J 是人类或模型评测器，D_synthetic 是合成训练数据，M1 是下一轮模型。对每一条边应用六种新时代算子：

- **隐变量算子**：观察到的提升是否其实来自 task exposure、数据污染、推理预算、verifier、prompt 搜索、输出长度、后训练配方？
- **非对称算子**：寻找两种能力之间的不对称——生成 vs 验证、记忆内容 vs 记忆顺序、开头安全 vs 全轨迹安全、左到右生成 vs 任意顺序生成、模型包含信息 vs 模型使用信息。
- **反馈算子**：如果过程重复十轮会怎样？self-training 是否收敛？错误是否放大？多样性是否坍缩？reward hacking 是否增强？judge 与生成器是否共同偏移？
- **博弈算子**：一旦某指标被优化，它还有效吗？让被评模型知道 judge 是谁、评价 prompt、排行榜规则、长度控制方式，然后研究最优投机策略。
- **资源算子**：把性能从单点改成曲面 $P = f(\text{model size}, \text{data}, \text{test-time tokens}, \text{samples}, \text{search depth}, \text{verifier})$，寻找最优资源边界。
- **跨代预测算子**：在下一代模型发布前写下预测——现象会随规模增强还是减弱？哪个机制会消失？哪种攻击仍然有效？哪条 scaling curve 会移动？能预测尚未发布模型的分析，才真正具备长半衰期。

# 六、三条最容易形成复利的研究主线

- **方向 A：大模型评测认识论**——污染检测 → task exposure 校正 → judge 攻击 → judge 校准 → 动态 benchmark → 排行榜稳定性理论。长期资产是 data lineage、黑盒审计、adversarial null 库、多 judge 评测系统、人类校准集、前瞻性测试集。
- **方向 B：推理和自改进动力学**——生成—验证不对称 → test-time search → 计算最优分配 → 搜索结果蒸馏 → self-training → 稳定性与坍缩。这条线能覆盖 reasoning model、agent、verifier、RL 和合成数据，不依赖某个具体模型。
- **方向 C：后训练如何重写内部机制**——行为变化 → 逐 token 动态 → 稀疏特征 → 因果电路 → 安全/知识编辑 → 持续微调稳定性。它比"找到一个拒绝神经元"有更强复利，因为技术资产是特征字典、干预方法和跨 checkpoint 追踪工具。

# 七、一个更适合新时代的选题评分表

每个候选课题按 0—5 分评估：

| 维度 | 核心问题 |
| :--- | :--- |
| **结构性** | 换下一代模型后问题还存在吗？ |
| **识别性** | 能区分能力、数据、计算和评测混杂吗？ |
| **对抗性** | 被研究系统主动优化指标后，结论还成立吗？ |
| **动态性** | 是否研究了 token、训练或闭环轨迹？ |
| **因果性** | 是否能干预机制并得到方向性预测？ |
| **跨代预测** | 能否预测尚未测试的模型或设置？ |
| **复用性** | 会留下什么仪器或数据资产？ |
| **双向价值** | 相反实验结果是否同样有价值？ |

其中"结构性、识别性、复用性"任何一项低于 3，都不适合成为长期主线。

# 结论

会迅速过时的是研究对象和实验协议；不应丢弃的是反事实、负对照、可证伪性和因果识别；新时代的关键，是把这些原则应用于一个完全不同的系统边界。现在最有价值的分析论文，不再主要问"模型学到了什么现象？"，而是问：在训练数据不可见、推理计算可变、评测器可被博弈、模型能够自我生成训练数据的闭环里，我们究竟能识别什么？哪些结构规律能跨越下一代模型？真正能够形成 edge 的，是围绕黑盒可识别性、训练暴露、生成—验证不对称、计算资源分配、judge 博弈、自改进稳定性、稀疏特征因果电路、多元人类偏好这些稳定对象积累——这些问题即使模型范式再次变化，也不会立刻归零。
