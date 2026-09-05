---
title: "CVPR 十年谈"
date: 2026-05-28
category: "领域综述"
tags:
  - "CVPR"
  - "计算机视觉"
  - "领域综述"
description: "2. “One Transformer to Rule them All”——一个模型通过Prompt处理分类、检测、分割。 3. Zero-shot（零样本）成为论文标配，强调不针对特定任务微调的泛化性。"
---
整理自视频 https://www.bilibili.com/video/BV15yGC6LEVw/?spm_id_from=333.337.search-card.all.click
# CVPR 十年谈

### 2016年：深度学习的“横扫千军”时代
#### 1. 重大变化：技术飞跃
- **深度的极致突破**：ResNet引入残差连接，解决了梯度消失问题，使CNN层数从20层跃升至1000+层。
- **检测范式重构**：YOLO横空出世，将物体检测视为单一回归问题，开启实时检测新纪元。
- **跨模态交织**：VQA（视觉问答）让机器从“识别图像”迈向“理解图像”，尝试回答与图像相关的问题。

#### 2. 核心研究模式：Deep-Everything模式
- **模式定义**：学术界的“统一套路”——选取一个传统视觉子问题（如去噪、光流），用深层CNN重新实现一遍。
- 表现：
  - 底层/中层视觉任务（去噪、超分、边缘检测、光流）全部“Deep化”。
  - 论文标题大量出现“Learning to [X]”或“Deep [X]”格式。
  - 研究者通过实验证明深度学习在各垂直领域性能远超传统数学优化方法。

#### 3. 题目特点与命名流行语
- **题目特点**：高频使用侵略性动词（`Rethinking`/`Revisiting`/`Solving`/`Mastering`），展现“用神经网络推翻旧方法”的趋势。
- **流行语（Buzzwords）**：
  - `XX-Net`：网络命名的黄金时代（如ResNet、DenseNet雏形）。
  - `Residual`：残差连接成为全场热点。
  - `End-to-end`：强调流程极简，无需分阶段处理。
  - `Unified`：用单一网络取代复杂流水线的趋势。


### 2017年：爆发期（Explosion Phase）
#### 1. 范式地位
- **生成式AI元年**：GAN家族集体亮相，图像翻译（Image-to-Image Translation）技术落地。
- **3D深度学习开端**：研究者从2D像素转向3D点云，直接在点云上进行特征提取。
- **认知升级**：从“识图”转向“理解逻辑”，Visual Dialog、复杂推理（Reasoning）任务开始出现。
- **核心坐标**：视觉研究从“被动识别”迈向“主动创造”，GAN与PointNet定义了当年的研究基调。

#### 2. 重大变化：技术飞跃
- **对抗训练普及**：条件GAN（cGAN）实现生成内容的精确控制，不再局限于模糊人脸生成。
- **3D表征变革**：PointNet证明无需体素化/投影，直接处理原始乱序点云是可行的。
- **算力与效率博弈**：DenseNet、Xception提出极致特征重用与参数优化，在更少参数量下实现更优性能。

#### 3. 核心研究模式：GAN/Point-Everything模式
- **模式定义**：“万物皆可GAN（生成增强），万物皆可点云化（3D升级）”。
- 表现：
  - 识别任务遇瓶颈时，加入GAN做数据增强或风格迁移。
  - 将2D成熟任务（分割、识别）迁移到3D点云上重新实现。
  - 追求更细粒度描述（如`Image Paragraph`取代单句图像描述）。

#### 4. “网红”论文
- **效率之王：DenseNet**（《Densely Connected Convolutional Networks》）
  - 亮点：获CVPR最佳论文，提出“层与所有后续层相连”的密集连接模式，极致重用特征。
  - 影响：以更少参数量超越ResNet性能，成为轻量化与效率研究的标杆。
- **3D拓荒者：PointNet**（《PointNet: Deep Learning on Point Sets for 3D Classification and Segmentation》）
  - 亮点：解决点云无序性问题（通过Max Pooling对称函数），开启3D视觉研究新纪元。
  - 影响：后续3D视觉论文几乎均引用此工作，成为领域基石。
- **万能翻译：Pix2Pix**（《Image-to-Image Translation with Conditional Adversarial Networks》）
  - 亮点：提出通用图像翻译框架，将图像处理任务统一建模为“图像到图像的翻译”。
  - 影响：开源Demo引发刷屏，首次展现GAN近乎“魔法”的实用价值。

#### 5. 题目特点与流行语
- **题目特点**：标题带上明显“视觉感”（如`Looking into...`/`Watching move...`），`In-the-wild`（非受控环境）相关标题显著增多。
- **流行语（Buzzwords）**：
  - `X-GAN`：Pix2Pix、CycleGAN等生成模型爆发。
  - `Point`：PointNet、Point Set等3D相关术语高频出现。
  - `Adversarial`：对抗训练成为提升性能的“万金油”。
  - `Reasoning`：标志着从感知到认知的跨越。

#### 6. 年度总结
> “如果说2016是让机器看清世界，2017则是教机器如何想象世界。”


### 2018年：实战期（Practical Phase）
#### 1. 范式地位
- **移动端爆发**：MobileNetV2定型，开启“视觉算法进手机”的黄金时代。
- **跨领域思考**：从单任务研究转向探索不同视觉任务的关联（如`Taskonomy`）。
- **结构即先验**：发现网络结构本身具备强图像处理能力，并非仅依赖大数据训练。
- **核心坐标**：深度学习从“实验室奇迹”转向“端侧部署”与“底层机理探索”。

#### 2. 重大变化：技术飞跃
- **端侧算力革命**：MobileNetV2的倒残差结构大幅提升端侧推理精度与速度。
- **长程依赖建模**：Non-local模块打破CNN卷积核的局部感知限制，成为视觉Attention的里程碑。
- **对抗防御正式化**：系统性研究模型在现实攻击下的鲁棒性，应对多样化攻击手段。

#### 3. 核心研究模式：Efficient-Everything模式
- **模式定义**：“实战化套路”——在不损失精度的前提下，对成熟算法（分类、检测、分割）进行轻量化、紧凑化改造。
- 表现：
  - 神经网络剪枝（Pruning）、量化（Quantization）、架构优化成为研究热点。
  - `Disentanglement`（特征解耦）成为高频词，尝试分离物体的形状、颜色、背景等属性。
  - `Embodied AI`出现，视觉研究开始关注机器人在虚拟3D环境中的交互。

#### 4. 题目特点与流行语
- **题目特点**：标题变得冗长且学术化，充满数学限定词（`Coupled`/`Jointly`/`Constrained`），强调无监督/弱监督（`Unsupervised`/`Weakly`）。
- **流行语（Buzzwords）**：
  - `Efficient`：模型落地与效率优化成为核心需求。
  - `Disentangled`：特征解耦研究兴起。
  - `Non-local`：长程依赖建模的代表术语。
  - `In-the-wild`：强调复杂现实场景的鲁棒性。

#### 5. 年度总结
> “不仅要准，还要快，还要懂不同视觉任务之间的血缘支持。”


### 2019年：工业化转型期（Automation Phase）
#### 1. 范式地位
- **架构自动化**：神经架构搜索（NAS）从理论走向实用，人类手动调参的时代逐渐落幕。
- **分割大一统**：全景分割（Panoptic Segmentation）打破“物体（Things）”与“背景（Stuff）”的界限，实现场景的完整解析。
- **检测效率战**：`Anchor-free`（无锚框）设计流行，目标检测模型更简洁高效。
- **核心坐标**：视觉研究从“手动设计网络”跨越到“机器自动发现最优架构”与“复杂场景全景解析”。

#### 2. 重大变化
- **技术飞跃**：
  - NAS爆发：MnasNet、FBNet、Auto-DeepLab等工作证明，机器搜索的移动端模型既快又准。
  - 图神经网络（GCN）入场：用图结构建模视频、姿态、物体间的逻辑关系，引入常识推理。
  - 3D隐式表示萌芽：DeepSDF开启用连续数学函数描述3D形状的新范式，替代传统点云/体素表示。
- **应用与数据演进**：
  - 照片级图像编辑：GauGAN (SPADE)实现“涂鸦生成真实景观照片”的效果。
  - 全景解析：全景分割要求模型同时完成目标检测（计数）与语义分割（分类别），打破任务碎片化。
  - 长尾分布关注：算法在均衡数据集上性能趋顶，研究者开始关注“少见样本”识别（Long-tailed Recognition）。

#### 3. 核心研究模式：Auto/Graph-Everything模式
- **模式定义**：“工业化套路”——万物皆可NAS（自动优化），万物皆可构建关联图（逻辑推理）。
- 表现：
  - 手动设计模型性能遇瓶颈时，用NAS定义搜索空间刷出新SOTA。
  - 将VQA、Scene Graph等视觉问题转化为图节点特征传递问题，利用GCN引入常识推理。
  - `Anchor-free`成为检测器新时尚（如FSAF、CenterNet等）。


### 2021年：范式革命期（Paradigm Shift）
#### 1. 范式地位
- **架构大地震**：Vision Transformer (ViT)的成功让CNN第一次感受到了统治地位的威胁。
- **3D重构升维**：NeRF从静态物体扩展到动态场景（D-NeRF）和泛化表示（pixelNeRF），彻底重塑3D视觉。
- **核心坐标**：视觉研究进入了“全局注意力（Attention）”与“神经渲染（Neural Rendering）”双轮驱动的新纪元。

#### 2. 重大变化：技术飞跃
- **Transformer全面入侵**：从检测（Transformer Tracking）到分割（MaX-DeepLab），Attention机制无处不在。
- **神经辐射场（NeRF）宇宙**：解决了NeRF无法处理动态物体、需要长时间优化、无法跨场景泛化等核心痛点。
- **多模态对齐**：受CLIP影响，视觉任务开始深度绑定语言语义，开启了“图文大模型”的前哨战。

#### 3. 核心研究模式：Former/Radiance-Everything模式
- **模式定义**：“降维打击套路”——用Transformer替换CNN骨干，用辐射场替换几何网格。
- 表现：
  - 几乎每一个CV子领域的SOTA，都在题目里加上了“Transformer”。
  - 3D重建题目从“Point/Mesh”转向“Neural Fields/Implicit Representation”。

#### 4. 题目特点与命名流行语
- **题目特点**：题目后缀疯狂“内卷”，不再满足于单任务，大量出现多合一任务（如`Jointly Demosaicing and Denoising`）；“Back to...”风格开始流行，反映对基础问题的重新审视。
- **流行语（Buzzwords）**：
  - `-Former`：ViT、Swin、Trans-等Transformer变体。
  - `Radiance Fields`：NeRF及其变体。
  - `Implicit`：继续统治3D表达。

#### 5. 年度总结词
> “Transformer不再只学说话，更要学会看画；像素不再是方块，而是连续的辐射场。”

---

### 2022年：演进与缩放期（Scaling Phase）
#### 1. 范式地位
- **预训练大一统**：MAE证明了“掩码学习”在视觉上的恐怖威力，成为自监督学习的新标准。
- **开放词汇（Open-Vocabulary）**：视觉识别打破了固定类别的限制，开始追求“识万物”的通用性。
- **扩散模型初露锋芒**：Diffusion开始挑战GAN在图像生成领域的地位，AIGC的地基在这一年夯实。
- **核心坐标**：视觉研究从“训练专用模型”转向“适配基础模型（Foundation Models）”并解决3D渲染的边界问题。

#### 2. 重大变化：技术飞跃
- **掩码图像建模（MIM）**：以MAE为核心，通过“遮住像素猜颜色”让视觉模型在无标签数据上学到了极其深刻的特征。
- **NeRF的实战化**：`Mip-NeRF 360`解决了无限场景的伪影问题，使得神经渲染可以走出实验室，还原真实的街道。
- **架构大辩论**：`ConvNeXt`通过吸收Transformer的优点改造CNN，证明了卷积架构在2020s依然可以反击。

#### 3. 应用转型与数据演进
- **应用：文本驱动编辑**：受CLIP启发，大量任务开始以文本作为Prompt驱动，如文字改图、文字控制3D人脸生成。
- **任务：开放世界挑战**：不再局限于COCO的80类，研究者开始卷`Open-Vocabulary`检测与分割。
- **数据：全方位数字人**：针对人体、衣服、姿态的精细化建模（如`SMPL-A`、`Clothe and Pose`）为元宇宙化身提供了技术底座。

#### 4. “网红”文章
##### 自监督新霸主：MAE
- 论文：《Masked Autoencoders Are Scalable Vision Learners》
- 亮点：何恺明团队神作，视觉领域的“BERT”时刻。
- 核心创新：遮住图像75%的像素，只靠剩下的25%还原全图。
- 地位：简洁、优雅、暴力且有效，彻底统一了计算机视觉的自监督预训练路径。

##### CNN的反击：ConvNeXt
- 论文：《A ConvNet for the 2020s》
- 亮点：在Transformer统治会场的时刻，为CNN拥趸挽回了尊严。
- 创新点：纯卷积网络，但借鉴了Transformer的宏观设计（大卷积核、LayerNorm等）。
- 意义：证明了架构的优越性可能来自于设计哲学，而非仅仅是注意力机制。

##### 生成新纪元：LDM
- 论文：《High-Resolution Image Synthesis with Latent Diffusion Models》
- 亮点：后来席卷全球的Stable Diffusion的底层核心论文。
- 技术意义：在潜空间（Latent Space）运行扩散过程，极大降低了计算成本，实现了高清图像生成的平民化。
- 地位：标志着GAN时代的正式终结和Diffusion时代的全面到来。

#### 5. 题目特点与命名流行语
- **题目特点**：大量出现“Text-driven”和“Language-guided”；“Unified”（统一）和“Generic”（通用）成为标题中的高频追求。
- **流行语（Buzzwords）**：
  - `Masked`：MAE带来的绝对潮流。
  - `Open-Vocabulary`：打破类别界限。
  - `Prompt`：NLP术语的视觉化渗透。
  - `Mip-NeRF`：3D渲染的实战代名词。

---
### 2023年：生成元年与通用智能期（AIGC Foundation Era）
#### 1. 范式地位
- **生成范式彻底转移**：扩散模型（Diffusion）全面接管生成任务，不仅是2D图像，更延伸至视频和3D。
- **视觉大模型（Foundation Models）**：以SAM为代表的模型证明了视觉领域也可以拥有像GPT一样的“通用底座”。
- **开放世界能力**：研究重点从“闭集识别”彻底转向“开放词汇（Open-Vocabulary）”，机器开始理解人类的自然语言指令。
- **核心坐标**：视觉研究从“分类与回归”的传统逻辑，跨越到了“理解指令并精准创作”的智能体逻辑。

#### 2. 重大变化
##### 技术飞跃
- **扩散模型（Diffusion）的统治**：从ControlNet的可控生成到DreamBooth的个性化定制，生成质量与操控性达到平衡点。
- **多模态深度融合**：视觉大模型（VLM）开始具备逻辑推理能力，能回答“为什么”而不仅仅是“是什么”。
- **3D自动建模爆发**：利用扩散模型先验（Score Distillation）实现从“一句话生成一个精细3D模型”。

##### 应用转型与数据演进
- **应用：全民AIGC**：图像编辑进入“拖拽式”和“文字控制”时代（如`InstructPix2Pix`、`DragDiffusion`）。
- **任务：Segment Anything**：分割任务不再需要针对特定物体训练，只需点一下或说一句话，模型即可分割万物。
- **数据：互联网级预训练**：训练集从百万级跃升至十亿级（如LAION数据集的影响），数据质量与多样性成为核心。

#### 3. 核心研究模式：Diffusion/Foundation-Everything模式
- **模式定义**：“降维打击与通用化”：用扩散模型重做所有生成，用预训练大模型统一所有识别。
- 表现：
  1. 所有涉及“图”的输出（去噪、去雾、超分、编辑）全部被建模为去噪扩散过程。
  2. **“One Transformer to Rule them All”**——一个模型通过Prompt处理分类、检测、分割。
  3. **Zero-shot（零样本）**成为论文标配，强调不针对特定任务微调的泛化性。

#### 4. “网红”文章：分割一切 SAM
- 论文：《Segment Anything》（SAM）
- 为什么红：视觉界的“GPT 3.5”。虽然由Meta发布，但在CVPR期间引发了全会场的技术地震。
- 核心创新：提出了Promptable Segmentation任务，利用11亿张掩码进行预训练。
- 地位：彻底改变了分割领域。大家突然发现：不需要再训练自己的分割模型了，直接调SAM即可。

#### 5. 题目特点与命名流行语
- **题目特点**：充满“侵略性”与“终结感”，高频出现`Ruling, Unifying, Universal, Foundation`；此外，`...via Diffusion`和`Instruction-guided`成了新的万能后缀。
- **流行语（Buzzwords）**：
  - `Diffusion`：这一年生成领域的唯一答案。
  - `Open-Vocabulary`：走向开放世界的入场券。
  - `Any`：`Segment Anything, Generate Anything...`
  - `Prompt`：提示工程在视觉领域的胜利。

#### 6. 年度总结词
> “扩散模型全面接管创作，视觉底座模型统合感知。”

---
### 2024年：具身智能与大模型融合期（Agentic & Foundational Phase）
#### 1. 范式地位
- **3D表达的更替**：Gaussian Splatting (3DGS) 凭借实时渲染优势，正式终结了NeRF的“慢速”时代。
- **多模态大脑化**：视觉任务不再是孤立的分类/检测，而是被重构为受LLM驱动的“视觉对话”与“指令遵循”。
- **具身智能爆发**：计算机视觉与机器人学深度合流，研究重心全面转向能够在物理世界中感知、规划并行动的Agent。
- **核心坐标**：视觉研究从“感知世界”跨越到“模拟世界（世界模型）”并“操纵世界（具身智能）”。

#### 2. 重大变化：技术飞跃
- **3DGS宇宙爆发**：从静态场景扩展到动态4D（4D Gaussian Splatting）、人体化身以及SLAM。
- **Mamba (SSM) 架构兴起**：状态空间模型开始挑战Transformer在处理长序列（长视频）时的效率王座。
- **扩散先验的泛化**：扩散模型（Diffusion）被作为强大的几何和物理先验，用于解决深度估计、位姿估计和人体运动生成。

#### 3. 核心研究模式：Gaussian/Agent-Everything模式
- **模式定义**：“全能智能体与实时重构套路”：万物皆可高斯化（3DGS表达），所有任务皆可Agent化（通过对话和推理解决）。
- 表现：
  1. 每一个经典的3D任务（重建、编辑、跟踪）都在用高斯点重做一遍。
  2. 将视觉问题看作是MLLM的子任务，通过**In-Context Prompting**让模型通过几张例图学会新技能。
  3. 追求“一步到位”的推理（One-step）和“免训练”的适配（Training-free）。

#### 4. 题目特点与命名流行语
- **题目特点**：充满“对话感”与“动作性”，高频出现`Chatting, Instructing, Driving, Planning`；受SAM影响，`...Anything`后缀依然极为盛行。
- **流行语（Buzzwords）**：
  - `Splatting / GS`：3D领域的唯一真神。
  - `MLLM / LLaVA-based`：视觉大脑的代名词。
  - `Embodied / Agent`：赋予AI身体与灵魂。
  - `Instruct`：指令微调统治万物。

#### 5. 年度总结词
> “三维进入毫秒级渲染时代，视觉大脑进入具身推理时代。”

---
### 2025年：智能体与世界模型期（Agentic & World Model Phase）
#### 1. 范式地位
- **具身智能成熟**：视觉模型正式成为机器人的“大脑”，通过VLA（视觉-语言-动作）模型实现端到端的物理交互。
- **架构多元化**：Mamba (SSM) 架构在长序列任务上与Transformer正式并驾齐驱，视觉骨干网络迎来二次革新。
- **对齐与反思**：生成式AI的重心从“量产”转向“对齐（DPO）”与“幻觉治理”，追求更安全、更符合物理规律的生成。
- **核心坐标**：视觉研究从“在像素中寻找规律”跨越到“在仿真世界中推演物理”，Agent成为研究的核心单位。

#### 2. 重大变化：技术飞跃
- **3DGS的全能化**：Gaussian Splatting覆盖了从原子级（Microscopy）到城市级（Urban-GS）的全尺度建模，并实现了实时4D驱动。
- **视觉思维链（Visual CoT）**：效仿大语言模型的推理过程，视觉模型开始具备“分步思考”和“自我纠错”的能力。
- **状态空间模型（Mamba）爆发**：大量基于Mamba的变体（Vision Mamba, TPCN）在超长视频理解和点云处理中展现出线性复杂度的巨大优势。
- **视觉逻辑推理（Reasoning）**：标题中大量出现`CoT Reasoning, Agentic Search-Reasoning`，标志着CV正式引入LLM的推理范式。
- **物理规律仿真（Physics-Integrated）**：如`Physical Simulator In-the-Loop`，生成式AI开始学习重力、碰撞等真实的物理反馈。
- **机器脱敏（Machine Unlearning）**：随着版权意识增强，如何让模型“忘记”特定的敏感概念或数据成为硬核研究点。

#### 3. 核心研究模式：Agent/World-Everything模式
- **模式定义**：“具身演化与逻辑重构套路”：万物皆可智能体化（具有决策能力），所有场景皆可物理化（遵循物理规律）。
- 表现：
  1. 视觉任务不再是返回一个标签，而是返回一个动作序列或一段推理逻辑（Reasoning）。
  2. 3D重建题目从“渲染质量”转向“物理可交互性（Physically-grounded）”。
  3. **偏好优化（DPO/GRPO）**被引入每一类生成模型，确保AI输出不再反人性。

#### 4. 题目特点与命名流行语
- **题目特点**：极具“智能体属性”与“安全性思考”，高频出现`Reasoning, Hallucination, Unlearning, Agentic`；此外，`...meets Mamba`和`Preference Optimization`成为研究的高频标签。
- **流行语（Buzzwords）**：
  - `Agent / Agentic`：强调自主决策能力。
  - `Mamba / SSM`：视觉架构的新势力。
  - `DPO / GRPO`：视觉生成的价值观对齐。
  - `Hallucination`：针对大模型幻觉的狙击。

#### 5. 年度总结词
> “视觉不仅是窗口，更是大脑；3D不仅是图像，更是世界。”

---
### 2026年：智能体与具身决策期（Agentic & Embodied Phase）
#### 1. 范式地位
- **从看图像到控动作**：视觉模型正式从“离线感知器”进化为“实时行动者”。VLA（Vision-Language-Action）模型成为研究的绝对核心。
- **4D实时重构**：3D高斯泼溅（3DGS）全面转向4D（时空）演进，并开始具备物理属性感知。
- **推理式视觉**：多模态大模型不仅是看，更是在“思考”。CoT（思维链）推理在标题中大规模出现。
- **核心坐标**：视觉不再是孤立的传感器，而是具备物理常识、能理解人类复杂指令并执行任务的“数字大脑”。

---
### 2026年：智能体与具身决策期（Agentic & Embodied Phase）
#### 1. 范式地位
- **从看图像到控动作**：视觉模型正式从“离线感知器”进化为“实时行动者”。VLA（Vision-Language-Action）模型成为研究的绝对核心。
- **4D实时重构**：3D高斯泼溅（3DGS）全面转向4D（时空）演进，并开始具备物理属性感知。
- **推理式视觉**：多模态大模型不仅是看，更是在“思考”。CoT（思维链）推理在标题中大规模出现。
- **核心坐标**：视觉不再是孤立的传感器，而是具备物理常识、能理解人类复杂指令并执行任务的“数字大脑”。

#### 2. 核心研究模式：Agent-Everything模式
- **模式定义**：“具身演化套路”：视觉任务不再是孤立的。所有识别与生成，最终都要服务于智能体在4D环境中的交互与反馈。
- 表现：
  1.  出现大量 `Autonomous, Agentic, Decision-making` 等前缀，强调模型具有主观能动性。
  2.  3D重建题目从静态 `Static` 转向 `Articulation-Ready`（可动的/可操作的零部件建模）。
  3.  **偏好对齐（DPO）**成为视觉模型微调的标准手段，用于治理幻觉。

#### 3. 题目特点与命名流行语
- **题目特点**：
  - 后缀从 `Net` 转向了 `VLA, Agent, World Model`。
  - 充满了对“幻觉（Hallucination）”的治理。
  - 强调“Training-free”组合能力。
- **命名流行语（Buzzwords）**：
  - `VLA / Agentic`：具身智能的核心关键词。
  - `DPO / GRPO`：视觉生成的偏好对齐方法。
  - `CoT / ToT`：视觉推理的标志性术语。
  - `Gaussian Splashing`：3DGS的新变体与延伸。

#### 4. 年度总结词
> “视觉不再只是窗口，更是大脑；3D不再只是图像，更是可被操纵的世界。”

---
### 补充：CV与NLP的范式影响
CV的发展深受NLP领域的影响，很多研究范式直接源自NLP的演进，典型的“技术迁移”路径包括：
- **架构层面**：Transformer、Mamba等骨干模型从NLP迁移到视觉领域，成为视觉模型的主流架构。
- **预训练范式**：自监督对比学习、掩码建模（MAE）借鉴了NLP的BERT/GPT预训练思路，解决视觉领域的标签依赖问题。
- **对齐与推理**：提示工程（Prompt）、指令微调（Instruct Tuning）、思维链（CoT）、偏好优化（DPO/GRPO）等方法，均来自大语言模型的对齐与推理范式，被广泛应用于视觉大模型的优化中。
- **核心逻辑**：大量CV研究本质上是“将NLP的成熟技术迁移到视觉任务上”，形成跨领域的技术复用与范式革新。
