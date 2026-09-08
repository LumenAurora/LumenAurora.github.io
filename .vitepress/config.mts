import { defineConfig } from 'vitepress'
import { katex } from '@mdit/plugin-katex'

// 中文友好的本地搜索分词：英文按词，中文按字 + 二元组
function tokenize(text: string): string[] {
  const tokens: string[] = []
  const en = text.toLowerCase().match(/[a-z0-9]{1,}/g)
  if (en) tokens.push(...en)
  const zh = text.match(/[\u4e00-\u9fa5]/g)
  if (zh) {
    for (let i = 0; i < zh.length; i++) {
      tokens.push(zh[i])
      if (i + 1 < zh.length) tokens.push(zh[i] + zh[i + 1])
    }
  }
  return tokens
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'Changning Liu',
  titleTemplate: ':title · Changning Liu',
  description:
    'AI 研究方向的学习笔记与思考存档 —— 机制可解释性、生成模型、表征与世界模型、后训练，以及做研究的方法论与品味。',
  head: [
    ['meta', { name: 'theme-color', content: '#2C6E8F' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
  ],
  lastUpdated: true,
  cleanUrls: true,

  // drafts/ 是 build_notes.py 的「输入」目录（枢纽导读的原始稿），
  // 不是对外发布的页面。排除它，避免 VitePress 把草稿当页面编译，
  // 也避免草稿内的相对链接被当成死链导致构建失败。已发布的版本在 notes/ 下。
  srcExclude: ['**/drafts/**'],

  markdown: {
    // 渲染 LaTeX：$...$、$$...$$、\(...\)、\[...\]
    config(md) {
      md.use(katex, { delimiters: 'all', throwOnError: false, strict: false })
    },
    theme: { light: 'github-light', dark: 'github-dark' },
    lineNumbers: false,
  },

  themeConfig: {
    outline: { level: [2, 3], label: '本页目录' },
    lastUpdatedText: '最后更新',
    docFooter: { prev: '上一页', next: '下一页' },

    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: { tokenize },
          searchOptions: { boost: { title: 4, text: 2, titles: 1 } },
        },
        detailedView: true,
      },
      translations: {
        button: { buttonText: '搜索', buttonAriaLabel: '搜索文章' },
        modal: {
          noResultsText: '没有找到相关内容',
          resetButtonTitle: '清空',
          footer: {
            selectText: '选择',
            navigateText: '切换',
            closeText: '关闭',
          },
        },
      },
    },

    // 顶层导航：分组级入口，指向各导读枢纽页，避免与侧边栏重复罗列
    nav: [
      { text: '首页', link: '/' },
      { text: '研究主题', link: '/notes/interpretability/roadmap' },
      { text: '研究方法', link: '/notes/methodology/hub' },
      { text: '领域纵览', link: '/notes/surveys/hub' },
      { text: '思考', link: '/notes/essays/hub' },
      { text: '归档', link: '/archive' },
      { text: '关于', link: '/about' },
    ],

    // 全站共享的单一侧边栏：5 个一级组覆盖 13 个原分类，
    // 小类在导航层合并（生成+表征、后训练+RL、研究品味并入「思考」），文章路径不变。
    sidebar: [
      {
        text: '研究主题',
        collapsed: false,
        items: [
          {
            text: '机制可解释性',
            items: [
              {
                text: '机制可解释性 · 导读',
                items: [
                  { text: '学习路径总览（读这篇先）', link: '/notes/interpretability/roadmap' },
                ],
              },
              {
                text: '入门与基础',
                items: [
                  { text: '机制可解释性是什么', link: '/notes/interpretability/what-is-mi' },
                  { text: 'Transformer 的条件线性', link: '/notes/interpretability/conditional-linearity' },
                  { text: '特权基', link: '/notes/interpretability/privileged-bases' },
                  { text: '路径分解', link: '/notes/interpretability/path-decomposition' },
                ],
              },
              {
                text: '电路分析方法',
                items: [
                  { text: '电路分析入门', link: '/notes/interpretability/circuit-foundations' },
                  { text: '路径级因果追踪', link: '/notes/interpretability/path-patching-eap-acdc' },
                  { text: 'Causal Scrubbing 与 SAE', link: '/notes/interpretability/sae-and-causal-scrubbing' },
                  { text: '前沿方法与综合工作流', link: '/notes/interpretability/circuit-methods-frontier' },
                ],
              },
              {
                text: 'Anthropic 系统教程 · 归因图三部曲',
                items: [
                  { text: 'Anthropic 可解释性系统（七层路径）', link: '/notes/interpretability/anthropic-mi-system' },
                  { text: '替换模型与 Transcoder', link: '/notes/interpretability/replacement-model-transcoder' },
                  { text: '归因图入门（是什么/怎么衔接）', link: '/notes/interpretability/attribution-graphs' },
                  { text: '归因图构建（从替换模型到快照）', link: '/notes/interpretability/attribution-graph-deepdive' },
                  { text: '归因图解剖与因果配方', link: '/notes/interpretability/attribution-graph-anatomy' },
                  { text: '工具链、验证与实践', link: '/notes/interpretability/toolchain-validation-practice' },
                ],
              },
              {
                text: '直觉与心智图景',
                items: [
                  { text: '初学者的直觉：文献审查与修正', link: '/notes/interpretability/intuition-self-review' },
                  { text: 'LLM 与 VLM 的直觉世界模型', link: '/notes/interpretability/intuition-world-model' },
                  { text: 'LLM 与人类认知的深度类比', link: '/notes/interpretability/cognitive-science-analogies' },
                  { text: '训练过程的可解释性世界模型', link: '/notes/interpretability/developmental-interpretability' },
                ],
              },
              {
                text: '方法论与诊断',
                items: [
                  { text: '可解释性方法论的统一图景', link: '/notes/interpretability/unified-methodology' },
                  { text: '研究残差流 trivial 吗', link: '/notes/interpretability/residual-stream-trivial' },
                  { text: '从观察到好故事', link: '/notes/interpretability/observation-to-story' },
                  { text: '机制可解释性的「松散」诊断', link: '/notes/interpretability/mi-looseness-diagnosis' },
                  { text: 'VLM 七轴穷举框架', link: '/notes/interpretability/vlm-seven-axis' },
                  { text: 'VLM 可解释性学习路线', link: '/notes/interpretability/vlm-learning-roadmap' },
                ],
              },
              {
                text: '全景与方法',
                items: [
                  { text: '扩散模型的可解释性', link: '/notes/interpretability/diffusion-interpretability' },
                  { text: '行为可解释性', link: '/notes/interpretability/behavioral-interpretability' },
                  { text: '注意力分析', link: '/notes/interpretability/attention-analysis' },
                ],
              },
            ],
          },
          {
            text: '生成与表征',
            items: [
              {
                text: '生成模型',
                items: [
                  { text: '扩散模型', link: '/notes/generative/diffusion-models' },
                  { text: '扩散模型后训练', link: '/notes/generative/diffusion-post-training' },
                  { text: '梯度流与流匹配', link: '/notes/generative/flow-and-gradient' },
                  { text: '深度生成模型概览', link: '/notes/generative/deep-generative-models' },
                ],
              },
              {
                text: '表征与世界模型',
                items: [
                  { text: '自监督表征学习', link: '/notes/representation/ssl-representation' },
                  { text: '世界模型', link: '/notes/representation/world-models' },
                  { text: '隐式模型', link: '/notes/representation/implicit-models' },
                  { text: '自回归模型内部机制', link: '/notes/representation/autoregressive-internals' },
                ],
              },
            ],
          },
          {
            text: '后训练与强化学习',
            items: [
              {
                text: '后训练与推理',
                items: [
                  { text: '大模型后训练', link: '/notes/post-training/post-training' },
                  { text: '后训练技术谱系', link: '/notes/post-training/post-training-techniques' },
                  { text: '注意力之外', link: '/notes/post-training/beyond-attention' },
                ],
              },
              {
                text: '强化学习',
                items: [
                  { text: '强化学习纲要', link: '/notes/rl/rl-principles' },
                  { text: 'RL 通识长文', link: '/notes/rl/rl-book-of-ai' },
                  { text: '人为什么靠 RL 学会打麻将', link: '/notes/rl/why-human-rl' },
                  { text: 'RL 与监督学习之别', link: '/notes/rl/rl-vs-supervised' },
                ],
              },
            ],
          },
          {
            text: '视觉语言模型',
            items: [
              { text: 'VLM 架构演进：从 CLIP 到 LLaVA', link: '/notes/vlm/architecture-evolution' },
              { text: 'VLM 视觉编码全解', link: '/notes/vlm/visual-encoding' },
              { text: 'VLM 评测基准梳理', link: '/notes/vlm/benchmarks' },
            ],
          },
        ],
      },
      {
        text: '研究方法',
        collapsed: false,
        items: [
          {
            text: '研究方法论',
            items: [
              {
                text: '研究方法论 · 导读',
                items: [
                  { text: '研究方法论总览（读这篇先）', link: '/notes/methodology/hub' },
                ],
              },
              {
                text: '论文写作',
                items: [
                  { text: 'Benchmark 论文写作', link: '/notes/methodology/benchmark-writing' },
                  { text: '方法类论文的 Idea 生成', link: '/notes/methodology/idea-generation' },
                  { text: 'AI 算法设计的底层逻辑', link: '/notes/methodology/algorithm-design' },
                  { text: '方法类文章的实验观', link: '/notes/methodology/method-paper' },
                  { text: '如何框定研究问题', link: '/notes/methodology/problem-scoping' },
                ],
              },
              {
                text: '评测与审稿',
                items: [
                  { text: '可靠性 Benchmark 研究', link: '/notes/methodology/reliability-benchmark' },
                  { text: '审稿维度的系统梳理', link: '/notes/methodology/review-dimensions' },
                ],
              },
              {
                text: '方向与地图',
                items: [
                  { text: '研究方向地图', link: '/notes/methodology/research-directions-map' },
                  { text: '推理时优化方法分类体系', link: '/notes/methodology/training-free-inference-taxonomy' },
                  { text: '本科生如何开启科研', link: '/notes/methodology/starting-research' },
                  { text: '辨别真研究与跟风', link: '/notes/methodology/real-research-vs-padding' },
                ],
              },
            ],
          },
        ],
      },
      {
        text: '领域纵览与基础',
        collapsed: false,
        items: [
          {
            text: '领域综述',
            items: [
              { text: '领域综述导读（读这篇先）', link: '/notes/surveys/hub' },
              { text: 'ICML 十年脉络', link: '/notes/surveys/icml-decade' },
              { text: 'CVPR 十年谈', link: '/notes/surveys/cvpr-decade' },
              { text: '图神经网络的演进', link: '/notes/surveys/gnn-evolution' },
              { text: '时间序列分析', link: '/notes/surveys/time-series' },
              { text: '从 NLP 到 LLM', link: '/notes/surveys/nlp-to-llm' },
              { text: '学界「抗幻觉」研究全史', link: '/notes/surveys/anti-hallucination' },
              { text: '迁移学习族谱与 TTA 定位', link: '/notes/surveys/transfer-learning-tta' },
            ],
          },
          {
            text: '机器学习理论',
            items: [
              {
                text: '机器学习理论 · 导读',
                items: [
                  { text: '精读路径总览（读这篇先）', link: '/notes/ml-theory/roadmap' },
                ],
              },
              {
                text: '以数学观之',
                items: [
                  { text: '数学工具对应关系', link: '/notes/ml-theory/math-viewpoint' },
                ],
              },
              {
                text: '第二章 A Gentle Start',
                items: [
                  { text: '（一）从世界模型到形式化框架', link: '/notes/ml-theory/ch2-world-model-framework' },
                  { text: '（二）真实风险、经验风险与 ERM', link: '/notes/ml-theory/ch2-risk-and-erm' },
                  { text: '（三）过拟合的本质与归纳偏置', link: '/notes/ml-theory/ch2-overfitting-inductive-bias' },
                  { text: '（四）有限假设类的泛化保证', link: '/notes/ml-theory/ch2-finite-generalization-proof' },
                ],
              },
              {
                text: '第三章 A Formal Learning Model',
                items: [
                  { text: '（一）PAC 学习：从能泛化到可学习', link: '/notes/ml-theory/ch3-pac-definition' },
                  { text: '（二）Sample Complexity 与 Agnostic PAC', link: '/notes/ml-theory/ch3-sample-complexity-agnostic' },
                  { text: '（三）Bayes Optimal 与 Agnostic PAC', link: '/notes/ml-theory/ch3-bayes-agnostic-pac' },
                  { text: '（四）General Loss 与 Proper/Improper', link: '/notes/ml-theory/ch3-general-loss' },
                ],
              },
              {
                text: '第四章 Learning via Uniform Convergence',
                items: [
                  { text: '（一）动机与 ε-representative', link: '/notes/ml-theory/ch4-motivation-representative' },
                  { text: '（二）核心引理与有限类证明', link: '/notes/ml-theory/ch4-core-lemma-uc-finite' },
                  { text: '（三）Hoeffding 不等式', link: '/notes/ml-theory/ch4-hoeffding' },
                  { text: '（四）放回 ML、Union Bound 与样本复杂度', link: '/notes/ml-theory/ch4-back-to-ml-union-bound' },
                  { text: '（五）证明工具箱与适用边界', link: '/notes/ml-theory/ch4-toolbox-applicability' },
                ],
              },
              {
                text: '习题与延展（附录）',
                items: [
                  { text: '第二章（五）延展、层次塔与习题', link: '/notes/ml-theory/ch2-extensions-exercises' },
                  { text: '第三章（五）证明工具箱、习题与压缩', link: '/notes/ml-theory/ch3-proof-tools-exercises' },
                  { text: '第四章（六）Discretization、习题与压缩', link: '/notes/ml-theory/ch4-discretization-exercises' },
                ],
              },
            ],
          },
          {
            text: '数学基础',
            items: [
              { text: '随机微分方程入门', link: '/notes/math/sde-primer' },
              { text: '学习理论的数学', link: '/notes/math/math-for-learning' },
              { text: '数学概念解读', link: '/notes/math/math-interpretation' },
            ],
          },
        ],
      },
      {
        text: '思考',
        collapsed: false,
        items: [
          {
            text: '随笔',
            items: [
              {
                text: '随笔 · 导读',
                items: [
                  { text: '随笔总览（读这篇先）', link: '/notes/essays/hub' },
                ],
              },
              {
                text: '科研心态与方向',
                items: [
                  { text: '如何选择研究方向', link: '/notes/essays/choose-direction' },
                  { text: '路在何方', link: '/notes/essays/path-forward' },
                  { text: '顶会论文该怎么读', link: '/notes/essays/research-judgment' },
                  { text: '什么才算真正的科研贡献', link: '/notes/essays/what-counts-as-research' },
                  { text: '复利思想与研究壁垒', link: '/notes/essays/hamming-compound' },
                  { text: '以小博大的研究案例', link: '/notes/essays/lean-research' },
                ],
              },
              {
                text: '科学哲学',
                items: [
                  { text: '科学与工程的分野', link: '/notes/essays/science-vs-engineering' },
                  { text: '科学作为天职（韦伯）', link: '/notes/essays/science-as-vocation' },
                  { text: '尚未解决的开放问题', link: '/notes/essays/big-questions' },
                  { text: '苦涩教训再解读', link: '/notes/essays/bitter-lesson-inductive-bias' },
                ],
              },
              {
                text: '技术与社会',
                items: [
                  { text: '复杂系统与计算不可约', link: '/notes/essays/complex-systems' },
                  { text: '具身智能', link: '/notes/essays/embodied-intelligence' },
                  { text: '人的不可替代价值', link: '/notes/essays/human-value-in-ai-era' },
                ],
              },
            ],
          },
          {
            text: '研究品味',
            items: [
              { text: '什么是「有趣」的研究', link: '/notes/research-taste/what-is-interesting' },
              { text: '顶会分析论文做对了什么', link: '/notes/research-taste/classic-analyses' },
              { text: '如何自上而下产生课题', link: '/notes/research-taste/topic-generation' },
              { text: '大模型时代的「有趣」', link: '/notes/research-taste/foundation-era' },
              { text: '分析类论文的 18 个句法骨架', link: '/notes/research-taste/sentence-patterns' },
            ],
          },
        ],
      },
      {
        text: '工程与应用',
        collapsed: false,
        items: [
          { text: 'Python 与 PyTorch 工程基础', link: '/notes/engineering/python-pytorch' },
          { text: 'AI 在金融领域的非平稳性难题', link: '/notes/engineering/ai-in-finance' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/LumenAurora' }],

    footer: {
      message: '基于个人笔记整理 · 内容仅代表阶段性理解',
      copyright: 'Copyright © 2026 Changning Liu',
    },

    editLink: {
      pattern: 'https://github.com/LumenAurora/LumenAurora.github.io/edit/main/:path',
      text: '在 GitHub 上编辑此页',
    },
  },
})
