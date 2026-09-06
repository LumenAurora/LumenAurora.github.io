---
title: "电路分析入门：从先备知识到 Logit Lens 与激活修补"
date: 2026-08-28
category: "机制可解释性"
tags:
  - "可解释性"
  - "电路分析"
  - "Logit Lens"
  - "激活修补"
description: "电路分析是机制可解释性的核心工具箱。本篇先铺垫先备知识 —— Transformer 三件套、QK 与 OV 电路、什么是「电路」、叠加与多语义性、以及观察与干预的根本区别；再讲最朴素的透视镜 Logit Lens / Tuned Lens，以及电路分析的基石：激活修补（activation pat……"
---

# 电路分析入门：从先备知识到 Logit Lens 与激活修补

> 电路分析是机制可解释性的核心工具箱。本篇先铺垫先备知识 —— Transformer 三件套、QK 与 OV 电路、什么是「电路」、叠加与多语义性、以及观察与干预的根本区别；再讲最朴素的透视镜 Logit Lens / Tuned Lens，以及电路分析的基石：激活修补（activation patching）。

## 电路分析
机制可解释性（Mechanistic Interpretability）试图把神经网络当成一台可被逆向工程的机器，找出"哪些部件在协同完成哪个任务"——这就是**电路分析**。下面从最基础的概念开始，逐步把主流方法讲透，每种方法都给出动机、原理、伪代码和一个可上手的最小示例。

---

### 零、先备知识：为什么需要电路分析

#### 1. Transformer 的三件套

理解电路分析之前，必须先理解 Transformer 内部有什么"零件"。一个 decoder-only Transformer 由若干层堆叠而成，每层包含两个子模块：

- **残差流**：一条贯穿所有层的"信息高速公路"。每一层的输出都会"加上"到这条流里，信息逐层累积。可以把它想象成一个不断被修改的便签，每一层都在便签上添几笔。残差流的关键性质是**线性**——任何一层对残差流的贡献都是一个向量，可以相加。
- **注意力头**：负责"搬运"信息。每个头用查询和键决定"看哪里"，用值和输出决定"搬什么"。一个 12 层、每层 12 个头的模型有 144 个头。
- **MLP（多层感知机）**：负责"加工"信息，是非线性变换。它读取当前位置的残差流，做一次非线性变换，再写回流里。

#### 2. QK 电路与 OV 电路

每个注意力头的四个权重矩阵可以干净地分解成两个独立的"半电路"：

- **QK 电路**（$W_Q W_K^T$）：决定**注意什么**。它计算当前 token 的 query 与其他 token 的 key 的点积，得到注意力模式。
- **OV 电路**（$W_V W_O$）：决定**搬什么**。当注意力模式确定后，它决定把被注意 token 的什么信息写到输出。

这种分解让我们可以分别研究"头在看哪"和"头在做什么"。

#### 3. 什么是"电路"

一个**电路**就是模型计算图的一个子图：节点是组件（注意力头、MLP、神经元、SAE 特征等），边是它们之间的因果影响通路。电路分析的目标，是找出"负责某个具体行为的最小子图"。

#### 4. 叠加与多语义性：为什么直接看神经元不行

理论上，最自然的电路节点是"单个神经元"。但现实中神经元通常是**多语义的**——一个神经元可能同时对应"学术引用""英语对话""HTTP 请求""韩语文本"等多个毫不相关的概念。

原因叫**叠加**：模型需要表示的概念数远超神经元数，于是它把多个概念"涂抹"到同一组神经元上，靠稀疏激活来区分。这导致直接看神经元得不到可解释的电路，需要更精细的工具——SAE、Transcoder 等就是为此而生。

#### 5. 观察与干预的根本区别

机制可解释性有一个核心原则：**观察只能告诉你"有什么信息存在"，干预才能告诉你"模型实际用了什么"**。

举个例子：探针分类器能在第 6 层以 95% 准确率读出"词性"信息，但如果你把这条信息抹掉，模型输出完全不变——说明信息**存在**但模型**没用**它。电路分析的所有方法，本质上都是某种**干预**。

---

### 一、Logit Lens 与 Tuned Lens：最朴素的"透视镜"

#### 动机

在深入因果干预之前，先从最简单的观察工具说起。它回答的问题是："模型在第 $l$ 层时，心里已经'想'到答案了吗？"

#### 原理

模型最后一层会做一个"解嵌入"操作：用矩阵 $W_U \in \mathbb{R}^{V \times d}$ 把残差流向量映射到词表上的 logits。但残差流在**每一层**都存在——为什么不提前把 $W_U$ 套上去看看？

**Logit Lens** 就是这个想法：对第 $l$ 层的残差流 $x_i^{(l)}$ 直接套上 $W_U$：

$$\hat{p}_i^{(l)} = \text{softmax}(W_U \cdot x_i^{(l)})$$

它揭示了一个有趣现象：对于事实回忆类任务（"法国的首都是___"→巴黎），正确答案往往在中间层就已经出现在 top-5 里，最后几层只是在"锐化"已经形成的预测，而不是在计算新答案。

#### 局限与改进

问题在于：$W_U$ 是为**最后一层**训练的，套到早期层会失真——早期层的表示还没被旋转到"预测子空间"。

**Tuned Lens** 的改进是：为每一层训练一个仿射变换 $T^{(l)}$，先把早期层的表示"翻译"到最后一层的坐标系，再套 $W_U$：

$$\hat{p}_i^{(l)} = \text{softmax}(W_U \cdot T^{(l)}(x_i^{(l)}))$$

#### 伪代码

```python
## Logit Lens
def logit_lens(model, tokens):
    # 1. 跑一遍前向，缓存每层残差流
    _, cache = model.run_with_cache(tokens, names_filter=lambda n: "resid_post" in n)
    # 2. 对每一层，套上 W_U 看 top-k 预测
    for layer in range(model.cfg.n_layers):
        resid = cache[f"blocks.{layer}.hook_resid_post"][:, -1, :]  # 取最后一个位置
        logits = model.unembed(model.ln_final(resid))  # 注意要先过 final LN
        top_tokens = topk(logits, k=5)
        print(f"Layer {layer}: {top_tokens}")
```

#### 局限

Logit Lens 是**纯观察**工具，无法建立因果结论——它告诉你"信息存在"，但不告诉你"模型是否依赖它"。这是电路分析需要更重工具的起点。

---

### 二、激活修补：电路分析的基石

#### 动机

Logit Lens 只能看不能改。要回答"这个组件是否因果上重要"，必须**主动干预**：替换某个内部激活，看输出怎么变。激活修补（也叫因果追踪、因果中介分析、交换干预）就是最朴素也最可靠的干预方法。

#### 核心框架：Clean / Corrupted

激活修补的标准设置需要两次前向：

- **Clean run**（干净运行）：喂一个能产生目标行为的输入，缓存所有激活。
- **Corrupted run**（污染运行）：喂一个修改过的、行为不同的输入。

然后做一件关键的事：**在污染运行中，把某个激活替换成干净运行的对应激活**，看输出是否"恢复"到正确答案。如果恢复，说明这个激活携带了因果上重要的信息。

#### 一个具体例子：IOI 任务

IOI（间接宾语识别）是电路分析的"果蝇"任务：

- Clean："When Mary and John went to the store, John gave a drink to ___" → 模型预测 **Mary**
- Corrupted："When Mary and John went to the store, **Mary** gave a drink to ___" → 模型预测 **John**（Mary 变成了重复主语，John 变成了间接宾语）

现在跑污染输入，但在第 $l$ 层、第 $h$ 个头、位置 $p$ 处，把污染激活替换成 clean 的激活。如果输出重新偏向"Mary"，说明这个 (layer, head, position) 携带了识别间接宾语的关键信息。

#### 度量选择：为什么用 Logit Difference

最推荐的度量是**logit 差**：

$$\Delta L = \text{logit}(\text{Mary}) - \text{logit}(\text{John})$$

它连续、在残差流贡献上线性、易解读。相比之下，概率经过 softmax 非线性放大，准确率是离散的、会掩盖渐变效应，都不如 logit diff 可靠。

#### 三种修补方向

- **Denoising（去噪）**：跑污染输入，patch 进 clean 激活，看输出是否恢复。衡量"这个组件缺失会导致多大损害"。
- **Noising（加噪）**：跑 clean 输入，patch 进 corrupted 激活，看输出是否退化。
- **Resample Ablation（重采样消融）**：跑 clean 输入，把某个激活替换成另一个不同输入的激活，看输出变化。

#### 伪代码

```python
import transformer_lens as tl
from transformer_lens.utils import get_act_name

model = tl.HookedTransformer.from_pretrained("gpt2-small")

clean_prompt = "When Mary and John went to the store, John gave a drink to"
corr_prompt   = "When Mary and John went to the store, Mary gave a drink to"

clean_tokens = model.to_tokens(clean_prompt)
corr_tokens   = model.to_tokens(corr_prompt)

## 1. 跑 clean，缓存所有激活
_, clean_cache = model.run_with_cache(clean_tokens)

## 2. 定义度量
def logit_diff(logits, tokens):
    # 假设最后一个位置预测 Mary vs John
    last = logits[:, -1, :]
    mary_id = model.to_single_token(" Mary")
    john_id = model.to_single_token(" John")
    return last[:, mary_id] - last[:, john_id]

clean_logits = model(clean_tokens)
base_diff = logit_diff(clean_logits, clean_tokens)
corr_logits = model(corr_tokens)
corr_diff  = logit_diff(corr_logits, corr_tokens)

## 3. 对每个 head 做 denoising patching
def patch_head(clean_activation, hook, head_idx, layer_idx):
    # hook.ctx 里存了要 patch 的 head 在哪个位置
    clean_activation[:, :, head_idx, :] = clean_cache[
        get_act_name("z", layer_idx)][:, :, head_idx, :]
    return clean_activation

results = torch.zeros(model.cfg.n_layers, model.cfg.n_heads)
for layer in range(model.cfg.n_layers):
    for head in range(model.cfg.n_heads):
        # 跑 corrupted，但把指定 head 的 z 替换成 clean 的
        patched_logits = model.run_with_hooks(
            corr_tokens,
            fwd_hooks=[(get_act_name("z", layer),
                        lambda act, hook: patch_head(act, hook, head, layer))])
        patched_diff = logit_diff(patched_logits, corr_tokens)
        # 归一化：1.0 表示完全恢复到 clean
        results[layer, head] = (patched_diff - corr_diff) / (base_diff - corr_diff)

## 4. 画热力图，找出贡献最大的 head
imshow(results, labels={"x":"Head","y":"Layer"}, title="Per-head patching effect")
```

#### 局限

- **成本爆炸**：每个组件都要单独跑一次前向。GPT-2 Small 有 144 个头，每个还要扫多个位置——轻松上万次前向。
- **自我修复**：消融一个组件后，后续组件（尤其 LayerNorm 重缩放和"备份头"）会部分补偿，导致测得的影响**系统性低估**真实重要性。
- **只能看组件级**：告诉你"9.9 头重要"，但这个头同时干很多事，你不知道它具体在做什么。

---
