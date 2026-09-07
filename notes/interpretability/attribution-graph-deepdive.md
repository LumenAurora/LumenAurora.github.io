---
title: "归因图构建：从替换模型到完整计算快照"
date: 2026-08-28
category: "机制可解释性"
tags:
  - "可解释性"
  - "归因图"
  - "Jacobian"
  - "IOI"
  - "计算图"
description: "归因图（attribution graph）把一次前向传播展开成节点（特征）与边（特征间因果效应）的计算图。本文保姆级拆解其生成算法（前向收集激活 → 反向 Jacobian 追踪 → 后处理可视化），并以 IOI 任务为例走通，最后补全 QK Attribution 这块拼图。"
---

# 归因图构建：从替换模型到完整计算快照

> 归因图（attribution graph）把一次前向传播展开成节点（特征）与边（特征间因果效应）的计算图。本文保姆级拆解其生成算法（前向收集激活 → 反向 Jacobian 追踪 → 后处理可视化），并以 IOI 任务为例走通，最后补全 QK Attribution 这块拼图。

### 🗺️ 第四部分：Attribution Graph（归因图）—— 完整计算快照

#### 4.1 归因图是什么？

**定义**：对于**特定输入prompt**，模型产生**特定输出**时，**所有活跃特征及其相互作用**的有向加权图。

**类比**：
- 原始模型 = 一团乱麻的电路板
- 归因图 = 带标注的电路原理图（每个元件都标了功能）

#### 4.2 节点（Nodes）：图中有什么？

**节点类型及含义**：

```
┌─────────────────────────────────────────────────────────────┐
│                    归因图节点类型                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ① Input Nodes (输入节点)                                    │
│     ├── Token Embedding: "Mary" [位置0的embedding向量]       │
│     ├── Token Embedding: "gave" [位置1的embedding向量]       │
│     └── ...                                                 │
│                                                             │
│  ② Feature Nodes (特征节点) ★核心★                          │
│     ├── 来自CLT的MLP特征:                                    │
│     │   ├── f_142@layer6[pos2]: "检测到阿拉伯文"             │
│     │   ├── f_893@layer6[pos0]: "DNA序列出现"                │
│     │   └── f_3421@layer9[pos5]: "前一位是引号开始"           │
│     │                                                       │
│     ├── 来自MTC/LORSA的Attention特征:                        │
│     │   ├── qk_f_23@head4: "寻找代词指称对象"                │
│     │   ├── ov_f_67@head4: "复制专有名词"                    │
│     │   └── attn_score_h4[pos3→pos0]: 0.85                  │
│     │                                                       │
│     └── 来自SAE的Residual特征:                               │
│         ├── r_f_500@layer3[pos1]: "这是一个动词"              │
│         └── r_f_1200@layer7[pos0]: "主语-Mary"               │
│                                                             │
│  ③ Error Nodes (误差节点)                                    │
│     ├── recon_error_layer6: "第6层CLT重建误差"               │
│     └── attn_approx_error: "LORSA近似attention的误差"        │
│                                                             │
│  ④ Output Nodes (输出节点)                                   │
│     ├── logit_John: 输出"John"的logit值                     │
│     ├── logit_Mary: 输出"Mary"的logit值                     │
│     └── final_probability: 最终概率分布                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**节点的属性**：
- **位置信息**：(layer, position) 在哪里激活
- **激活值**：$f_i$ 该特征的强度（通常0-10之间）
- **语义标签**：人类理解的自然语言描述
- **类型来源**：CLT / MTC / SAE / Token

#### 4.3 边（Edges）：信息如何流动？

**边的类型与含义**：

```
┌─────────────────────────────────────────────────────────────┐
│                    归因图边的类型                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ① CLT Edges (MLP计算边)                                    │
│     来源: CLT的解码器矩阵 W_dec                              │
│     含义: "输入特征f_in 如何通过MLP变换为输出特征f_out"       │
│     权重: ∂(f_out) / ∂(f_in) （Jacobian元素）               │
│     例子: f_3421[引号检测] --(+2.3)--> f_7890[在引号内]     │
│                                                             │
│  ② OV Edges (Attention搬运边)                               │
│     来源: MTC/LORSA的OV circuit分解                         │
│     含义: "源位置的特征f_src 被复制到目标位置，影响f_tgt"     │
│     权重: attention_weight × OV_projection_strength         │
│     例子: f_Mary[pos0] --(0.9×attn)--> f_Mary_copy[pos5]   │
│                                                             │
│  ③ QK Edges (Attention选择边) ★2025新增★                   │
│     来源: QK attribution分解                                 │
│     含义: "Query端的特征f_q 与 Key端的特征f_k 匹配，         │
│            导致模型从位置k attend到... (或反之)"             │
│     权重: ∂(attention_score) / ∂(f_q × f_k)                │
│     例子: q_need_antecedent[pos5] ⊗ k_is_proper_noun[pos0]  │
│           = 0.85 (高匹配度 → 强attention)                   │
│                                                             │
│  ④ Residual Edges (残差连接边)                               │
│     来源: 恒等映射 x_{l+1} = x_l + update                   │
│     含义: "特征f 直接传播到下一层，未被修改"                  │
│     权重: 1.0 (或衰减系数)                                  │
│                                                             │
│  ⑤ Skip Connections (跳跃连接)                               │
│     特殊情况: 某些特征跨越多层保持不变                        │
│     例子: f_Mary_identity 从layer0一直传到layer12           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**边的权重含义**：
- **正值** ($w > 0$): 激活源特征会**增强**目标特征
- **负值** ($w < 0$): 激活源特征会**抑制**目标特征
- **绝对大小** ($|w|$): 影响的强度
- **方向性**: 有向边，信息流动方向明确

#### 4.4 归因图的生成算法（保姆级详解）

##### Step 0: 准备工作

```python
## 1. 加载预训练的替换模型
model = GPT2Small()
clts = load_pretrained_clts()  # 每层一个CLT
mtcs = load_pretrained_mtcs()  # 每层一个MTC（或LORSA）

## 2. 定义输入prompt
prompt = "Mary gave John a gift because she"
tokens = tokenize(prompt)  # ["Mary", "gave", "John", "a", "gift", "because", "she"]
```

##### Step 1: Forward Pass（前向传播收集激活）

```python
def forward_pass_with_recording(prompt):
    """运行模型并记录所有中间激活"""
    
    activations = {
        'residual_stream': {},      # 每层的残差流
        'clt_features': {},         # CLT提取的MLP特征
        'mtc_features': {},         # MTC提取的Attention特征
        'attention_patterns': {},   # 注意力模式
    }
    
    x = token_embeddings(prompt)  # 初始残差流
    
    for layer in range(n_layers):
        # 记录输入残差流
        activations['residual_stream'][(layer, 'input')] = x.clone()
        
        # =** Attention部分（用MTC/LORSA替换或分析）**=
        if use_mtc:
            attn_output, mtc_feats = mtcs[layer](x)
            activations['mtc_features'][layer] = mtc_feats
        else:
            attn_output = original_attention(x)
            activations['attention_patterns'][layer] = get_attention_scores(x)
        
        # =** MLP部分（用CLT替换或分析）**=
        if use_clt:
            mlp_output, clt_feats = clts[layer](x + attn_output)
            activations['clt_features'][layer] = clt_feats
        else:
            mlp_output = original_mlp(x + attn_output)
        
        # 残差连接
        x = x + attn_output + mlp_output
        
        # 记录输出残差流
        activations['residual_stream'][(layer, 'output')] = x.clone()
    
    # 最终logits
    logits = lm_head(x)
    
    return activations, logits
```

**这一步得到什么？**
- 所有位置的、所有层的**特征激活值** $f_i^{(l,p)}$
- 其中 $l$=layer, $p$=position, $i$=feature id

##### Step 2: 选择目标输出（要解释什么？）

```python
## 例如：我们想解释为什么模型预测"her"而不是"his"
target_logit = logits[position_of_she]['token_her']
## 或者：解释整个概率分布
target_distribution = softmax(logits[position_of_she])
```

##### Step 3: Backward Jacobian Tracing（反向Jacobian追踪）⭐核心算法

**这是什么？**
- 不是标准的梯度下降！
- 而是**系统性地计算每个特征对最终输出的偏导数**

**数学基础**：
对于最终输出 $y$（如某个logit），我们想计算：
$$\frac{\partial y}{\partial f_i^{(l,p)}}$$

即：**如果稍微改变 layer $l$, position $p$ 的 feature $i$，输出 $y$ 会变化多少？**

**算法实现**：

```python
def construct_attribution_graph(activations, target_logit_index):
    """
    构建归因图的主算法
    
    返回:
        nodes: dict of node objects
        edges: list of (source_node, target_node, weight) tuples
    """
    
    nodes = {}
    edges = []
    
    # ========================================
    # Phase 1: 创建所有节点
    # ========================================
    
    # 1.1 输入节点（token embeddings）
    for pos, token in enumerate(tokens):
        node_id = f'input_{pos}'
        nodes[node_id] = Node(
            type='token_embedding',
            position=pos,
            value=activations['residual_stream'][(0, 'input')][pos],
            label=f'"{token}"'
        )
    
    # 1.2 特征节点（来自CLT和MTC）
    for layer in range(n_layers):
        for pos in range(seq_len):
            
            # CLT特征（MLP）
            clt_feats = activations['clt_features'].get(layer)
            if clt_feats is not None:
                for feat_id in range(clt_feats.shape[-1]):
                    activation_value = clt_feats[pos, feat_id].item()
                    if abs(activation_value) > threshold:  # 只记录激活的特征
                        node_id = f'clt_feat_{layer}_{pos}_{feat_id}'
                        nodes[node_id] = Node(
                            type='clt_feature',
                            layer=layer,
                            position=pos,
                            feature_id=feat_id,
                            value=activation_value,
                            label=get_feature_label(feat_id)  # 如"检测阿拉伯文"
                        )
            
            # MTC特征（Attention）
            mtc_feats = activations['mtc_features'].get(layer)
            if mtc_feats is not None:
                # 类似地创建MTC特征节点...
                pass
    
    # 1.3 输出节点（logits）
    nodes['output'] = Node(
        type='logit',
        label=f'logit_{target_token}',
        value=logits[target_logit_index].item()
    )
    
    # ========================================
    # Phase 2: 计算边权重（Jacobian反向传播）
    # ========================================
    
    """
    核心思想：使用链式法则从output反向传播到每个feature
    
    对于每一层，我们需要计算:
    ∂(output) / ∂(features_at_this_layer)
    
    这可以通过自动微分高效实现！
    """
    
    # 使用PyTorch的autograd
    output_tensor = logits[target_logit_index]
    
    # 反向传播到所有特征
    output_tensor.backward(retain_graph=True)
    
    # 收集梯度作为一阶归因
    for layer in range(n_layers):
        for pos in range(seq_len):
            
            # CLT特征的梯度 = ∂output / ∂(clt_feature)
            if clt_feats is not None and clt_feats.grad is not None:
                for feat_id in range(clt_feats.shape[-1]):
                    grad_value = clt_feats.grad[pos, feat_id].item()
                    
                    if abs(grad_value) > edge_threshold:
                        source_node = f'clt_feat_{layer}_{pos}_{feat_id}'
                        
                        # 添加边：该特征 → 输出（或下一层特征）
                        edges.append(Edge(
                            source=source_node,
                            target='output',  # 或更精细的目标
                            weight=grad_value,
                            type='mlp_attribution'
                        ))
            
            # 类似地处理MTC特征...
    
    # ========================================
    # Phase 3: 构建层间边（特征→特征）
    # ========================================
    
    """
    这是tricky part：如何知道 feature A (layer L) 影响 feature B (layer L+1)?
    
    方法：使用CLT/MTC的解码器矩阵！
    
    因为: next_residual = features @ W_dec
    而: next_features = Encoder(next_residual)
    
    所以可以通过 W_dec 和下一层的 W_enc 来追踪!
    """
    
    for layer in range(n_layers - 1):
        # 获取本层CLT的解码器
        W_dec = clts[layer].W_dec.weight.data  # [n_features, d_model]
        
        # 获取下一层CLT的编码器
        W_enc_next = clts[layer + 1].W_enc.weight.data  # [d_model, n_features_next]
        
        # 计算特征→特征的Jacobian: J = W_dec @ W_enc_next
        inter_layer_jacobian = W_dec @ W_enc_next  # [n_features, n_features_next]
        
        # 为强连接添加边
        for src_feat in active_features[layer]:
            for tgt_feat in active_features[layer + 1]:
                j_val = inter_layer_jacobian[src_feat, tgt_feat].item()
                
                if abs(j_val) > threshold:
                    edges.append(Edge(
                        source=f'clt_feat_{layer}_{pos}_{src_feat}',
                        target=f'clt_feat_{layer+1}_{pos}_{tgt_feat}',
                        weight=j_val * activations[layer][src_feat],  # 乘以激活值
                        type='inter_layer_clt'
                    ))
    
    # ========================================
    # Phase 4: 处理Attention边（OV + QK）
    # ========================================
    
    if use_mtc_or_lorsa:
        """
        对于MTC/LORSA，边的构建更复杂:
        
        OV边: (src_pos, src_feature) → (tgt_pos, tgt_feature)
              表示: src_pos的某特征通过attention被copy到tgt_pos
              
        QK边: (query_feature) ⊗ (key_feature) → attention_score
              表示: query端和key端的特征匹配导致attention
        """
        
        for layer in range(n_layers):
            attn_pattern = activations['attention_patterns'][layer]  # [heads, T, T]
            
            for head in range(n_heads):
                for query_pos in range(seq_len):
                    for key_pos in range(seq_len):
                        attn_weight = attn_pattern[head, query_pos, key_pos]
                        
                        if attn_weight > attention_threshold:
                            
                            # OV边: key_pos的特征 → 影响query_pos
                            for src_feat in active_key_features[layer][key_pos]:
                                for tgt_feat in active_query_features[layer][query_pos]:
                                    
                                    # 计算该head的OV投影强度
                                    ov_strength = compute_ov_projection(
                                        head, src_feat, tgt_feat
                                    )
                                    
                                    edge_weight = attn_weight * ov_strength
                                    
                                    if abs(edge_weight) > threshold:
                                        edges.append(Edge(
                                            source=f'mtc_feat_{layer}_{key_pos}_{src_feat}',
                                            target=f'mtc_feat_{layer}_{query_pos}_{tgt_feat}',
                                            weight=edge_weight,
                                            type='ov_attention',
                                            metadata={
                                                'head': head,
                                                'from_pos': key_pos,
                                                'to_pos': query_pos
                                            }
                                        ))
    
    return Graph(nodes=nodes, edges=edges)
```

##### Step 4: 后处理与可视化

```python
def post_process_and_visualize(graph):
    """
    清洗和优化归因图
    """
    
    # 4.1 过滤弱边（只保留重要连接）
    graph.filter_edges_by_weight(min_abs_weight=0.01)
    
    # 4.2 合并相似特征为Supernodes（超节点）
    # 例如: 多个检测"数字"的特征合并为一个"数字检测"超节点
    graph.group_similar_features_into_supernodes(similarity_threshold=0.8)
    
    # 4.3 全局重要性排序（PageRank-like）
    ranks = compute_feature_importance(graph)  # 哪些feature最关键？
    
    # 4.4 布局算法（层次化/力导向）
    layout = hierarchical_layout(graph)  # 按layer排列
    
    # 4.5 渲染
    visualize_interactive_graph(
        graph,
        layout,
        highlight_top_k_features=20,
        show_attention_flow=True
    )
```

#### 4.5 归因图的实例：IOI任务（Indirect Object Identification）

**Prompt**: `"When Mary and John went to the store, John gave a bottle to"`  
**Expected completion**: `"Mary"` (not "John")

**生成的归因图（简化版）**：

```
Input Layer (Tokens):
["When"] ["Mary"] ["and"] ["John"] ["went"] [...] ["to"]
    |         |                          |
    ▼         ▼                          ▼
Layer 2 Features:
          [Maryproper_noun]         [Johnproper_noun]
                |                          |
                ▼                          ▼
Layer 5 Features (via Residual):
  [prev_Mary] ←─────────────────────┐
                                      │
Layer 7 Features (via Attention OV):  │
  [Mary_copy_from_pos1] ◄────────────┘
  (Head 4: induction head, attn=0.92 from pos1 to pos15)
                |
                ▼
Layer 10 Features (via CLT):
  [need_pronoun_for_Mary] ←──[detect_"to"+preposition]
                |
                ▼
Layer 12 Features (via CLT):
  [predict_"Mary"_as_object]
                |
                ▼
Output:
  logit_"Mary" = +4.2  ★★★
  logit_"John" = -1.8
```

**边的解读**：
- **粗线** (`===>`): 强正贡献（增强输出）
- **虚线** (`- ->`): 弱贡献或负贡献
- **标签**: 显示经过的head编号或transform类型

---

### 🔬 第五部分：QK Attribution —— 补全最后的拼图

#### 5.1 之前归因图的缺陷

**2025年初的局限**：
- ✅ 能看到**什么信息被搬运**（OV circuit）
- ❌ 不能解释**为什么选择这个源位置**（QK circuit）

**例子**：
```
归因图显示: "Mary"特征从pos1被copy到pos15
但没说: 为什么head选择attend到pos1而不是pos3("John")?
```

#### 5.2 QK Attribution的数学（2025年7月论文）

**出发点**：Attention score本身就是一个bilinear form！

对于head $h$，从query位置 $q$ 到key位置 $k$ 的pre-softmax score:

$$s_h(q, k) = \frac{(W_Q^h \mathbf{x}_q)^\top (W_K^h \mathbf{x}_k)}{\sqrt{d_h}} = \frac{\mathbf{x}_q^\top \underbrace{(W_Q^h)^\top W_K^h}_{W_{QK}^h} \mathbf{x}_k}{\sqrt{d_h}}$$

**关键性质**：
- **对$\mathbf{x}_q$线性**（固定$k$时）
- **对$\mathbf{x}_k$线性**（固定$q$时）

这意味着我们可以做**双线性分解**！

#### 5.3 特征空间的QK分解

假设我们在query位置和key位置都有SAE/MTC特征：

$$\mathbf{x}_q \approx \sum_i f_q^{(i)} \mathbf{d}_i^{(q)} \quad \text{(query位置的特征展开)}$$
$$\mathbf{x}_k \approx \sum_j f_k^{(j)} \mathbf{d}_j^{(k)} \quad \text{(key位置的特征展开)}$$

其中 $\mathbf{d}$ 是decoder方向（特征的方向向量）。

**代入attention score**：

$$s_h(q, k) \approx \frac{1}{\sqrt{d_h}} \sum_{i,j} \underbrace{f_q^{(i)} f_k^{(j)}}_{\text{特征激活乘积}} \underbrace{(\mathbf{d}_i^{(q)})^\top W_{QK}^h \mathbf{d}_j^{(k)}}_{\text{QK compatibility matrix}}$$

**定义QK attribution**：

$$\text{QK-attrib}_{h}^{(i,j)}(q,k) = f_q^{(i)} \cdot f_k^{(j)} \cdot (\mathbf{d}_i^{(q)})^\top W_{QK}^h \mathbf{d}_j^{(k)}$$

**直观解释**：
> Query位置的特征 $i$ 与Key位置的特征 $j$ 之间的**兼容性**，乘以它们的**激活强度**，共同决定了attention score的一部分。

#### 5.4 QK Attribution在归因图中的体现

**新的边类型**：

```
Query Position (pos15, "she"):
  Feature: need_antecedent [f=3.2]
      │
      │  QK Compatibility Score = 0.91 (高度匹配!)
      │  (因为: need_antecedent 方向 ⊺ W_QK ⊺ is_proper_noun 方向 很大)
      │
      ▼
Key Position (pos1, "Mary"):
  Feature: is_proper_noun [f=4.1]
  Feature: is_female_name [f=3.8]

→ 结果: Head 4 给予 (pos15 → pos1) 高attention = 0.92
```

**完整的三元组解释**（2025年论文的核心贡献）：

| 问题 | 答案来源 | 图中体现 |
|-----|---------|---------|
| **哪些特征在通信？** | OV edges | `Mary[pos1] → Mary_copy[pos15]` |
| **哪个头在搬运？** | Edge metadata | `Head 4 (induction)` |
| **为什么选这个位置？** | **QK attribution** (新!) | `need_antecedent ⊗ is_proper_noun → high attn` |

---
