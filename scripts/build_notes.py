# -*- coding: utf-8 -*-
"""
把 Obsidian 私人笔记转换为博客文章。

职责：
  1. 按映射表挑选源文件（只选知识类 / 客观 insight 类）
  2. 剔除敏感行段（未发表研究、私人信息、审稿人代号、AI 对话痕迹等）
  3. 清理 Obsidian 专有语法（wikilink / callout / 高亮）
  4. 规范化标题层级、注入 frontmatter
输出：notes/<category>/<slug>.md
"""
import os
import re
import sys
import time
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_ROOT = Path(r"D:\1A数据文件夹\大学\计算机\人工智能")
OUT_ROOT = ROOT / "notes"

# ---------------------------------------------------------------- 文章映射表
# drops: 需删除的行区间 [(start, end)]，1-indexed 闭区间
# drop_regex: 整行匹配该正则即删除
A = []


def art(slug, title, srcs, category, tags=None, drops=None,
        drop_regex=None, intro=None, sections=None):
    A.append(dict(slug=slug, title=title, srcs=srcs, category=category,
                  tags=tags or [], drops=drops or [], drop_regex=drop_regex or [],
                  intro=intro, sections=sections))


# ============ 机制可解释性 ============
art("interpretability/attribution-graphs",
    "归因图、特征分解与 QK 归因：Transformer 可解释性方法入门",
    [("学习/可解释博文.md", None)], "机制可解释性",
    ["可解释性", "Transformer", "归因图", "SAE"],
    drops=[(1, 2)],
    intro="这是一份从零开始的 Transformer 可解释性方法说明书：把一次前向传播拆开，"
          "讲清楚归因图（attribution graphs）、特征分解与 QK 归因分别在做什么、"
          "彼此如何衔接。")

art("interpretability/interpretability-map",
    "可解释性研究的全景框架",
    [("经典方法/可解释性.md", None)], "机制可解释性",
    ["可解释性", "方法论", "因果干预"])

art("interpretability/diffusion-interpretability",
    "扩散模型的可解释性",
    [("学习/扩散模型可解释性.md", None)], "机制可解释性",
    ["可解释性", "扩散模型", "表征"],
    drops=[(1, 1)],
    drop_regex=[r"^好，这需要多方向同时搜索.*$"])

art("interpretability/behavioral-interpretability",
    "行为可解释性：模型想到什么，与它说出什么",
    [("学习/行为可解释.md", None), ("学习/可解释.md", None)], "机制可解释性",
    ["可解释性", "行为可解释", "VLM", "CoT"],
    sections=["行为层面的可解释性", "表示与架构层面的观察"])

art("interpretability/attention-analysis",
    "注意力分析方法梳理",
    [("论文笔记/注意力分析.md", None)], "机制可解释性",
    ["可解释性", "注意力"])

# ============ 生成模型 ============
art("generative/diffusion-models",
    "扩散模型：从变分下界到采样加速",
    [("学习/扩散模型.md", None)], "生成模型",
    ["扩散模型", "生成模型", "SDE"])

art("generative/diffusion-post-training",
    "扩散模型的后训练",
    [("学习/扩散模型后训练.md", None)], "生成模型",
    ["扩散模型", "后训练", "对齐"])

art("generative/flow-and-gradient",
    "梯度流与流匹配",
    [("学习/梯度流.md", None)], "生成模型",
    ["流匹配", "梯度流", "生成模型"])

art("generative/deep-generative-models",
    "深度生成模型概览",
    [("学习/深度生成模型.md", None)], "生成模型",
    ["生成模型", "概览"])

# ============ 表征与世界模型 ============
art("representation/ssl-representation",
    "自监督表征学习：从零到精通",
    [("学习/表征学习.md", None)], "表征与世界模型",
    ["表征学习", "自监督", "对比学习"])

art("representation/world-models",
    "世界模型：VLA、JEPA 与 WAM",
    [("学习/世界模型.md", None)], "表征与世界模型",
    ["世界模型", "具身智能", "JEPA"])

art("representation/implicit-models",
    "隐式模型（Implicit Models）全面讲解",
    [("方向与道路/小众网络.md", None)], "表征与世界模型",
    ["隐式模型", "DEQ", "深度均衡模型"])

art("representation/autoregressive-internals",
    "自回归大模型的内部机制",
    [("学习/深入自回归大模型.md", None)], "表征与世界模型",
    ["自回归", "LLM", "内部机制"])

# ============ 后训练与推理 ============
art("post-training/post-training",
    "大模型后训练：SFT、RLHF 与 RLVR",
    [("学习/大模型后训练.md", None)], "后训练与推理",
    ["后训练", "SFT", "RLHF", "对齐"])

art("post-training/post-training-techniques",
    "后训练技术谱系",
    [("论文之道/后训练技术.md", None)], "后训练与推理",
    ["后训练", "技术谱系"])

art("post-training/beyond-attention",
    "注意力之外的架构探索",
    [("学习/attention之外.md", None)], "后训练与推理",
    ["架构", "注意力", "线性注意力"])

# ============ 强化学习 ============
art("rl/rl-principles",
    "强化学习纲要",
    [("学习/RL.md", None)], "强化学习",
    ["强化学习", "策略优化"])

art("rl/rl-book-of-ai",
    "从零开始：RL、监督学习与最优控制的严格区分",
    [("学习/RL book of AI.md", None)], "强化学习",
    ["强化学习", "最优控制", "入门"])

art("rl/why-human-rl",
    "人为什么靠「RL」学会打麻将",
    [("学习/Why Human.md", None)], "强化学习",
    ["强化学习", "认知科学", "类比"])

art("rl/rl-vs-supervised",
    "强化学习与监督学习的根本区别",
    [("模型大全/答疑.md", None)], "强化学习",
    ["强化学习", "监督学习", "辨析"])

# ============ 数学基础 ============
art("math/sde-primer",
    "随机微分方程入门：从直觉到量化金融与 Diffusion",
    [("数学/SDE.md", None)], "数学基础",
    ["SDE", "随机过程", "扩散模型"])

art("math/math-for-learning",
    "学习理论背后的数学",
    [("学习的数学.md", None)], "数学基础",
    ["学习理论", "数学", "优化"])

art("math/math-interpretation",
    "深度学习中的数学概念解读",
    [("数学/数学解读.md", None)], "数学基础",
    ["数学", "梯度", "深度学习"])

# ============ 研究方法论 ============
art("methodology/benchmark-writing",
    "Benchmark 论文写作：从心理测量学借一套方法论",
    [("论文之道/benchmark写作.md", None)], "研究方法论",
    ["Benchmark", "论文写作", "评测"])

art("methodology/analysis-paper",
    "分析类论文如何做得有趣",
    [("论文之道/分析类如何有趣.md", None)], "研究方法论",
    ["分析类论文", "论文写作", "novelty"])

art("methodology/idea-generation",
    "方法类论文的 Idea 生成框架",
    [("论文之道/故事线.md", None)], "研究方法论",
    ["Idea", "论文写作", "选题"])

art("methodology/algorithm-design",
    "AI 算法设计的底层逻辑：从生物启发到数学分析",
    [("论文之道/科学架构设计.md", None)], "研究方法论",
    ["算法设计", "方法论"])

art("methodology/method-paper",
    "方法类文章的实验观",
    [("论文之道/ai是工科——方法类文章.md", None)], "研究方法论",
    ["方法类论文", "实验设计"])

art("methodology/problem-scoping",
    "如何框定一个值得做的研究问题",
    [("论文之道/找问题类型研究.md", None)], "研究方法论",
    ["选题", "问题定义"])

art("methodology/reliability-benchmark",
    "可靠性 Benchmark 研究",
    [("论文之道/可靠性benchmark研究.md", None)], "研究方法论",
    ["Benchmark", "可靠性", "评测"])

art("methodology/review-dimensions",
    "审稿维度的系统梳理",
    [("审稿之法.md", (1, 184))], "研究方法论",
    ["审稿", "学术写作", "顶会"],
    intro="把 ICLR / ICML / NeurIPS 官方审稿表单的显性维度，以及实证研究揭示的"
          "隐性、元层面问题，整理成一份可检索的清单。既可用于投稿前预判审稿意见，"
          "也可用于审稿人自我校准评审角度。")

# ============ 领域综述 ============
art("surveys/icml-decade",
    "ICML 十年脉络",
    [("论文历史/ICML.md", None)], "领域综述",
    ["ICML", "领域综述"],
    drops=[(1, 3)],
    drop_regex=[r"^您说得非常对.*$", r"^\*\*根本性的定位问题\*\*.*$"])

art("surveys/cvpr-decade",
    "CVPR 十年谈",
    [("论文历史/CVPR十年谈.md", None)], "领域综述",
    ["CVPR", "计算机视觉", "领域综述"])

art("surveys/gnn-evolution",
    "图神经网络的演进",
    [("论文历史/图神经网络.md", None)], "领域综述",
    ["图神经网络", "GNN", "领域综述"],
    drops=[(1, 1)])

art("surveys/time-series",
    "时间序列分析：方法脉络与现状",
    [("论文历史/时间序列分析.md", None)], "领域综述",
    ["时间序列", "领域综述"],
    drops=[(1, 1)])

art("surveys/nlp-to-llm",
    "从 NLP 到大模型",
    [("论文历史/NLP.md", None)], "领域综述",
    ["NLP", "大模型", "领域综述"])

art("surveys/anti-hallucination",
    "学界「抗幻觉」研究全史",
    [("方向与道路/学界嗨起来.md", None)], "领域综述",
    ["幻觉", "领域综述", "LLM"])

# ============ 随笔 ============
art("essays/complex-systems",
    "复杂系统与计算不可约",
    [("胡思乱想/复杂系统.md", None)], "随笔",
    ["复杂系统", "科学哲学"])

art("essays/embodied-intelligence",
    "具身智能：大脑做什么，小脑怎么做的",
    [("胡思乱想/具身智能.md", None)], "随笔",
    ["具身智能", "机器人"])

art("essays/big-questions",
    "尚未解决的开放问题",
    [("大问题.md", None)], "随笔",
    ["开放问题", "多模态", "因果性"])

art("essays/science-vs-engineering",
    "科学与工程的分野",
    [("科学工程/科学与工程.md", None)], "随笔",
    ["科学哲学", "工程"])

art("essays/hamming-compound",
    "复利思想与研究壁垒",
    [("方向与道路/大大大.md", None)], "随笔",
    ["研究方向", "复利"])

art("essays/lean-research",
    "以小博大的研究案例",
    [("方向与道路/小小小.md", None)], "随笔",
    ["研究方向", "算力", "案例"])

art("essays/choose-direction",
    "如何选择研究方向",
    [("方向与道路/选方向.md", None)], "随笔",
    ["研究方向", "选题"])

art("essays/path-forward",
    "路在何方",
    [("你还想学吗/路在何方.md", None)], "随笔",
    ["研究方向", "科研"])


# ---------------------------------------------------------------- 清洗规则
RE_WIKILINK = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
RE_HIGHLIGHT = re.compile(r"==([^=]+)==")
RE_CALLOUT = re.compile(r"^(\s*)>\s*\[!(\w+)\]([+-]?)\s*(.*)$")
RE_FM_DELIM = re.compile(r"^---\s*$")


def clean_wikilink(m):
    return m.group(2) or m.group(1)


def clean_callout(m):
    """Obsidian callout -> VitePress 容器"""
    indent, kind, fold, title = m.group(1), m.group(2).lower(), m.group(3), m.group(4).strip()
    mapping = {
        "note": "tip", "info": "info", "tip": "tip", "hint": "tip",
        "important": "tip", "warning": "warning", "caution": "warning",
        "danger": "danger", "error": "danger", "summary": "details",
        "abstract": "tip", "todo": "tip", "success": "tip",
        "question": "warning", "failure": "danger", "bug": "danger",
        "example": "details", "quote": "tip",
    }
    tag = mapping.get(kind, "tip")
    if tag == "details":
        return f"{indent}::: details {title or '展开'}"
    return f"{indent}::: {tag} {title}".rstrip()


def clean_text(lines, drop_regex):
    out = []
    in_front = False
    fm_count = 0
    for ln in lines:
        # 去掉源文件自带的 YAML frontmatter
        if RE_FM_DELIM.match(ln):
            fm_count += 1
            if fm_count == 1:
                in_front = True
                continue
            elif fm_count == 2:
                in_front = False
                continue
        if in_front:
            continue

        # 正则删除
        hit = False
        for rx in drop_regex:
            if re.match(rx, ln.strip()):
                hit = True
                break
        if hit:
            continue

        # callout
        m = RE_CALLOUT.match(ln)
        if m:
            out.append(clean_callout(m))
            continue

        ln = RE_WIKILINK.sub(clean_wikilink, ln)
        ln = RE_HIGHLIGHT.sub(r"**\1**", ln)
        out.append(ln)
    return out


def demote_headings(lines):
    """所有 ATX 标题降一级（# -> ##）。

    笔记里习惯用 `#` 做分节，在站点上会和文章主标题抢层级，
    因此统一降级，再由 frontmatter 的 title 生成唯一的 H1。
    不依赖代码块状态（源笔记常有未闭合的代码围栏，跟踪围栏会错位），
    代价是代码块内的 `#` 注释也会多一个 '#'，对阅读无实质影响。
    """
    out = []
    for ln in lines:
        m = re.match(r"^(#{1,5})(\s+)(\S.*)$", ln)
        if m:
            out.append("#" * (len(m.group(1)) + 1) + m.group(2) + m.group(3))
        else:
            out.append(ln)
    return out


def make_description(lines, limit=110):
    """从正文抽取一段干净的摘要"""
    buf = []
    for ln in lines:
        s = ln.strip()
        if not s:
            if buf:
                break
            continue
        if s.startswith(("#", "!", "|", ">", "```", ":::", "---", "-", "*", "1.")):
            if buf:
                break
            continue
        if s.startswith("http"):
            continue
        s = re.sub(r"\$\$.*?\$\$", "", s)
        s = re.sub(r"\$.*?\$", "", s)
        s = re.sub(r"\*\*|\*|`", "", s)
        buf.append(s)
        if len("".join(buf)) > limit:
            break
    desc = " ".join(buf).strip()
    desc = re.sub(r"\s+", " ", desc)
    if len(desc) > limit + 40:
        desc = desc[: limit + 40].rstrip("，。、；：,;: ") + "……"
    return desc


def get_mtime(path):
    return datetime.datetime.fromtimestamp(os.path.getmtime(path))


def yaml_str(val):
    """把任意字符串安全写成 YAML 双引号标量（含冒号/反斜杠也不会破坏解析）。"""
    s = str(val).replace("\\", "\\\\").replace('"', '\\"')
    s = s.replace("\n", " ").replace("\r", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return '"' + s + '"'


def build():
    report = []
    for a in A:
        parts = []
        newest = None
        for idx, (rel, rng) in enumerate(a["srcs"]):
            src = SRC_ROOT / rel
            if not src.exists():
                print(f"[缺失] {rel}")
                continue
            newest = max(newest or datetime.datetime.min, get_mtime(src))
            raw = src.read_text(encoding="utf-8", errors="replace").splitlines()
            if rng:
                raw = raw[rng[0] - 1: rng[1]]
            # 行区间删除（针对原始行号）
            drops = sorted(a["drops"], reverse=True)
            for (s, e) in drops:
                if idx == 0:
                    raw = raw[: s - 1] + raw[e:]
            body = clean_text(raw, a["drop_regex"])
            if a["sections"] and len(a["srcs"]) > 1:
                parts.append(f"\n## {a['sections'][idx]}\n")
            parts.extend(body)
            parts.append("")

        lines = demote_headings(parts)
        # 去掉开头空行
        while lines and not lines[0].strip():
            lines.pop(0)

        body_text = "\n".join(lines).strip()
        if len(body_text) < 200:
            print(f"[内容过短，跳过] {a['slug']} ({len(body_text)} 字符)")
            continue

        desc = make_description(lines)
        date = (newest or datetime.datetime.now()).strftime("%Y-%m-%d")

        fm = ["---", f"title: {yaml_str(a['title'])}", f"date: {date}"]
        if a["category"]:
            fm.append(f"category: {yaml_str(a['category'])}")
        if a["tags"]:
            fm.append("tags:")
            fm += [f"  - {yaml_str(t)}" for t in a["tags"]]
        if desc:
            fm.append(f"description: {yaml_str(desc)}")
        fm.append("---")

        out = OUT_ROOT / f"{a['slug']}.md"
        out.parent.mkdir(parents=True, exist_ok=True)

        content = "\n".join(fm) + "\n\n"
        content += f"# {a['title']}\n\n"
        if a["intro"]:
            content += f"> {a['intro']}\n\n"
        content += body_text + "\n"
        out.write_text(content, encoding="utf-8")

        h1n = sum(1 for l in lines if re.match(r"^#\s+\S", l))
        report.append((a["slug"], len(body_text), h1n, date))
        print(f"[OK] {a['slug']:<48} {len(body_text):>7} 字符  H1×{h1n}  {date}")

    print("\n" + "=" * 70)
    print(f"共生成 {len(report)} 篇文章")
    multi = [r for r in report if r[2] > 0]
    if multi:
        print(f"\n以下 {len(multi)} 篇正文含额外 H1（建议检查）：")
        for r in multi:
            print(f"  - {r[0]}  H1×{r[2]}")


if __name__ == "__main__":
    build()
