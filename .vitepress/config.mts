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
    'AI 研究方向的学习笔记与思考存档 —— 机制可解释性、生成模型、表征与世界模型，以及做研究的方法论。',
  head: [
    ['meta', { name: 'theme-color', content: '#2C6E8F' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
  ],
  lastUpdated: true,
  cleanUrls: true,

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

    nav: [
      { text: '首页', link: '/' },
      {
        text: '技术笔记',
        items: [
          { text: '机制可解释性', link: '/notes/interpretability/attribution-graphs' },
          { text: '生成模型', link: '/notes/generative/diffusion-models' },
          { text: '表征与世界模型', link: '/notes/representation/ssl-representation' },
          { text: '后训练', link: '/notes/post-training/post-training' },
          { text: '强化学习', link: '/notes/rl/rl-principles' },
          { text: '数学基础', link: '/notes/math/sde-primer' },
        ],
      },
      { text: '研究方法论', link: '/notes/methodology/benchmark-writing' },
      { text: '领域综述', link: '/notes/surveys/icml-decade' },
      { text: '视觉语言模型', link: '/notes/vlm/visual-encoding' },
      { text: '工程与应用', link: '/notes/engineering/python-pytorch' },
      { text: '随笔', link: '/notes/essays/complex-systems' },
      { text: '归档', link: '/archive' },
      { text: '关于', link: '/about' },
    ],

    sidebar: {
      '/notes/interpretability/': [
        {
          text: '机制可解释性',
          items: [
            { text: '机制可解释性是什么', link: '/notes/interpretability/what-is-mi' },
            { text: 'Transformer 的条件线性', link: '/notes/interpretability/conditional-linearity' },
            { text: '特权基', link: '/notes/interpretability/privileged-bases' },
            { text: '路径分解', link: '/notes/interpretability/path-decomposition' },
            { text: '电路分析入门', link: '/notes/interpretability/circuit-foundations' },
            { text: '路径级因果追踪', link: '/notes/interpretability/path-patching-eap-acdc' },
            { text: 'Causal Scrubbing 与 SAE', link: '/notes/interpretability/sae-and-causal-scrubbing' },
            { text: '前沿方法与综合工作流', link: '/notes/interpretability/circuit-methods-frontier' },
            { text: '归因图与特征分解', link: '/notes/interpretability/attribution-graphs' },
            { text: '可解释性全景框架', link: '/notes/interpretability/interpretability-map' },
            { text: '扩散模型的可解释性', link: '/notes/interpretability/diffusion-interpretability' },
            { text: '行为可解释性', link: '/notes/interpretability/behavioral-interpretability' },
            { text: '注意力分析', link: '/notes/interpretability/attention-analysis' },
          ],
        },
      ],
      '/notes/generative/': [
        {
          text: '生成模型',
          items: [
            { text: '扩散模型', link: '/notes/generative/diffusion-models' },
            { text: '扩散模型后训练', link: '/notes/generative/diffusion-post-training' },
            { text: '梯度流与流匹配', link: '/notes/generative/flow-and-gradient' },
            { text: '深度生成模型概览', link: '/notes/generative/deep-generative-models' },
          ],
        },
      ],
      '/notes/representation/': [
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
      '/notes/post-training/': [
        {
          text: '后训练与推理',
          items: [
            { text: '大模型后训练', link: '/notes/post-training/post-training' },
            { text: '后训练技术谱系', link: '/notes/post-training/post-training-techniques' },
            { text: '注意力之外', link: '/notes/post-training/beyond-attention' },
          ],
        },
      ],
      '/notes/rl/': [
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
      '/notes/math/': [
        {
          text: '数学基础',
          items: [
            { text: '随机微分方程入门', link: '/notes/math/sde-primer' },
            { text: '学习理论的数学', link: '/notes/math/math-for-learning' },
            { text: '数学概念解读', link: '/notes/math/math-interpretation' },
          ],
        },
      ],
      '/notes/methodology/': [
        {
          text: '研究方法论',
          items: [
            { text: 'Benchmark 论文写作', link: '/notes/methodology/benchmark-writing' },
            { text: '分析类论文如何有趣', link: '/notes/methodology/analysis-paper' },
            { text: '方法类论文的 Idea 生成', link: '/notes/methodology/idea-generation' },
            { text: 'AI 算法设计的底层逻辑', link: '/notes/methodology/algorithm-design' },
            { text: '方法类文章的实验观', link: '/notes/methodology/method-paper' },
            { text: '如何框定研究问题', link: '/notes/methodology/problem-scoping' },
            { text: '可靠性 Benchmark 研究', link: '/notes/methodology/reliability-benchmark' },
            { text: '审稿维度的系统梳理', link: '/notes/methodology/review-dimensions' },
            { text: '研究方向地图', link: '/notes/methodology/research-directions-map' },
            { text: '推理时优化方法分类体系', link: '/notes/methodology/training-free-inference-taxonomy' },
            { text: '本科生如何开启科研', link: '/notes/methodology/starting-research' },
            { text: '辨别真研究与跟风', link: '/notes/methodology/real-research-vs-padding' },
          ],
        },
      ],
      '/notes/surveys/': [
        {
          text: '领域综述',
          items: [
            { text: 'ICML 十年脉络', link: '/notes/surveys/icml-decade' },
            { text: 'CVPR 十年谈', link: '/notes/surveys/cvpr-decade' },
            { text: '图神经网络的演进', link: '/notes/surveys/gnn-evolution' },
            { text: '时间序列分析', link: '/notes/surveys/time-series' },
            { text: '从 NLP 到 LLM', link: '/notes/surveys/nlp-to-llm' },
            { text: '学界「抗幻觉」研究全史', link: '/notes/surveys/anti-hallucination' },
          ],
        },
      ],
      '/notes/essays/': [
        {
          text: '随笔',
          items: [
            { text: '复杂系统与计算不可约', link: '/notes/essays/complex-systems' },
            { text: '具身智能', link: '/notes/essays/embodied-intelligence' },
            { text: '尚未解决的开放问题', link: '/notes/essays/big-questions' },
            { text: '科学与工程的分野', link: '/notes/essays/science-vs-engineering' },
            { text: '复利思想与研究壁垒', link: '/notes/essays/hamming-compound' },
            { text: '以小博大的研究案例', link: '/notes/essays/lean-research' },
            { text: '如何选择研究方向', link: '/notes/essays/choose-direction' },
            { text: '路在何方', link: '/notes/essays/path-forward' },
            { text: '顶会论文该怎么读', link: '/notes/essays/research-judgment' },
            { text: '什么才算真正的科研贡献', link: '/notes/essays/what-counts-as-research' },
            { text: '科学作为天职（韦伯）', link: '/notes/essays/science-as-vocation' },
            { text: '人的不可替代价值', link: '/notes/essays/human-value-in-ai-era' },
            { text: '苦涩教训再解读', link: '/notes/essays/bitter-lesson-inductive-bias' },
          ],
        },
      ],
      '/notes/vlm/': [
        {
          text: '视觉语言模型',
          items: [
            { text: 'VLM 架构演进：从 CLIP 到 LLaVA', link: '/notes/vlm/architecture-evolution' },
            { text: 'VLM 视觉编码全解', link: '/notes/vlm/visual-encoding' },
            { text: 'VLM 评测基准梳理', link: '/notes/vlm/benchmarks' },
          ],
        },
      ],
      '/notes/engineering/': [
        {
          text: '工程与应用',
          items: [
            { text: 'Python 与 PyTorch 工程基础', link: '/notes/engineering/python-pytorch' },
            { text: 'AI 在金融领域的非平稳性难题', link: '/notes/engineering/ai-in-finance' },
          ],
        },
      ],
    },

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
