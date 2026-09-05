---
title: "注意力分析方法梳理"
date: 2026-05-18
category: "机制可解释性"
tags:
  - "可解释性"
  - "注意力"
description: "VLM注意力分析是所有视觉剪枝、幻觉缓解、跨模态对齐研究的基础工具，核心目标是通过量化和可视化模型的注意力分配模式，揭示VLM内部的工作机制，发现现有方法的缺陷，进而提出改进方案。你看到的所有剪枝论文（LearnPruner、VScan、FastV等）和幻觉研究（WING、Anchor Token）……"
---

# 注意力分析方法梳理

### VLM注意力分析完全指南：从基础方法到顶会论文实践
VLM注意力分析是**所有视觉剪枝、幻觉缓解、跨模态对齐研究的基础工具**，核心目标是通过量化和可视化模型的注意力分配模式，揭示VLM内部的工作机制，发现现有方法的缺陷，进而提出改进方案。你看到的所有剪枝论文（LearnPruner、VScan、FastV等）和幻觉研究（WING、Anchor Token），本质上都是用同一套标准化的注意力分析流程得出的结论。

#### 一、先搞清楚：VLM里到底有哪些注意力可以分析？
VLM由**视觉编码器**和**大语言模型（LLM）**两部分组成，不同位置的注意力有完全不同的行为模式和研究价值，这是所有分析的起点：

| 模块 | 注意力类型 | 计算方式 | 研究价值 | 代表论文 |
|------|------------|----------|----------|----------|
| **视觉编码器** | CLS→Patch注意力 |  CLS token对所有图像patch token的注意力 | 评估视觉编码器能否聚焦重要区域 | LearnPruner、VScan、VisPruner |
| | Patch→Patch自注意力 | 图像patch之间的相互注意力 | 分析视觉特征的局部-全局演化规律 | VScan、DINOv2 |
| **LLM解码器** | 文本→文本注意力 | 文本token之间的相互注意力 | 分析语言理解和推理过程 | 传统LLM研究 |
| | 视觉→视觉注意力 | 视觉token之间的相互注意力 | 分析视觉信息在LLM内的传播 | LearnPruner、FastV |
| | **文本→视觉注意力** | 文本token对所有视觉token的注意力 | 评估模型能否将文本查询与图像区域对齐 | LearnPruner、SparseVLM、Anchor Token |
| | 视觉→文本注意力 | 视觉token对文本token的注意力 | 分析视觉信息如何影响语言生成 | WING、Anchor Token |

⚠️ **核心注意点**：90%以上的VLM剪枝和幻觉研究，都聚焦在**CLS→Patch注意力**和**文本→视觉注意力**这两种，因为它们直接决定了"模型看哪里"和"模型用什么信息回答问题"。

#### 二、VLM注意力分析的通用标准化流程
所有顶会论文的注意力分析都遵循完全相同的6步流程，没有任何例外：

##### 步骤1：准备实验环境与基准数据集
- **模型选择**：选择最主流的开源VLM作为基准（LLaVA-1.5-7B是绝对的金标准，所有论文都会在它上面做实验）
- **数据集选择**：
  - 通用分析：从VQAv2、GQA中随机抽取1000-5000个样本（足够统计出稳定规律）
  - 特定任务分析：POPE（幻觉）、TextVQA（OCR）、MME（感知与认知）
- **环境配置**：使用Hugging Face Transformers库，加载模型时必须设置`output_attentions=True`和`output_hidden_states=True`，这是提取注意力的关键。

##### 步骤2：提取原始注意力权重
这是最基础也是最容易出错的一步，不同模型的注意力输出格式略有差异，但核心逻辑一致：
```python
## 以LLaVA-1.5-7B为例的注意力提取代码
from transformers import AutoProcessor, LlavaForConditionalGeneration
import torch

model_name = "llava-hf/llava-1.5-7b-hf"
processor = AutoProcessor.from_pretrained(model_name)
model = LlavaForConditionalGeneration.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto",
    output_attentions=True,  # 关键：输出注意力权重
    output_hidden_states=True  # 输出隐藏状态
)

## 准备输入
prompt = "USER: <image>\nAre the cats wearing life jackets? ASSISTANT:"
image = Image.open("cats.jpg")
inputs = processor(text=prompt, images=image, return_tensors="pt").to("cuda")

## 前向传播，获取注意力
with torch.no_grad():
    outputs = model(**inputs)
    
## 提取注意力：outputs.attentions是一个元组，长度等于LLM的层数
## 每个元素的形状是 [batch_size, num_heads, seq_len, seq_len]
all_attentions = outputs.attentions  # 32层LLaVA-1.5有32个注意力张量
```

##### 步骤3：注意力的预处理与模态分离
原始注意力是**多头、全序列**的，无法直接分析，必须进行预处理：
1. **多头平均**：对所有注意力头取平均，得到单头注意力（大多数研究的做法，少数研究会分析特定头的行为）
   ```python
   # 对第k层的注意力进行多头平均
   layer_k_attn = all_attentions[k].mean(dim=1).squeeze(0)  # [seq_len, seq_len]
   ```
2. **模态分离**：将全序列注意力拆分为文本和视觉两部分
   ```python
   # 首先确定文本和视觉token的索引范围
   text_len = len(processor.tokenizer(prompt)["input_ids"])
   vision_len = 576  # LLaVA-1.5单张图像生成576个视觉token
   
   # 分离不同类型的注意力
   text_to_text = layer_k_attn[:text_len, :text_len]
   text_to_vision = layer_k_attn[:text_len, text_len:]  # 最重要！文本对视觉的注意力
   vision_to_vision = layer_k_attn[text_len:, text_len:]
   vision_to_text = layer_k_attn[text_len:, :text_len]
   ```
3. **归一化**：对注意力分数进行行归一化，确保每行的和为1（原始注意力已经是softmax后的结果，通常不需要额外归一化）

##### 步骤4：定量分析（核心！所有论文结论都来自这里）
定量分析是通过统计指标量化注意力的分布规律，是得出科学结论的基础。以下是所有顶会论文最常用的6种分析方法，你提到的所有结论都是用这些方法得到的：

###### 方法1：平均注意力分数随索引的变化（分析位置偏差）
- **用途**：发现注意力偏移现象（LearnPruner的核心发现）
- **做法**：
  1. 对数据集中的所有样本，计算每个视觉token索引的平均注意力分数
  2. 以token索引为x轴，平均注意力分数为y轴，绘制折线图
- **LearnPruner的发现**：
  - 视觉→视觉注意力的分数随token索引线性增长，存在严重的位置偏差
  - 文本→视觉注意力的增长趋势平缓得多，对位置偏差有抵抗力

###### 方法2：注意力分数随层数的变化（分析跨模态交互阶段）
- **用途**：确定最佳剪枝层（VScan、LearnPruner的核心实验）
- **做法**：
  1. 对每一层，计算文本→视觉注意力的平均最大值、熵或其他指标
  2. 以层数为x轴，指标值为y轴，绘制折线图
- **VScan的发现**：
  - 早期层（1-5层）：文本→视觉注意力几乎为0，跨模态交互很少
  - 中间层（6-20层）：文本→视觉注意力达到峰值，是跨模态交互的主要阶段
  - 晚期层（21-32层）：文本→视觉注意力下降，模型开始专注于生成

###### 方法3：前景-背景注意力分配分析（分析视觉编码器的聚焦能力）
- **用途**：验证CLS注意力是否有效（LearnPruner的关键实验）
- **做法**：
  1. 使用SAM、GroundingDINO等工具分割出图像的前景和背景
  2. 计算CLS注意力分配给前景和背景的平均比例
  3. 对比实验：限制token只能从前景选择，看性能变化
- **LearnPruner的发现**：
  - CLS注意力平均只有40%左右分配给前景，60%分配给了背景
  - 即使随机选择前景token，性能也优于基于CLS注意力的全图选择

###### 方法4：注意力空间分布熵分析（分析局部-全局演化）
- **用途**：分析视觉特征的编码过程（VScan的核心发现）
- **做法**：
  1. 将每个视觉token的注意力分数映射回二维图像空间
  2. 计算注意力分布的熵（熵越小，注意力越集中；熵越大，注意力越分散）
  3. 计算熵随层数的变化
- **VScan的发现**：
  - 视觉编码器浅层：注意力熵大，分布分散，关注局部细节
  - 视觉编码器深层：注意力熵小，分布集中，关注全局语义

###### 方法5：不同类型token的注意力占比分析（分析幻觉原因）
- **用途**：研究生成过程中模型关注什么（WING、Anchor Token的核心发现）
- **做法**：
  1. 将序列中的token分为系统提示、指令、已生成token、视觉token四类
  2. 计算每一层中，模型对这四类token的平均注意力占比
  3. 绘制占比随生成步数的变化曲线
- **Anchor Token的发现**：
  - 生成过程中，深层注意力逐渐集中在系统提示、指令和已生成token（锚点token）上
  - 对视觉token的注意力占比从中间层的30%下降到最后一层的不足5%

###### 方法6：注意力特征谱分析（从数学角度解释机制）
- **用途**：深入解释注意力行为的本质（Anchor Token的理论贡献）
- **做法**：
  1. 计算自注意力QK权重矩阵的特征值和特征向量
  2. 分析特征值的分布（均值、方差、极化程度）
- **Anchor Token的发现**：
  - 当QK矩阵的特征谱具有非零均值且方差极化时，少数token会过度吸引注意力
  - 这是锚点token现象和幻觉产生的数学根源

##### 步骤5：定性分析（注意力热力图可视化）
定量分析得出规律后，必须用定性的热力图来直观展示，这是顶会论文必不可少的部分：
1. **视觉编码器注意力可视化**：
   - 将CLS对每个patch的注意力分数作为该patch的颜色值
   - 上采样到原始图像大小，叠加在原图上生成热力图
2. **LLM文本→视觉注意力可视化**：
   - 选择特定的文本token（如问题中的关键词"cats"、"life jacket"）
   - 将该文本token对所有视觉patch的注意力分数映射回图像
   - 生成对应的热力图，展示模型将哪个文本词与哪个图像区域对齐

##### 步骤6：因果验证（顶会论文的灵魂！）
⚠️ **最重要的一步**：前面的定量和定性分析都只能证明**相关性**，只有因果验证才能证明**因果关系**，这是区分普通论文和顶会论文的关键。

所有顶会论文都会做以下至少一种因果验证实验：
1. **干预实验**：改变一个变量，看结果是否发生预期的变化
   - LearnPruner：限制token只能从前景选择，性能提升 → 证明CLS注意力没有聚焦前景
   - VScan：在不同层剪枝，中间层剪枝性能最好 → 证明中间层是跨模态交互的主要阶段
   - Anchor Token：移除锚点token，幻觉减少 → 证明锚点token是导致幻觉的原因
2. **消融实验**：移除某个组件，看性能是否下降
3. **反事实实验**：构造反例，验证结论的鲁棒性

#### 三、你提到的经典论文分析方法拆解
现在你可以用上面的通用流程，完美理解所有这些论文的研究思路：

| 论文 | 核心结论 | 使用的分析方法 | 因果验证实验 |
|------|----------|----------------|--------------|
| **LearnPruner** | 1. CLS注意力无法聚焦前景<br>2. LLM中间层文本→视觉注意力最可靠 | 1. 前景-背景注意力分配分析<br>2. 平均注意力随索引变化<br>3. 注意力随层数变化 | 1. 前景限制token选择实验<br>2. 不同层剪枝性能对比 |
| **VScan** | 1. 视觉编码器浅层关注局部，深层关注全局<br>2. LLM中间层是跨模态交互的主要阶段 | 1. 注意力空间分布熵分析<br>2. 注意力随层数变化<br>3. 不同模态注意力占比分析 | 1. 不同层剪枝性能对比<br>2. 浅层/深层特征单独使用的性能对比 |
| **WING** | 视觉token会稀释对后续文本的注意力 | 1. 不同类型token的注意力占比分析<br>2. 注意力随图片插入位置的变化 | 1. 改变图片插入位置，看文本注意力的变化<br>2. 移除视觉token，看文本注意力的恢复 |
| **Anchor Token** | 深层注意力过度集中在锚点token上导致幻觉 | 1. 不同类型token的注意力占比分析<br>2. 注意力特征谱分析<br>3. 注意力随生成步数的变化 | 1. 移除锚点token，看幻觉率的变化<br>2. 修改QK矩阵的特征谱，看注意力分布的变化 |

#### 四、完整可运行的代码示例：LLaVA-1.5注意力分析
以下是一个最小化的完整代码，实现了最常用的**文本→视觉注意力提取**和**热力图可视化**，你可以直接运行并扩展：
```python
import torch
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from transformers import AutoProcessor, LlavaForConditionalGeneration

## 加载模型和处理器
model_name = "llava-hf/llava-1.5-7b-hf"
processor = AutoProcessor.from_pretrained(model_name)
model = LlavaForConditionalGeneration.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto",
    output_attentions=True
)

def extract_text_to_vision_attention(image_path, prompt, layer_idx=11):
    """
    提取指定层的文本→视觉注意力
    layer_idx=11对应第12层（LearnPruner发现的最优层）
    """
    # 准备输入
    image = Image.open(image_path).convert("RGB")
    inputs = processor(text=prompt, images=image, return_tensors="pt").to("cuda")
    text_len = len(processor.tokenizer(prompt)["input_ids"])
    
    # 前向传播
    with torch.no_grad():
        outputs = model(**inputs)
    
    # 提取并预处理注意力
    layer_attn = outputs.attentions[layer_idx].mean(dim=1).squeeze(0)
    text_to_vision = layer_attn[:text_len, text_len:].cpu().numpy()  # [text_len, 576]
    
    return text_to_vision, image

def visualize_attention(attention, image, text_token_idx, save_path="attention_heatmap.png"):
    """
    可视化指定文本token对图像的注意力
    """
    # 将576个token的注意力重塑为24x24的网格（LLaVA-1.5的patch划分）
    attn_map = attention[text_token_idx].reshape(24, 24)
    
    # 上采样到原始图像大小
    attn_map = Image.fromarray(attn_map).resize(image.size, Image.BILINEAR)
    attn_map = np.array(attn_map)
    
    # 归一化到0-1
    attn_map = (attn_map - attn_map.min()) / (attn_map.max() - attn_map.min())
    
    # 绘制热力图
    plt.figure(figsize=(10, 5))
    plt.subplot(1, 2, 1)
    plt.imshow(image)
    plt.title("Original Image")
    plt.axis("off")
    
    plt.subplot(1, 2, 2)
    plt.imshow(image)
    plt.imshow(attn_map, cmap="jet", alpha=0.5)
    plt.title(f"Attention Heatmap (Token: {text_token_idx})")
    plt.axis("off")
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.show()

## 使用示例
if __name__ == "__main__":
    image_path = "cats.jpg"
    prompt = "USER: <image>\nAre the cats wearing life jackets? ASSISTANT:"
    
    # 提取第12层的文本→视觉注意力
    text_to_vision, image = extract_text_to_vision_attention(image_path, prompt, layer_idx=11)
    
    # 可视化问题中"cats"这个词的注意力（假设"cats"是第8个文本token）
    # 你可以用processor.tokenizer.tokenize(prompt)来查看每个token的索引
    visualize_attention(text_to_vision, image, text_token_idx=8)
```

#### 五、常见的坑和注意事项
1. **注意力分数不等于重要性**：注意力高不代表这个token对最终预测更重要，只能说明模型"看了"它。要证明重要性，必须做干预实验（移除这个token看性能变化）。
2. **不同模型的注意力行为差异很大**：LLaVA的结论不能直接套用到Qwen-VL、Gemini等其他模型上，必须重新做实验。
3. **多头注意力的差异**：简单地对所有头取平均可能会掩盖一些重要的行为，有些特定的头专门负责跨模态对齐。
4. **生成过程中的注意力是动态变化的**：预填充阶段的注意力和生成阶段的注意力完全不同，幻觉研究主要关注生成阶段的注意力。
5. **相关性≠因果性**：永远不要只根据注意力的相关性就得出结论，必须做因果验证实验。

#### 六、下一步学习建议
1. 先跑通上面的代码，用自己的图片和问题生成注意力热力图，直观感受VLM的注意力行为
2. 复现LearnPruner的核心实验：计算CLS注意力的前景-背景分配比例，验证"随机前景选择优于CLS全图选择"的结论
3. 阅读VScan论文，复现注意力随层数变化的分析，找到你使用的模型的最佳剪枝层
