// .vitepress/config.mts
import { defineConfig } from "file:///D:/1A%E6%95%B0%E6%8D%AE%E6%96%87%E4%BB%B6%E5%A4%B9/GitHub/LumenAurora.github.io/node_modules/vitepress/dist/node/index.js";
import { katex } from "file:///D:/1A%E6%95%B0%E6%8D%AE%E6%96%87%E4%BB%B6%E5%A4%B9/GitHub/LumenAurora.github.io/node_modules/@mdit/plugin-katex/dist/index.js";
function tokenize(text) {
  const tokens = [];
  const en = text.toLowerCase().match(/[a-z0-9]{1,}/g);
  if (en) tokens.push(...en);
  const zh = text.match(/[\u4e00-\u9fa5]/g);
  if (zh) {
    for (let i = 0; i < zh.length; i++) {
      tokens.push(zh[i]);
      if (i + 1 < zh.length) tokens.push(zh[i] + zh[i + 1]);
    }
  }
  return tokens;
}
var config_default = defineConfig({
  lang: "zh-CN",
  title: "Changning Liu",
  titleTemplate: ":title \xB7 Changning Liu",
  description: "AI \u7814\u7A76\u65B9\u5411\u7684\u5B66\u4E60\u7B14\u8BB0\u4E0E\u601D\u8003\u5B58\u6863 \u2014\u2014 \u673A\u5236\u53EF\u89E3\u91CA\u6027\u3001\u751F\u6210\u6A21\u578B\u3001\u8868\u5F81\u4E0E\u4E16\u754C\u6A21\u578B\u3001\u540E\u8BAD\u7EC3\uFF0C\u4EE5\u53CA\u505A\u7814\u7A76\u7684\u65B9\u6CD5\u8BBA\u4E0E\u54C1\u5473\u3002",
  head: [
    ["meta", { name: "theme-color", content: "#2C6E8F" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }]
  ],
  lastUpdated: true,
  cleanUrls: true,
  // drafts/ 是 build_notes.py 的「输入」目录（枢纽导读的原始稿），
  // 不是对外发布的页面。排除它，避免 VitePress 把草稿当页面编译，
  // 也避免草稿内的相对链接被当成死链导致构建失败。已发布的版本在 notes/ 下。
  srcExclude: ["**/drafts/**"],
  markdown: {
    // 渲染 LaTeX：$...$、$$...$$、\(...\)、\[...\]
    config(md) {
      md.use(katex, { delimiters: "all", throwOnError: false, strict: false });
    },
    theme: { light: "github-light", dark: "github-dark" },
    lineNumbers: false
  },
  themeConfig: {
    outline: { level: [2, 3], label: "\u672C\u9875\u76EE\u5F55" },
    lastUpdatedText: "\u6700\u540E\u66F4\u65B0",
    docFooter: { prev: "\u4E0A\u4E00\u9875", next: "\u4E0B\u4E00\u9875" },
    search: {
      provider: "local",
      options: {
        miniSearch: {
          options: { tokenize },
          searchOptions: { boost: { title: 4, text: 2, titles: 1 } }
        },
        detailedView: true
      },
      translations: {
        button: { buttonText: "\u641C\u7D22", buttonAriaLabel: "\u641C\u7D22\u6587\u7AE0" },
        modal: {
          noResultsText: "\u6CA1\u6709\u627E\u5230\u76F8\u5173\u5185\u5BB9",
          resetButtonTitle: "\u6E05\u7A7A",
          footer: {
            selectText: "\u9009\u62E9",
            navigateText: "\u5207\u6362",
            closeText: "\u5173\u95ED"
          }
        }
      }
    },
    // 顶层导航：分组级入口，指向各导读枢纽页，避免与侧边栏重复罗列
    nav: [
      { text: "\u9996\u9875", link: "/" },
      { text: "\u7814\u7A76\u4E3B\u9898", link: "/notes/interpretability/roadmap" },
      { text: "\u7814\u7A76\u65B9\u6CD5", link: "/notes/methodology/hub" },
      { text: "\u9886\u57DF\u7EB5\u89C8", link: "/notes/surveys/hub" },
      { text: "\u601D\u8003", link: "/notes/essays/hub" },
      { text: "\u7CBE\u9009", link: "/notes/essays/featured" },
      { text: "\u5F52\u6863", link: "/archive" },
      { text: "\u5173\u4E8E", link: "/about" }
    ],
    // 全站共享的单一侧边栏：5 个一级组覆盖 13 个原分类，
    // 小类在导航层合并（生成+表征、后训练+RL、研究品味并入「思考」），文章路径不变。
    sidebar: [
      {
        text: "\u7814\u7A76\u4E3B\u9898",
        collapsed: false,
        items: [
          {
            text: "\u673A\u5236\u53EF\u89E3\u91CA\u6027",
            items: [
              {
                text: "\u673A\u5236\u53EF\u89E3\u91CA\u6027 \xB7 \u5BFC\u8BFB",
                items: [
                  { text: "\u5B66\u4E60\u8DEF\u5F84\u603B\u89C8\uFF08\u8BFB\u8FD9\u7BC7\u5148\uFF09", link: "/notes/interpretability/roadmap" }
                ]
              },
              {
                text: "\u5165\u95E8\u4E0E\u57FA\u7840",
                items: [
                  { text: "\u673A\u5236\u53EF\u89E3\u91CA\u6027\u662F\u4EC0\u4E48", link: "/notes/interpretability/what-is-mi" },
                  { text: "Transformer \u7684\u6761\u4EF6\u7EBF\u6027", link: "/notes/interpretability/conditional-linearity" },
                  { text: "\u7279\u6743\u57FA", link: "/notes/interpretability/privileged-bases" },
                  { text: "\u8DEF\u5F84\u5206\u89E3", link: "/notes/interpretability/path-decomposition" }
                ]
              },
              {
                text: "\u7535\u8DEF\u5206\u6790\u65B9\u6CD5",
                items: [
                  { text: "\u7535\u8DEF\u5206\u6790\u5165\u95E8", link: "/notes/interpretability/circuit-foundations" },
                  { text: "\u8DEF\u5F84\u7EA7\u56E0\u679C\u8FFD\u8E2A", link: "/notes/interpretability/path-patching-eap-acdc" },
                  { text: "Causal Scrubbing \u4E0E SAE", link: "/notes/interpretability/sae-and-causal-scrubbing" },
                  { text: "\u524D\u6CBF\u65B9\u6CD5\u4E0E\u7EFC\u5408\u5DE5\u4F5C\u6D41", link: "/notes/interpretability/circuit-methods-frontier" }
                ]
              },
              {
                text: "Anthropic \u7CFB\u7EDF\u6559\u7A0B \xB7 \u5F52\u56E0\u56FE\u4E09\u90E8\u66F2",
                items: [
                  { text: "Anthropic \u53EF\u89E3\u91CA\u6027\u7CFB\u7EDF\uFF08\u4E03\u5C42\u8DEF\u5F84\uFF09", link: "/notes/interpretability/anthropic-mi-system" },
                  { text: "\u66FF\u6362\u6A21\u578B\u4E0E Transcoder", link: "/notes/interpretability/replacement-model-transcoder" },
                  { text: "\u5F52\u56E0\u56FE\u5165\u95E8\uFF08\u662F\u4EC0\u4E48/\u600E\u4E48\u8854\u63A5\uFF09", link: "/notes/interpretability/attribution-graphs" },
                  { text: "\u5F52\u56E0\u56FE\u6784\u5EFA\uFF08\u4ECE\u66FF\u6362\u6A21\u578B\u5230\u5FEB\u7167\uFF09", link: "/notes/interpretability/attribution-graph-deepdive" },
                  { text: "\u5F52\u56E0\u56FE\u89E3\u5256\u4E0E\u56E0\u679C\u914D\u65B9", link: "/notes/interpretability/attribution-graph-anatomy" },
                  { text: "\u5DE5\u5177\u94FE\u3001\u9A8C\u8BC1\u4E0E\u5B9E\u8DF5", link: "/notes/interpretability/toolchain-validation-practice" }
                ]
              },
              {
                text: "\u76F4\u89C9\u4E0E\u5FC3\u667A\u56FE\u666F",
                items: [
                  { text: "\u521D\u5B66\u8005\u7684\u76F4\u89C9\uFF1A\u6587\u732E\u5BA1\u67E5\u4E0E\u4FEE\u6B63", link: "/notes/interpretability/intuition-self-review" },
                  { text: "LLM \u4E0E VLM \u7684\u76F4\u89C9\u4E16\u754C\u6A21\u578B", link: "/notes/interpretability/intuition-world-model" },
                  { text: "LLM \u4E0E\u4EBA\u7C7B\u8BA4\u77E5\u7684\u6DF1\u5EA6\u7C7B\u6BD4", link: "/notes/interpretability/cognitive-science-analogies" },
                  { text: "\u8BAD\u7EC3\u8FC7\u7A0B\u7684\u53EF\u89E3\u91CA\u6027\u4E16\u754C\u6A21\u578B", link: "/notes/interpretability/developmental-interpretability" }
                ]
              },
              {
                text: "\u65B9\u6CD5\u8BBA\u4E0E\u8BCA\u65AD",
                items: [
                  { text: "\u53EF\u89E3\u91CA\u6027\u65B9\u6CD5\u8BBA\u7684\u7EDF\u4E00\u56FE\u666F", link: "/notes/interpretability/unified-methodology" },
                  { text: "\u7814\u7A76\u6B8B\u5DEE\u6D41 trivial \u5417", link: "/notes/interpretability/residual-stream-trivial" },
                  { text: "\u4ECE\u89C2\u5BDF\u5230\u597D\u6545\u4E8B", link: "/notes/interpretability/observation-to-story" },
                  { text: "\u673A\u5236\u53EF\u89E3\u91CA\u6027\u7684\u300C\u677E\u6563\u300D\u8BCA\u65AD", link: "/notes/interpretability/mi-looseness-diagnosis" },
                  { text: "VLM \u4E03\u8F74\u7A77\u4E3E\u6846\u67B6", link: "/notes/interpretability/vlm-seven-axis" },
                  { text: "VLM \u53EF\u89E3\u91CA\u6027\u5B66\u4E60\u8DEF\u7EBF", link: "/notes/interpretability/vlm-learning-roadmap" }
                ]
              },
              {
                text: "\u5168\u666F\u4E0E\u65B9\u6CD5",
                items: [
                  { text: "\u6269\u6563\u6A21\u578B\u7684\u53EF\u89E3\u91CA\u6027", link: "/notes/interpretability/diffusion-interpretability" },
                  { text: "\u884C\u4E3A\u53EF\u89E3\u91CA\u6027", link: "/notes/interpretability/behavioral-interpretability" },
                  { text: "\u6CE8\u610F\u529B\u5206\u6790", link: "/notes/interpretability/attention-analysis" }
                ]
              }
            ]
          },
          {
            text: "\u751F\u6210\u4E0E\u8868\u5F81",
            items: [
              {
                text: "\u751F\u6210\u6A21\u578B",
                items: [
                  { text: "\u6269\u6563\u6A21\u578B", link: "/notes/generative/diffusion-models" },
                  { text: "\u6269\u6563\u6A21\u578B\u540E\u8BAD\u7EC3", link: "/notes/generative/diffusion-post-training" },
                  { text: "\u68AF\u5EA6\u6D41\u4E0E\u6D41\u5339\u914D", link: "/notes/generative/flow-and-gradient" },
                  { text: "\u6DF1\u5EA6\u751F\u6210\u6A21\u578B\u6982\u89C8", link: "/notes/generative/deep-generative-models" }
                ]
              },
              {
                text: "\u8868\u5F81\u4E0E\u4E16\u754C\u6A21\u578B",
                items: [
                  { text: "\u81EA\u76D1\u7763\u8868\u5F81\u5B66\u4E60", link: "/notes/representation/ssl-representation" },
                  { text: "\u4E16\u754C\u6A21\u578B", link: "/notes/representation/world-models" },
                  { text: "\u9690\u5F0F\u6A21\u578B", link: "/notes/representation/implicit-models" },
                  { text: "\u81EA\u56DE\u5F52\u6A21\u578B\u5185\u90E8\u673A\u5236", link: "/notes/representation/autoregressive-internals" }
                ]
              }
            ]
          },
          {
            text: "\u540E\u8BAD\u7EC3\u4E0E\u5F3A\u5316\u5B66\u4E60",
            items: [
              {
                text: "\u540E\u8BAD\u7EC3\u4E0E\u63A8\u7406",
                items: [
                  { text: "\u5927\u6A21\u578B\u540E\u8BAD\u7EC3", link: "/notes/post-training/post-training" },
                  { text: "\u540E\u8BAD\u7EC3\u6280\u672F\u8C31\u7CFB", link: "/notes/post-training/post-training-techniques" },
                  { text: "\u6CE8\u610F\u529B\u4E4B\u5916", link: "/notes/post-training/beyond-attention" }
                ]
              },
              {
                text: "\u5F3A\u5316\u5B66\u4E60",
                items: [
                  { text: "\u5F3A\u5316\u5B66\u4E60\u7EB2\u8981", link: "/notes/rl/rl-principles" },
                  { text: "RL \u901A\u8BC6\u957F\u6587", link: "/notes/rl/rl-book-of-ai" },
                  { text: "\u4EBA\u4E3A\u4EC0\u4E48\u9760 RL \u5B66\u4F1A\u6253\u9EBB\u5C06", link: "/notes/rl/why-human-rl" },
                  { text: "RL \u4E0E\u76D1\u7763\u5B66\u4E60\u4E4B\u522B", link: "/notes/rl/rl-vs-supervised" }
                ]
              }
            ]
          },
          {
            text: "\u89C6\u89C9\u8BED\u8A00\u6A21\u578B",
            items: [
              { text: "VLM \u67B6\u6784\u6F14\u8FDB\uFF1A\u4ECE CLIP \u5230 LLaVA", link: "/notes/vlm/architecture-evolution" },
              { text: "VLM \u89C6\u89C9\u7F16\u7801\u5168\u89E3", link: "/notes/vlm/visual-encoding" },
              { text: "VLM \u8BC4\u6D4B\u57FA\u51C6\u68B3\u7406", link: "/notes/vlm/benchmarks" }
            ]
          }
        ]
      },
      {
        text: "\u7814\u7A76\u65B9\u6CD5",
        collapsed: false,
        items: [
          {
            text: "\u7814\u7A76\u65B9\u6CD5\u8BBA",
            items: [
              {
                text: "\u7814\u7A76\u65B9\u6CD5\u8BBA \xB7 \u5BFC\u8BFB",
                items: [
                  { text: "\u7814\u7A76\u65B9\u6CD5\u8BBA\u603B\u89C8\uFF08\u8BFB\u8FD9\u7BC7\u5148\uFF09", link: "/notes/methodology/hub" }
                ]
              },
              {
                text: "\u8BBA\u6587\u5199\u4F5C",
                items: [
                  { text: "Benchmark \u8BBA\u6587\u5199\u4F5C", link: "/notes/methodology/benchmark-writing" },
                  { text: "\u65B9\u6CD5\u7C7B\u8BBA\u6587\u7684 Idea \u751F\u6210", link: "/notes/methodology/idea-generation" },
                  { text: "AI \u7B97\u6CD5\u8BBE\u8BA1\u7684\u5E95\u5C42\u903B\u8F91", link: "/notes/methodology/algorithm-design" },
                  { text: "\u65B9\u6CD5\u7C7B\u6587\u7AE0\u7684\u5B9E\u9A8C\u89C2", link: "/notes/methodology/method-paper" },
                  { text: "\u5982\u4F55\u6846\u5B9A\u7814\u7A76\u95EE\u9898", link: "/notes/methodology/problem-scoping" }
                ]
              },
              {
                text: "\u8BC4\u6D4B\u4E0E\u5BA1\u7A3F",
                items: [
                  { text: "\u53EF\u9760\u6027 Benchmark \u7814\u7A76", link: "/notes/methodology/reliability-benchmark" },
                  { text: "\u5BA1\u7A3F\u7EF4\u5EA6\u7684\u7CFB\u7EDF\u68B3\u7406", link: "/notes/methodology/review-dimensions" }
                ]
              },
              {
                text: "\u65B9\u5411\u4E0E\u5730\u56FE",
                items: [
                  { text: "\u7814\u7A76\u65B9\u5411\u5730\u56FE", link: "/notes/methodology/research-directions-map" },
                  { text: "\u63A8\u7406\u65F6\u4F18\u5316\u65B9\u6CD5\u5206\u7C7B\u4F53\u7CFB", link: "/notes/methodology/training-free-inference-taxonomy" },
                  { text: "\u672C\u79D1\u751F\u5982\u4F55\u5F00\u542F\u79D1\u7814", link: "/notes/methodology/starting-research" },
                  { text: "\u8FA8\u522B\u771F\u7814\u7A76\u4E0E\u8DDF\u98CE", link: "/notes/methodology/real-research-vs-padding" }
                ]
              }
            ]
          }
        ]
      },
      {
        text: "\u9886\u57DF\u7EB5\u89C8\u4E0E\u57FA\u7840",
        collapsed: false,
        items: [
          {
            text: "\u9886\u57DF\u7EFC\u8FF0",
            items: [
              { text: "\u9886\u57DF\u7EFC\u8FF0\u5BFC\u8BFB\uFF08\u8BFB\u8FD9\u7BC7\u5148\uFF09", link: "/notes/surveys/hub" },
              { text: "ICML \u5341\u5E74\u8109\u7EDC", link: "/notes/surveys/icml-decade" },
              { text: "CVPR \u5341\u5E74\u8C08", link: "/notes/surveys/cvpr-decade" },
              { text: "\u56FE\u795E\u7ECF\u7F51\u7EDC\u7684\u6F14\u8FDB", link: "/notes/surveys/gnn-evolution" },
              { text: "\u65F6\u95F4\u5E8F\u5217\u5206\u6790", link: "/notes/surveys/time-series" },
              { text: "\u4ECE NLP \u5230 LLM", link: "/notes/surveys/nlp-to-llm" },
              { text: "\u5B66\u754C\u300C\u6297\u5E7B\u89C9\u300D\u7814\u7A76\u5168\u53F2", link: "/notes/surveys/anti-hallucination" },
              { text: "\u8FC1\u79FB\u5B66\u4E60\u65CF\u8C31\u4E0E TTA \u5B9A\u4F4D", link: "/notes/surveys/transfer-learning-tta" }
            ]
          },
          {
            text: "\u673A\u5668\u5B66\u4E60\u7406\u8BBA",
            items: [
              {
                text: "\u673A\u5668\u5B66\u4E60\u7406\u8BBA \xB7 \u5BFC\u8BFB",
                items: [
                  { text: "\u7CBE\u8BFB\u8DEF\u5F84\u603B\u89C8\uFF08\u8BFB\u8FD9\u7BC7\u5148\uFF09", link: "/notes/ml-theory/roadmap" }
                ]
              },
              {
                text: "\u4EE5\u6570\u5B66\u89C2\u4E4B",
                items: [
                  { text: "\u6570\u5B66\u5DE5\u5177\u5BF9\u5E94\u5173\u7CFB", link: "/notes/ml-theory/math-viewpoint" }
                ]
              },
              {
                text: "\u7B2C\u4E8C\u7AE0 A Gentle Start",
                items: [
                  { text: "\uFF08\u4E00\uFF09\u4ECE\u4E16\u754C\u6A21\u578B\u5230\u5F62\u5F0F\u5316\u6846\u67B6", link: "/notes/ml-theory/ch2-world-model-framework" },
                  { text: "\uFF08\u4E8C\uFF09\u771F\u5B9E\u98CE\u9669\u3001\u7ECF\u9A8C\u98CE\u9669\u4E0E ERM", link: "/notes/ml-theory/ch2-risk-and-erm" },
                  { text: "\uFF08\u4E09\uFF09\u8FC7\u62DF\u5408\u7684\u672C\u8D28\u4E0E\u5F52\u7EB3\u504F\u7F6E", link: "/notes/ml-theory/ch2-overfitting-inductive-bias" },
                  { text: "\uFF08\u56DB\uFF09\u6709\u9650\u5047\u8BBE\u7C7B\u7684\u6CDB\u5316\u4FDD\u8BC1", link: "/notes/ml-theory/ch2-finite-generalization-proof" }
                ]
              },
              {
                text: "\u7B2C\u4E09\u7AE0 A Formal Learning Model",
                items: [
                  { text: "\uFF08\u4E00\uFF09PAC \u5B66\u4E60\uFF1A\u4ECE\u80FD\u6CDB\u5316\u5230\u53EF\u5B66\u4E60", link: "/notes/ml-theory/ch3-pac-definition" },
                  { text: "\uFF08\u4E8C\uFF09Sample Complexity \u4E0E Agnostic PAC", link: "/notes/ml-theory/ch3-sample-complexity-agnostic" },
                  { text: "\uFF08\u4E09\uFF09Bayes Optimal \u4E0E Agnostic PAC", link: "/notes/ml-theory/ch3-bayes-agnostic-pac" },
                  { text: "\uFF08\u56DB\uFF09General Loss \u4E0E Proper/Improper", link: "/notes/ml-theory/ch3-general-loss" }
                ]
              },
              {
                text: "\u7B2C\u56DB\u7AE0 Learning via Uniform Convergence",
                items: [
                  { text: "\uFF08\u4E00\uFF09\u52A8\u673A\u4E0E \u03B5-representative", link: "/notes/ml-theory/ch4-motivation-representative" },
                  { text: "\uFF08\u4E8C\uFF09\u6838\u5FC3\u5F15\u7406\u4E0E\u6709\u9650\u7C7B\u8BC1\u660E", link: "/notes/ml-theory/ch4-core-lemma-uc-finite" },
                  { text: "\uFF08\u4E09\uFF09Hoeffding \u4E0D\u7B49\u5F0F", link: "/notes/ml-theory/ch4-hoeffding" },
                  { text: "\uFF08\u56DB\uFF09\u653E\u56DE ML\u3001Union Bound \u4E0E\u6837\u672C\u590D\u6742\u5EA6", link: "/notes/ml-theory/ch4-back-to-ml-union-bound" },
                  { text: "\uFF08\u4E94\uFF09\u8BC1\u660E\u5DE5\u5177\u7BB1\u4E0E\u9002\u7528\u8FB9\u754C", link: "/notes/ml-theory/ch4-toolbox-applicability" }
                ]
              },
              {
                text: "\u4E60\u9898\u4E0E\u5EF6\u5C55\uFF08\u9644\u5F55\uFF09",
                items: [
                  { text: "\u7B2C\u4E8C\u7AE0\uFF08\u4E94\uFF09\u5EF6\u5C55\u3001\u5C42\u6B21\u5854\u4E0E\u4E60\u9898", link: "/notes/ml-theory/ch2-extensions-exercises" },
                  { text: "\u7B2C\u4E09\u7AE0\uFF08\u4E94\uFF09\u8BC1\u660E\u5DE5\u5177\u7BB1\u3001\u4E60\u9898\u4E0E\u538B\u7F29", link: "/notes/ml-theory/ch3-proof-tools-exercises" },
                  { text: "\u7B2C\u56DB\u7AE0\uFF08\u516D\uFF09Discretization\u3001\u4E60\u9898\u4E0E\u538B\u7F29", link: "/notes/ml-theory/ch4-discretization-exercises" }
                ]
              }
            ]
          },
          {
            text: "\u6570\u5B66\u57FA\u7840",
            items: [
              { text: "\u968F\u673A\u5FAE\u5206\u65B9\u7A0B\u5165\u95E8", link: "/notes/math/sde-primer" },
              { text: "\u5B66\u4E60\u7406\u8BBA\u7684\u6570\u5B66", link: "/notes/math/math-for-learning" },
              { text: "\u6570\u5B66\u6982\u5FF5\u89E3\u8BFB", link: "/notes/math/math-interpretation" }
            ]
          }
        ]
      },
      {
        text: "\u601D\u8003",
        collapsed: false,
        items: [
          {
            text: "\u968F\u7B14",
            items: [
              {
                text: "\u968F\u7B14 \xB7 \u5BFC\u8BFB",
                items: [
                  { text: "\u968F\u7B14\u603B\u89C8\uFF08\u8BFB\u8FD9\u7BC7\u5148\uFF09", link: "/notes/essays/hub" }
                ]
              },
              {
                text: "\u65B9\u5411\u5730\u56FE\uFF08\u4ECE\u8FD9\u91CC\u5F00\u59CB\uFF09",
                items: [
                  { text: "AI \u4E13\u4E1A\u5B66\u4E60\u5386\u7A0B\u4E0E\u65B9\u5411\u5730\u56FE", link: "/notes/essays/roadmap" }
                ]
              },
              {
                text: "\u79D1\u7814\u5FC3\u6001\u4E0E\u65B9\u5411",
                items: [
                  { text: "\u5982\u4F55\u9009\u62E9\u7814\u7A76\u65B9\u5411", link: "/notes/essays/choose-direction" },
                  { text: "\u5148\u8DEF", link: "/notes/essays/roadmap" },
                  { text: "\u9876\u4F1A\u8BBA\u6587\u8BE5\u600E\u4E48\u8BFB", link: "/notes/essays/research-judgment" },
                  { text: "\u4EC0\u4E48\u624D\u7B97\u771F\u6B63\u7684\u79D1\u7814\u8D21\u732E", link: "/notes/essays/what-counts-as-research" },
                  { text: "\u590D\u5229\u601D\u60F3\u4E0E\u7814\u7A76\u58C1\u5792", link: "/notes/essays/hamming-compound" },
                  { text: "\u4EE5\u5C0F\u535A\u5927\u7684\u7814\u7A76\u6848\u4F8B", link: "/notes/essays/lean-research" }
                ]
              },
              {
                text: "\u79D1\u5B66\u54F2\u5B66",
                items: [
                  { text: "\u79D1\u5B66\u4E0E\u5DE5\u7A0B\u7684\u5206\u91CE", link: "/notes/essays/science-vs-engineering" },
                  { text: "\u79D1\u5B66\u4F5C\u4E3A\u5929\u804C\uFF08\u97E6\u4F2F\uFF09", link: "/notes/essays/science-as-vocation" },
                  { text: "\u5C1A\u672A\u89E3\u51B3\u7684\u5F00\u653E\u95EE\u9898", link: "/notes/essays/big-questions" },
                  { text: "\u82E6\u6DA9\u6559\u8BAD\u518D\u89E3\u8BFB", link: "/notes/essays/bitter-lesson-inductive-bias" }
                ]
              },
              {
                text: "\u6280\u672F\u4E0E\u793E\u4F1A",
                items: [
                  { text: "\u590D\u6742\u7CFB\u7EDF\u4E0E\u8BA1\u7B97\u4E0D\u53EF\u7EA6", link: "/notes/essays/complex-systems" },
                  { text: "\u5177\u8EAB\u667A\u80FD", link: "/notes/essays/embodied-intelligence" },
                  { text: "\u4EBA\u7684\u4E0D\u53EF\u66FF\u4EE3\u4EF7\u503C", link: "/notes/essays/human-value-in-ai-era" }
                ]
              }
            ]
          },
          {
            text: "\u7814\u7A76\u54C1\u5473",
            items: [
              { text: "\u4EC0\u4E48\u662F\u300C\u6709\u8DA3\u300D\u7684\u7814\u7A76", link: "/notes/research-taste/what-is-interesting" },
              { text: "\u9876\u4F1A\u5206\u6790\u8BBA\u6587\u505A\u5BF9\u4E86\u4EC0\u4E48", link: "/notes/research-taste/classic-analyses" },
              { text: "\u5982\u4F55\u81EA\u4E0A\u800C\u4E0B\u4EA7\u751F\u8BFE\u9898", link: "/notes/research-taste/topic-generation" },
              { text: "\u5927\u6A21\u578B\u65F6\u4EE3\u7684\u300C\u6709\u8DA3\u300D", link: "/notes/research-taste/foundation-era" },
              { text: "\u5206\u6790\u7C7B\u8BBA\u6587\u7684 18 \u4E2A\u53E5\u6CD5\u9AA8\u67B6", link: "/notes/research-taste/sentence-patterns" }
            ]
          }
        ]
      },
      {
        text: "\u5DE5\u7A0B\u4E0E\u5E94\u7528",
        collapsed: false,
        items: [
          { text: "Python \u4E0E PyTorch \u5DE5\u7A0B\u57FA\u7840", link: "/notes/engineering/python-pytorch" },
          { text: "AI \u5728\u91D1\u878D\u9886\u57DF\u7684\u975E\u5E73\u7A33\u6027\u96BE\u9898", link: "/notes/engineering/ai-in-finance" }
        ]
      },
      {
        text: "\u{1F31F} \u7CBE\u9009",
        collapsed: false,
        items: [
          {
            text: "\u7CBE\u9009 \xB7 \u5BFC\u8BFB",
            items: [
              { text: "\u7CBE\u9009\uFF1A\u7B2C\u4E00\u6863\u4EF7\u503C\u6587\u7AE0", link: "/notes/essays/featured" }
            ]
          },
          {
            text: "\u6536\u5F55\u6587\u7AE0",
            items: [
              { text: "\u79D1\u5B66\u7814\u7A76\uFF1A\u662F\u4EC0\u4E48\u3001\u4E3A\u4EC0\u4E48\u3001\u600E\u4E48\u505A", link: "/notes/essays/scientific-research" },
              { text: "\u5148\u8DEF", link: "/notes/essays/roadmap" },
              { text: "\u81EA\u56DE\u5F52\u5927\u6A21\u578B\u7684\u5185\u90E8\u673A\u5236", link: "/notes/representation/autoregressive-internals" },
              { text: "Benchmark \u8BBA\u6587\u5199\u4F5C", link: "/notes/methodology/benchmark-writing" }
            ]
          }
        ]
      }
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/LumenAurora" }],
    footer: {
      message: "\u57FA\u4E8E\u4E2A\u4EBA\u7B14\u8BB0\u6574\u7406 \xB7 \u5185\u5BB9\u4EC5\u4EE3\u8868\u9636\u6BB5\u6027\u7406\u89E3",
      copyright: "Copyright \xA9 2026 Changning Liu"
    },
    editLink: {
      pattern: "https://github.com/LumenAurora/LumenAurora.github.io/edit/main/:path",
      text: "\u5728 GitHub \u4E0A\u7F16\u8F91\u6B64\u9875"
    }
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcMUFcdTY1NzBcdTYzNkVcdTY1ODdcdTRFRjZcdTU5MzlcXFxcR2l0SHViXFxcXEx1bWVuQXVyb3JhLmdpdGh1Yi5pb1xcXFwudml0ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFwxQVx1NjU3MFx1NjM2RVx1NjU4N1x1NEVGNlx1NTkzOVxcXFxHaXRIdWJcXFxcTHVtZW5BdXJvcmEuZ2l0aHViLmlvXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovMUElRTYlOTUlQjAlRTYlOEQlQUUlRTYlOTYlODclRTQlQkIlQjYlRTUlQTQlQjkvR2l0SHViL0x1bWVuQXVyb3JhLmdpdGh1Yi5pby8udml0ZXByZXNzL2NvbmZpZy5tdHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlcHJlc3MnXHJcbmltcG9ydCB7IGthdGV4IH0gZnJvbSAnQG1kaXQvcGx1Z2luLWthdGV4J1xyXG5cclxuLy8gXHU0RTJEXHU2NTg3XHU1M0NCXHU1OTdEXHU3Njg0XHU2NzJDXHU1NzMwXHU2NDFDXHU3RDIyXHU1MjA2XHU4QkNEXHVGRjFBXHU4MkYxXHU2NTg3XHU2MzA5XHU4QkNEXHVGRjBDXHU0RTJEXHU2NTg3XHU2MzA5XHU1QjU3ICsgXHU0RThDXHU1MTQzXHU3RUM0XHJcbmZ1bmN0aW9uIHRva2VuaXplKHRleHQ6IHN0cmluZyk6IHN0cmluZ1tdIHtcclxuICBjb25zdCB0b2tlbnM6IHN0cmluZ1tdID0gW11cclxuICBjb25zdCBlbiA9IHRleHQudG9Mb3dlckNhc2UoKS5tYXRjaCgvW2EtejAtOV17MSx9L2cpXHJcbiAgaWYgKGVuKSB0b2tlbnMucHVzaCguLi5lbilcclxuICBjb25zdCB6aCA9IHRleHQubWF0Y2goL1tcXHU0ZTAwLVxcdTlmYTVdL2cpXHJcbiAgaWYgKHpoKSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHpoLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHRva2Vucy5wdXNoKHpoW2ldKVxyXG4gICAgICBpZiAoaSArIDEgPCB6aC5sZW5ndGgpIHRva2Vucy5wdXNoKHpoW2ldICsgemhbaSArIDFdKVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdG9rZW5zXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgbGFuZzogJ3poLUNOJyxcclxuICB0aXRsZTogJ0NoYW5nbmluZyBMaXUnLFxyXG4gIHRpdGxlVGVtcGxhdGU6ICc6dGl0bGUgXHUwMEI3IENoYW5nbmluZyBMaXUnLFxyXG4gIGRlc2NyaXB0aW9uOlxyXG4gICAgJ0FJIFx1NzgxNFx1N0E3Nlx1NjVCOVx1NTQxMVx1NzY4NFx1NUI2Nlx1NEU2MFx1N0IxNFx1OEJCMFx1NEUwRVx1NjAxRFx1ODAwM1x1NUI1OFx1Njg2MyBcdTIwMTRcdTIwMTQgXHU2NzNBXHU1MjM2XHU1M0VGXHU4OUUzXHU5MUNBXHU2MDI3XHUzMDAxXHU3NTFGXHU2MjEwXHU2QTIxXHU1NzhCXHUzMDAxXHU4ODY4XHU1RjgxXHU0RTBFXHU0RTE2XHU3NTRDXHU2QTIxXHU1NzhCXHUzMDAxXHU1NDBFXHU4QkFEXHU3RUMzXHVGRjBDXHU0RUU1XHU1M0NBXHU1MDVBXHU3ODE0XHU3QTc2XHU3Njg0XHU2NUI5XHU2Q0Q1XHU4QkJBXHU0RTBFXHU1NEMxXHU1NDczXHUzMDAyJyxcclxuICBoZWFkOiBbXHJcbiAgICBbJ21ldGEnLCB7IG5hbWU6ICd0aGVtZS1jb2xvcicsIGNvbnRlbnQ6ICcjMkM2RThGJyB9XSxcclxuICAgIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzp0eXBlJywgY29udGVudDogJ3dlYnNpdGUnIH1dLFxyXG4gICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOmxvY2FsZScsIGNvbnRlbnQ6ICd6aF9DTicgfV0sXHJcbiAgICBbJ2xpbmsnLCB7IHJlbDogJ2ljb24nLCBocmVmOiAnL2Zhdmljb24uc3ZnJywgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnIH1dLFxyXG4gIF0sXHJcbiAgbGFzdFVwZGF0ZWQ6IHRydWUsXHJcbiAgY2xlYW5VcmxzOiB0cnVlLFxyXG5cclxuICAvLyBkcmFmdHMvIFx1NjYyRiBidWlsZF9ub3Rlcy5weSBcdTc2ODRcdTMwMENcdThGOTNcdTUxNjVcdTMwMERcdTc2RUVcdTVGNTVcdUZGMDhcdTY3QTJcdTdFQkRcdTVCRkNcdThCRkJcdTc2ODRcdTUzOUZcdTU5Q0JcdTdBM0ZcdUZGMDlcdUZGMENcclxuICAvLyBcdTRFMERcdTY2MkZcdTVCRjlcdTU5MTZcdTUzRDFcdTVFMDNcdTc2ODRcdTk4NzVcdTk3NjJcdTMwMDJcdTYzOTJcdTk2NjRcdTVCODNcdUZGMENcdTkwN0ZcdTUxNEQgVml0ZVByZXNzIFx1NjI4QVx1ODM0OVx1N0EzRlx1NUY1M1x1OTg3NVx1OTc2Mlx1N0YxNlx1OEJEMVx1RkYwQ1xyXG4gIC8vIFx1NEU1Rlx1OTA3Rlx1NTE0RFx1ODM0OVx1N0EzRlx1NTE4NVx1NzY4NFx1NzZGOFx1NUJGOVx1OTRGRVx1NjNBNVx1ODhBQlx1NUY1M1x1NjIxMFx1NkI3Qlx1OTRGRVx1NUJGQ1x1ODFGNFx1Njc4NFx1NUVGQVx1NTkzMVx1OEQyNVx1MzAwMlx1NURGMlx1NTNEMVx1NUUwM1x1NzY4NFx1NzI0OFx1NjcyQ1x1NTcyOCBub3Rlcy8gXHU0RTBCXHUzMDAyXHJcbiAgc3JjRXhjbHVkZTogWycqKi9kcmFmdHMvKionXSxcclxuXHJcbiAgbWFya2Rvd246IHtcclxuICAgIC8vIFx1NkUzMlx1NjdEMyBMYVRlWFx1RkYxQSQuLi4kXHUzMDAxJCQuLi4kJFx1MzAwMVxcKC4uLlxcKVx1MzAwMVxcWy4uLlxcXVxyXG4gICAgY29uZmlnKG1kKSB7XHJcbiAgICAgIG1kLnVzZShrYXRleCwgeyBkZWxpbWl0ZXJzOiAnYWxsJywgdGhyb3dPbkVycm9yOiBmYWxzZSwgc3RyaWN0OiBmYWxzZSB9KVxyXG4gICAgfSxcclxuICAgIHRoZW1lOiB7IGxpZ2h0OiAnZ2l0aHViLWxpZ2h0JywgZGFyazogJ2dpdGh1Yi1kYXJrJyB9LFxyXG4gICAgbGluZU51bWJlcnM6IGZhbHNlLFxyXG4gIH0sXHJcblxyXG4gIHRoZW1lQ29uZmlnOiB7XHJcbiAgICBvdXRsaW5lOiB7IGxldmVsOiBbMiwgM10sIGxhYmVsOiAnXHU2NzJDXHU5ODc1XHU3NkVFXHU1RjU1JyB9LFxyXG4gICAgbGFzdFVwZGF0ZWRUZXh0OiAnXHU2NzAwXHU1NDBFXHU2NkY0XHU2NUIwJyxcclxuICAgIGRvY0Zvb3RlcjogeyBwcmV2OiAnXHU0RTBBXHU0RTAwXHU5ODc1JywgbmV4dDogJ1x1NEUwQlx1NEUwMFx1OTg3NScgfSxcclxuXHJcbiAgICBzZWFyY2g6IHtcclxuICAgICAgcHJvdmlkZXI6ICdsb2NhbCcsXHJcbiAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICBtaW5pU2VhcmNoOiB7XHJcbiAgICAgICAgICBvcHRpb25zOiB7IHRva2VuaXplIH0sXHJcbiAgICAgICAgICBzZWFyY2hPcHRpb25zOiB7IGJvb3N0OiB7IHRpdGxlOiA0LCB0ZXh0OiAyLCB0aXRsZXM6IDEgfSB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGV0YWlsZWRWaWV3OiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgICB0cmFuc2xhdGlvbnM6IHtcclxuICAgICAgICBidXR0b246IHsgYnV0dG9uVGV4dDogJ1x1NjQxQ1x1N0QyMicsIGJ1dHRvbkFyaWFMYWJlbDogJ1x1NjQxQ1x1N0QyMlx1NjU4N1x1N0FFMCcgfSxcclxuICAgICAgICBtb2RhbDoge1xyXG4gICAgICAgICAgbm9SZXN1bHRzVGV4dDogJ1x1NkNBMVx1NjcwOVx1NjI3RVx1NTIzMFx1NzZGOFx1NTE3M1x1NTE4NVx1NUJCOScsXHJcbiAgICAgICAgICByZXNldEJ1dHRvblRpdGxlOiAnXHU2RTA1XHU3QTdBJyxcclxuICAgICAgICAgIGZvb3Rlcjoge1xyXG4gICAgICAgICAgICBzZWxlY3RUZXh0OiAnXHU5MDA5XHU2MkU5JyxcclxuICAgICAgICAgICAgbmF2aWdhdGVUZXh0OiAnXHU1MjA3XHU2MzYyJyxcclxuICAgICAgICAgICAgY2xvc2VUZXh0OiAnXHU1MTczXHU5NUVEJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gXHU5ODc2XHU1QzQyXHU1QkZDXHU4MjJBXHVGRjFBXHU1MjA2XHU3RUM0XHU3RUE3XHU1MTY1XHU1M0UzXHVGRjBDXHU2MzA3XHU1NDExXHU1NDA0XHU1QkZDXHU4QkZCXHU2N0EyXHU3RUJEXHU5ODc1XHVGRjBDXHU5MDdGXHU1MTREXHU0RTBFXHU0RkE3XHU4RkI5XHU2ODBGXHU5MUNEXHU1OTBEXHU3RjU3XHU1MjE3XHJcbiAgICBuYXY6IFtcclxuICAgICAgeyB0ZXh0OiAnXHU5OTk2XHU5ODc1JywgbGluazogJy8nIH0sXHJcbiAgICAgIHsgdGV4dDogJ1x1NzgxNFx1N0E3Nlx1NEUzQlx1OTg5OCcsIGxpbms6ICcvbm90ZXMvaW50ZXJwcmV0YWJpbGl0eS9yb2FkbWFwJyB9LFxyXG4gICAgICB7IHRleHQ6ICdcdTc4MTRcdTdBNzZcdTY1QjlcdTZDRDUnLCBsaW5rOiAnL25vdGVzL21ldGhvZG9sb2d5L2h1YicgfSxcclxuICAgICAgeyB0ZXh0OiAnXHU5ODg2XHU1N0RGXHU3RUI1XHU4OUM4JywgbGluazogJy9ub3Rlcy9zdXJ2ZXlzL2h1YicgfSxcclxuICAgICAgeyB0ZXh0OiAnXHU2MDFEXHU4MDAzJywgbGluazogJy9ub3Rlcy9lc3NheXMvaHViJyB9LFxyXG4gICAgICB7IHRleHQ6ICdcdTdDQkVcdTkwMDknLCBsaW5rOiAnL25vdGVzL2Vzc2F5cy9mZWF0dXJlZCcgfSxcclxuICAgICAgeyB0ZXh0OiAnXHU1RjUyXHU2ODYzJywgbGluazogJy9hcmNoaXZlJyB9LFxyXG4gICAgICB7IHRleHQ6ICdcdTUxNzNcdTRFOEUnLCBsaW5rOiAnL2Fib3V0JyB9LFxyXG4gICAgXSxcclxuXHJcbiAgICAvLyBcdTUxNjhcdTdBRDlcdTUxNzFcdTRFQUJcdTc2ODRcdTUzNTVcdTRFMDBcdTRGQTdcdThGQjlcdTY4MEZcdUZGMUE1IFx1NEUyQVx1NEUwMFx1N0VBN1x1N0VDNFx1ODk4Nlx1NzZENiAxMyBcdTRFMkFcdTUzOUZcdTUyMDZcdTdDN0JcdUZGMENcclxuICAgIC8vIFx1NUMwRlx1N0M3Qlx1NTcyOFx1NUJGQ1x1ODIyQVx1NUM0Mlx1NTQwOFx1NUU3Nlx1RkYwOFx1NzUxRlx1NjIxMCtcdTg4NjhcdTVGODFcdTMwMDFcdTU0MEVcdThCQURcdTdFQzMrUkxcdTMwMDFcdTc4MTRcdTdBNzZcdTU0QzFcdTU0NzNcdTVFNzZcdTUxNjVcdTMwMENcdTYwMURcdTgwMDNcdTMwMERcdUZGMDlcdUZGMENcdTY1ODdcdTdBRTBcdThERUZcdTVGODRcdTRFMERcdTUzRDhcdTMwMDJcclxuICAgIHNpZGViYXI6IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6ICdcdTc4MTRcdTdBNzZcdTRFM0JcdTk4OTgnLFxyXG4gICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXHJcbiAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogJ1x1NjczQVx1NTIzNlx1NTNFRlx1ODlFM1x1OTFDQVx1NjAyNycsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1x1NjczQVx1NTIzNlx1NTNFRlx1ODlFM1x1OTFDQVx1NjAyNyBcdTAwQjcgXHU1QkZDXHU4QkZCJyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NUI2Nlx1NEU2MFx1OERFRlx1NUY4NFx1NjAzQlx1ODlDOFx1RkYwOFx1OEJGQlx1OEZEOVx1N0JDN1x1NTE0OFx1RkYwOScsIGxpbms6ICcvbm90ZXMvaW50ZXJwcmV0YWJpbGl0eS9yb2FkbWFwJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTUxNjVcdTk1RThcdTRFMEVcdTU3RkFcdTc4NDAnLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU2NzNBXHU1MjM2XHU1M0VGXHU4OUUzXHU5MUNBXHU2MDI3XHU2NjJGXHU0RUMwXHU0RTQ4JywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L3doYXQtaXMtbWknIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1RyYW5zZm9ybWVyIFx1NzY4NFx1Njc2MVx1NEVGNlx1N0VCRlx1NjAyNycsIGxpbms6ICcvbm90ZXMvaW50ZXJwcmV0YWJpbGl0eS9jb25kaXRpb25hbC1saW5lYXJpdHknIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NzI3OVx1Njc0M1x1NTdGQScsIGxpbms6ICcvbm90ZXMvaW50ZXJwcmV0YWJpbGl0eS9wcml2aWxlZ2VkLWJhc2VzJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdThERUZcdTVGODRcdTUyMDZcdTg5RTMnLCBsaW5rOiAnL25vdGVzL2ludGVycHJldGFiaWxpdHkvcGF0aC1kZWNvbXBvc2l0aW9uJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTc1MzVcdThERUZcdTUyMDZcdTY3OTBcdTY1QjlcdTZDRDUnLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU3NTM1XHU4REVGXHU1MjA2XHU2NzkwXHU1MTY1XHU5NUU4JywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L2NpcmN1aXQtZm91bmRhdGlvbnMnIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1OERFRlx1NUY4NFx1N0VBN1x1NTZFMFx1Njc5Q1x1OEZGRFx1OEUyQScsIGxpbms6ICcvbm90ZXMvaW50ZXJwcmV0YWJpbGl0eS9wYXRoLXBhdGNoaW5nLWVhcC1hY2RjJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdDYXVzYWwgU2NydWJiaW5nIFx1NEUwRSBTQUUnLCBsaW5rOiAnL25vdGVzL2ludGVycHJldGFiaWxpdHkvc2FlLWFuZC1jYXVzYWwtc2NydWJiaW5nJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTUyNERcdTZDQkZcdTY1QjlcdTZDRDVcdTRFMEVcdTdFRkNcdTU0MDhcdTVERTVcdTRGNUNcdTZENDEnLCBsaW5rOiAnL25vdGVzL2ludGVycHJldGFiaWxpdHkvY2lyY3VpdC1tZXRob2RzLWZyb250aWVyJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdBbnRocm9waWMgXHU3Q0ZCXHU3RURGXHU2NTU5XHU3QTBCIFx1MDBCNyBcdTVGNTJcdTU2RTBcdTU2RkVcdTRFMDlcdTkwRThcdTY2RjInLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnQW50aHJvcGljIFx1NTNFRlx1ODlFM1x1OTFDQVx1NjAyN1x1N0NGQlx1N0VERlx1RkYwOFx1NEUwM1x1NUM0Mlx1OERFRlx1NUY4NFx1RkYwOScsIGxpbms6ICcvbm90ZXMvaW50ZXJwcmV0YWJpbGl0eS9hbnRocm9waWMtbWktc3lzdGVtJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTY2RkZcdTYzNjJcdTZBMjFcdTU3OEJcdTRFMEUgVHJhbnNjb2RlcicsIGxpbms6ICcvbm90ZXMvaW50ZXJwcmV0YWJpbGl0eS9yZXBsYWNlbWVudC1tb2RlbC10cmFuc2NvZGVyJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTVGNTJcdTU2RTBcdTU2RkVcdTUxNjVcdTk1RThcdUZGMDhcdTY2MkZcdTRFQzBcdTRFNDgvXHU2MDBFXHU0RTQ4XHU4ODU0XHU2M0E1XHVGRjA5JywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L2F0dHJpYnV0aW9uLWdyYXBocycgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1RjUyXHU1NkUwXHU1NkZFXHU2Nzg0XHU1RUZBXHVGRjA4XHU0RUNFXHU2NkZGXHU2MzYyXHU2QTIxXHU1NzhCXHU1MjMwXHU1RkVCXHU3MTY3XHVGRjA5JywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L2F0dHJpYnV0aW9uLWdyYXBoLWRlZXBkaXZlJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTVGNTJcdTU2RTBcdTU2RkVcdTg5RTNcdTUyNTZcdTRFMEVcdTU2RTBcdTY3OUNcdTkxNERcdTY1QjknLCBsaW5rOiAnL25vdGVzL2ludGVycHJldGFiaWxpdHkvYXR0cmlidXRpb24tZ3JhcGgtYW5hdG9teScgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1REU1XHU1MTc3XHU5NEZFXHUzMDAxXHU5QThDXHU4QkMxXHU0RTBFXHU1QjlFXHU4REY1JywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L3Rvb2xjaGFpbi12YWxpZGF0aW9uLXByYWN0aWNlJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTc2RjRcdTg5QzlcdTRFMEVcdTVGQzNcdTY2N0FcdTU2RkVcdTY2NkYnLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1MjFEXHU1QjY2XHU4MDA1XHU3Njg0XHU3NkY0XHU4OUM5XHVGRjFBXHU2NTg3XHU3MzJFXHU1QkExXHU2N0U1XHU0RTBFXHU0RkVFXHU2QjYzJywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L2ludHVpdGlvbi1zZWxmLXJldmlldycgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnTExNIFx1NEUwRSBWTE0gXHU3Njg0XHU3NkY0XHU4OUM5XHU0RTE2XHU3NTRDXHU2QTIxXHU1NzhCJywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L2ludHVpdGlvbi13b3JsZC1tb2RlbCcgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnTExNIFx1NEUwRVx1NEVCQVx1N0M3Qlx1OEJBNFx1NzdFNVx1NzY4NFx1NkRGMVx1NUVBNlx1N0M3Qlx1NkJENCcsIGxpbms6ICcvbm90ZXMvaW50ZXJwcmV0YWJpbGl0eS9jb2duaXRpdmUtc2NpZW5jZS1hbmFsb2dpZXMnIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1OEJBRFx1N0VDM1x1OEZDN1x1N0EwQlx1NzY4NFx1NTNFRlx1ODlFM1x1OTFDQVx1NjAyN1x1NEUxNlx1NzU0Q1x1NkEyMVx1NTc4QicsIGxpbms6ICcvbm90ZXMvaW50ZXJwcmV0YWJpbGl0eS9kZXZlbG9wbWVudGFsLWludGVycHJldGFiaWxpdHknIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1x1NjVCOVx1NkNENVx1OEJCQVx1NEUwRVx1OEJDQVx1NjVBRCcsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTUzRUZcdTg5RTNcdTkxQ0FcdTYwMjdcdTY1QjlcdTZDRDVcdThCQkFcdTc2ODRcdTdFREZcdTRFMDBcdTU2RkVcdTY2NkYnLCBsaW5rOiAnL25vdGVzL2ludGVycHJldGFiaWxpdHkvdW5pZmllZC1tZXRob2RvbG9neScgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU3ODE0XHU3QTc2XHU2QjhCXHU1REVFXHU2RDQxIHRyaXZpYWwgXHU1NDE3JywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L3Jlc2lkdWFsLXN0cmVhbS10cml2aWFsJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTRFQ0VcdTg5QzJcdTVCREZcdTUyMzBcdTU5N0RcdTY1NDVcdTRFOEInLCBsaW5rOiAnL25vdGVzL2ludGVycHJldGFiaWxpdHkvb2JzZXJ2YXRpb24tdG8tc3RvcnknIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NjczQVx1NTIzNlx1NTNFRlx1ODlFM1x1OTFDQVx1NjAyN1x1NzY4NFx1MzAwQ1x1Njc3RVx1NjU2M1x1MzAwRFx1OEJDQVx1NjVBRCcsIGxpbms6ICcvbm90ZXMvaW50ZXJwcmV0YWJpbGl0eS9taS1sb29zZW5lc3MtZGlhZ25vc2lzJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdWTE0gXHU0RTAzXHU4Rjc0XHU3QTc3XHU0RTNFXHU2ODQ2XHU2N0I2JywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L3ZsbS1zZXZlbi1heGlzJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdWTE0gXHU1M0VGXHU4OUUzXHU5MUNBXHU2MDI3XHU1QjY2XHU0RTYwXHU4REVGXHU3RUJGJywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L3ZsbS1sZWFybmluZy1yb2FkbWFwJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTUxNjhcdTY2NkZcdTRFMEVcdTY1QjlcdTZDRDUnLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU2MjY5XHU2NTYzXHU2QTIxXHU1NzhCXHU3Njg0XHU1M0VGXHU4OUUzXHU5MUNBXHU2MDI3JywgbGluazogJy9ub3Rlcy9pbnRlcnByZXRhYmlsaXR5L2RpZmZ1c2lvbi1pbnRlcnByZXRhYmlsaXR5JyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTg4NENcdTRFM0FcdTUzRUZcdTg5RTNcdTkxQ0FcdTYwMjcnLCBsaW5rOiAnL25vdGVzL2ludGVycHJldGFiaWxpdHkvYmVoYXZpb3JhbC1pbnRlcnByZXRhYmlsaXR5JyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTZDRThcdTYxMEZcdTUyOUJcdTUyMDZcdTY3OTAnLCBsaW5rOiAnL25vdGVzL2ludGVycHJldGFiaWxpdHkvYXR0ZW50aW9uLWFuYWx5c2lzJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogJ1x1NzUxRlx1NjIxMFx1NEUwRVx1ODg2OFx1NUY4MScsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1x1NzUxRlx1NjIxMFx1NkEyMVx1NTc4QicsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTYyNjlcdTY1NjNcdTZBMjFcdTU3OEInLCBsaW5rOiAnL25vdGVzL2dlbmVyYXRpdmUvZGlmZnVzaW9uLW1vZGVscycgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU2MjY5XHU2NTYzXHU2QTIxXHU1NzhCXHU1NDBFXHU4QkFEXHU3RUMzJywgbGluazogJy9ub3Rlcy9nZW5lcmF0aXZlL2RpZmZ1c2lvbi1wb3N0LXRyYWluaW5nJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTY4QUZcdTVFQTZcdTZENDFcdTRFMEVcdTZENDFcdTUzMzlcdTkxNEQnLCBsaW5rOiAnL25vdGVzL2dlbmVyYXRpdmUvZmxvdy1hbmQtZ3JhZGllbnQnIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NkRGMVx1NUVBNlx1NzUxRlx1NjIxMFx1NkEyMVx1NTc4Qlx1Njk4Mlx1ODlDOCcsIGxpbms6ICcvbm90ZXMvZ2VuZXJhdGl2ZS9kZWVwLWdlbmVyYXRpdmUtbW9kZWxzJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTg4NjhcdTVGODFcdTRFMEVcdTRFMTZcdTc1NENcdTZBMjFcdTU3OEInLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU4MUVBXHU3NkQxXHU3NzYzXHU4ODY4XHU1RjgxXHU1QjY2XHU0RTYwJywgbGluazogJy9ub3Rlcy9yZXByZXNlbnRhdGlvbi9zc2wtcmVwcmVzZW50YXRpb24nIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NEUxNlx1NzU0Q1x1NkEyMVx1NTc4QicsIGxpbms6ICcvbm90ZXMvcmVwcmVzZW50YXRpb24vd29ybGQtbW9kZWxzJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTk2OTBcdTVGMEZcdTZBMjFcdTU3OEInLCBsaW5rOiAnL25vdGVzL3JlcHJlc2VudGF0aW9uL2ltcGxpY2l0LW1vZGVscycgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU4MUVBXHU1NkRFXHU1RjUyXHU2QTIxXHU1NzhCXHU1MTg1XHU5MEU4XHU2NzNBXHU1MjM2JywgbGluazogJy9ub3Rlcy9yZXByZXNlbnRhdGlvbi9hdXRvcmVncmVzc2l2ZS1pbnRlcm5hbHMnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiAnXHU1NDBFXHU4QkFEXHU3RUMzXHU0RTBFXHU1RjNBXHU1MzE2XHU1QjY2XHU0RTYwJyxcclxuICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiAnXHU1NDBFXHU4QkFEXHU3RUMzXHU0RTBFXHU2M0E4XHU3NDA2JyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NTkyN1x1NkEyMVx1NTc4Qlx1NTQwRVx1OEJBRFx1N0VDMycsIGxpbms6ICcvbm90ZXMvcG9zdC10cmFpbmluZy9wb3N0LXRyYWluaW5nJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTU0MEVcdThCQURcdTdFQzNcdTYyODBcdTY3MkZcdThDMzFcdTdDRkInLCBsaW5rOiAnL25vdGVzL3Bvc3QtdHJhaW5pbmcvcG9zdC10cmFpbmluZy10ZWNobmlxdWVzJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTZDRThcdTYxMEZcdTUyOUJcdTRFNEJcdTU5MTYnLCBsaW5rOiAnL25vdGVzL3Bvc3QtdHJhaW5pbmcvYmV5b25kLWF0dGVudGlvbicgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiAnXHU1RjNBXHU1MzE2XHU1QjY2XHU0RTYwJyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NUYzQVx1NTMxNlx1NUI2Nlx1NEU2MFx1N0VCMlx1ODk4MScsIGxpbms6ICcvbm90ZXMvcmwvcmwtcHJpbmNpcGxlcycgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnUkwgXHU5MDFBXHU4QkM2XHU5NTdGXHU2NTg3JywgbGluazogJy9ub3Rlcy9ybC9ybC1ib29rLW9mLWFpJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTRFQkFcdTRFM0FcdTRFQzBcdTRFNDhcdTk3NjAgUkwgXHU1QjY2XHU0RjFBXHU2MjUzXHU5RUJCXHU1QzA2JywgbGluazogJy9ub3Rlcy9ybC93aHktaHVtYW4tcmwnIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1JMIFx1NEUwRVx1NzZEMVx1Nzc2M1x1NUI2Nlx1NEU2MFx1NEU0Qlx1NTIyQicsIGxpbms6ICcvbm90ZXMvcmwvcmwtdnMtc3VwZXJ2aXNlZCcgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6ICdcdTg5QzZcdTg5QzlcdThCRURcdThBMDBcdTZBMjFcdTU3OEInLFxyXG4gICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgIHsgdGV4dDogJ1ZMTSBcdTY3QjZcdTY3ODRcdTZGMTRcdThGREJcdUZGMUFcdTRFQ0UgQ0xJUCBcdTUyMzAgTExhVkEnLCBsaW5rOiAnL25vdGVzL3ZsbS9hcmNoaXRlY3R1cmUtZXZvbHV0aW9uJyB9LFxyXG4gICAgICAgICAgICAgIHsgdGV4dDogJ1ZMTSBcdTg5QzZcdTg5QzlcdTdGMTZcdTc4MDFcdTUxNjhcdTg5RTMnLCBsaW5rOiAnL25vdGVzL3ZsbS92aXN1YWwtZW5jb2RpbmcnIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnVkxNIFx1OEJDNFx1NkQ0Qlx1NTdGQVx1NTFDNlx1NjhCM1x1NzQwNicsIGxpbms6ICcvbm90ZXMvdmxtL2JlbmNobWFya3MnIH0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiAnXHU3ODE0XHU3QTc2XHU2NUI5XHU2Q0Q1JyxcclxuICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6ICdcdTc4MTRcdTdBNzZcdTY1QjlcdTZDRDVcdThCQkEnLFxyXG4gICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTc4MTRcdTdBNzZcdTY1QjlcdTZDRDVcdThCQkEgXHUwMEI3IFx1NUJGQ1x1OEJGQicsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTc4MTRcdTdBNzZcdTY1QjlcdTZDRDVcdThCQkFcdTYwM0JcdTg5QzhcdUZGMDhcdThCRkJcdThGRDlcdTdCQzdcdTUxNDhcdUZGMDknLCBsaW5rOiAnL25vdGVzL21ldGhvZG9sb2d5L2h1YicgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiAnXHU4QkJBXHU2NTg3XHU1MTk5XHU0RjVDJyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ0JlbmNobWFyayBcdThCQkFcdTY1ODdcdTUxOTlcdTRGNUMnLCBsaW5rOiAnL25vdGVzL21ldGhvZG9sb2d5L2JlbmNobWFyay13cml0aW5nJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTY1QjlcdTZDRDVcdTdDN0JcdThCQkFcdTY1ODdcdTc2ODQgSWRlYSBcdTc1MUZcdTYyMTAnLCBsaW5rOiAnL25vdGVzL21ldGhvZG9sb2d5L2lkZWEtZ2VuZXJhdGlvbicgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnQUkgXHU3Qjk3XHU2Q0Q1XHU4QkJFXHU4QkExXHU3Njg0XHU1RTk1XHU1QzQyXHU5MDNCXHU4RjkxJywgbGluazogJy9ub3Rlcy9tZXRob2RvbG9neS9hbGdvcml0aG0tZGVzaWduJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTY1QjlcdTZDRDVcdTdDN0JcdTY1ODdcdTdBRTBcdTc2ODRcdTVCOUVcdTlBOENcdTg5QzInLCBsaW5rOiAnL25vdGVzL21ldGhvZG9sb2d5L21ldGhvZC1wYXBlcicgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1OTgyXHU0RjU1XHU2ODQ2XHU1QjlBXHU3ODE0XHU3QTc2XHU5NUVFXHU5ODk4JywgbGluazogJy9ub3Rlcy9tZXRob2RvbG9neS9wcm9ibGVtLXNjb3BpbmcnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1x1OEJDNFx1NkQ0Qlx1NEUwRVx1NUJBMVx1N0EzRicsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTUzRUZcdTk3NjBcdTYwMjcgQmVuY2htYXJrIFx1NzgxNFx1N0E3NicsIGxpbms6ICcvbm90ZXMvbWV0aG9kb2xvZ3kvcmVsaWFiaWxpdHktYmVuY2htYXJrJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTVCQTFcdTdBM0ZcdTdFRjRcdTVFQTZcdTc2ODRcdTdDRkJcdTdFREZcdTY4QjNcdTc0MDYnLCBsaW5rOiAnL25vdGVzL21ldGhvZG9sb2d5L3Jldmlldy1kaW1lbnNpb25zJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTY1QjlcdTU0MTFcdTRFMEVcdTU3MzBcdTU2RkUnLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU3ODE0XHU3QTc2XHU2NUI5XHU1NDExXHU1NzMwXHU1NkZFJywgbGluazogJy9ub3Rlcy9tZXRob2RvbG9neS9yZXNlYXJjaC1kaXJlY3Rpb25zLW1hcCcgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU2M0E4XHU3NDA2XHU2NUY2XHU0RjE4XHU1MzE2XHU2NUI5XHU2Q0Q1XHU1MjA2XHU3QzdCXHU0RjUzXHU3Q0ZCJywgbGluazogJy9ub3Rlcy9tZXRob2RvbG9neS90cmFpbmluZy1mcmVlLWluZmVyZW5jZS10YXhvbm9teScgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU2NzJDXHU3OUQxXHU3NTFGXHU1OTgyXHU0RjU1XHU1RjAwXHU1NDJGXHU3OUQxXHU3ODE0JywgbGluazogJy9ub3Rlcy9tZXRob2RvbG9neS9zdGFydGluZy1yZXNlYXJjaCcgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU4RkE4XHU1MjJCXHU3NzFGXHU3ODE0XHU3QTc2XHU0RTBFXHU4RERGXHU5OENFJywgbGluazogJy9ub3Rlcy9tZXRob2RvbG9neS9yZWFsLXJlc2VhcmNoLXZzLXBhZGRpbmcnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiAnXHU5ODg2XHU1N0RGXHU3RUI1XHU4OUM4XHU0RTBFXHU1N0ZBXHU3ODQwJyxcclxuICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6ICdcdTk4ODZcdTU3REZcdTdFRkNcdThGRjAnLFxyXG4gICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgIHsgdGV4dDogJ1x1OTg4Nlx1NTdERlx1N0VGQ1x1OEZGMFx1NUJGQ1x1OEJGQlx1RkYwOFx1OEJGQlx1OEZEOVx1N0JDN1x1NTE0OFx1RkYwOScsIGxpbms6ICcvbm90ZXMvc3VydmV5cy9odWInIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnSUNNTCBcdTUzNDFcdTVFNzRcdTgxMDlcdTdFREMnLCBsaW5rOiAnL25vdGVzL3N1cnZleXMvaWNtbC1kZWNhZGUnIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnQ1ZQUiBcdTUzNDFcdTVFNzRcdThDMDgnLCBsaW5rOiAnL25vdGVzL3N1cnZleXMvY3Zwci1kZWNhZGUnIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1NkZFXHU3OTVFXHU3RUNGXHU3RjUxXHU3RURDXHU3Njg0XHU2RjE0XHU4RkRCJywgbGluazogJy9ub3Rlcy9zdXJ2ZXlzL2dubi1ldm9sdXRpb24nIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU2NUY2XHU5NUY0XHU1RThGXHU1MjE3XHU1MjA2XHU2NzkwJywgbGluazogJy9ub3Rlcy9zdXJ2ZXlzL3RpbWUtc2VyaWVzJyB9LFxyXG4gICAgICAgICAgICAgIHsgdGV4dDogJ1x1NEVDRSBOTFAgXHU1MjMwIExMTScsIGxpbms6ICcvbm90ZXMvc3VydmV5cy9ubHAtdG8tbGxtJyB9LFxyXG4gICAgICAgICAgICAgIHsgdGV4dDogJ1x1NUI2Nlx1NzU0Q1x1MzAwQ1x1NjI5N1x1NUU3Qlx1ODlDOVx1MzAwRFx1NzgxNFx1N0E3Nlx1NTE2OFx1NTNGMicsIGxpbms6ICcvbm90ZXMvc3VydmV5cy9hbnRpLWhhbGx1Y2luYXRpb24nIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU4RkMxXHU3OUZCXHU1QjY2XHU0RTYwXHU2NUNGXHU4QzMxXHU0RTBFIFRUQSBcdTVCOUFcdTRGNEQnLCBsaW5rOiAnL25vdGVzL3N1cnZleXMvdHJhbnNmZXItbGVhcm5pbmctdHRhJyB9LFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGV4dDogJ1x1NjczQVx1NTY2OFx1NUI2Nlx1NEU2MFx1NzQwNlx1OEJCQScsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1x1NjczQVx1NTY2OFx1NUI2Nlx1NEU2MFx1NzQwNlx1OEJCQSBcdTAwQjcgXHU1QkZDXHU4QkZCJyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1N0NCRVx1OEJGQlx1OERFRlx1NUY4NFx1NjAzQlx1ODlDOFx1RkYwOFx1OEJGQlx1OEZEOVx1N0JDN1x1NTE0OFx1RkYwOScsIGxpbms6ICcvbm90ZXMvbWwtdGhlb3J5L3JvYWRtYXAnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1x1NEVFNVx1NjU3MFx1NUI2Nlx1ODlDMlx1NEU0QicsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTY1NzBcdTVCNjZcdTVERTVcdTUxNzdcdTVCRjlcdTVFOTRcdTUxNzNcdTdDRkInLCBsaW5rOiAnL25vdGVzL21sLXRoZW9yeS9tYXRoLXZpZXdwb2ludCcgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiAnXHU3QjJDXHU0RThDXHU3QUUwIEEgR2VudGxlIFN0YXJ0JyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1RkYwOFx1NEUwMFx1RkYwOVx1NEVDRVx1NEUxNlx1NzU0Q1x1NkEyMVx1NTc4Qlx1NTIzMFx1NUY2Mlx1NUYwRlx1NTMxNlx1Njg0Nlx1NjdCNicsIGxpbms6ICcvbm90ZXMvbWwtdGhlb3J5L2NoMi13b3JsZC1tb2RlbC1mcmFtZXdvcmsnIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1RkYwOFx1NEU4Q1x1RkYwOVx1NzcxRlx1NUI5RVx1OThDRVx1OTY2OVx1MzAwMVx1N0VDRlx1OUE4Q1x1OThDRVx1OTY2OVx1NEUwRSBFUk0nLCBsaW5rOiAnL25vdGVzL21sLXRoZW9yeS9jaDItcmlzay1hbmQtZXJtJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdUZGMDhcdTRFMDlcdUZGMDlcdThGQzdcdTYyREZcdTU0MDhcdTc2ODRcdTY3MkNcdThEMjhcdTRFMEVcdTVGNTJcdTdFQjNcdTUwNEZcdTdGNkUnLCBsaW5rOiAnL25vdGVzL21sLXRoZW9yeS9jaDItb3ZlcmZpdHRpbmctaW5kdWN0aXZlLWJpYXMnIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1RkYwOFx1NTZEQlx1RkYwOVx1NjcwOVx1OTY1MFx1NTA0N1x1OEJCRVx1N0M3Qlx1NzY4NFx1NkNEQlx1NTMxNlx1NEZERFx1OEJDMScsIGxpbms6ICcvbm90ZXMvbWwtdGhlb3J5L2NoMi1maW5pdGUtZ2VuZXJhbGl6YXRpb24tcHJvb2YnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1x1N0IyQ1x1NEUwOVx1N0FFMCBBIEZvcm1hbCBMZWFybmluZyBNb2RlbCcsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdUZGMDhcdTRFMDBcdUZGMDlQQUMgXHU1QjY2XHU0RTYwXHVGRjFBXHU0RUNFXHU4MEZEXHU2Q0RCXHU1MzE2XHU1MjMwXHU1M0VGXHU1QjY2XHU0RTYwJywgbGluazogJy9ub3Rlcy9tbC10aGVvcnkvY2gzLXBhYy1kZWZpbml0aW9uJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdUZGMDhcdTRFOENcdUZGMDlTYW1wbGUgQ29tcGxleGl0eSBcdTRFMEUgQWdub3N0aWMgUEFDJywgbGluazogJy9ub3Rlcy9tbC10aGVvcnkvY2gzLXNhbXBsZS1jb21wbGV4aXR5LWFnbm9zdGljJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdUZGMDhcdTRFMDlcdUZGMDlCYXllcyBPcHRpbWFsIFx1NEUwRSBBZ25vc3RpYyBQQUMnLCBsaW5rOiAnL25vdGVzL21sLXRoZW9yeS9jaDMtYmF5ZXMtYWdub3N0aWMtcGFjJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdUZGMDhcdTU2REJcdUZGMDlHZW5lcmFsIExvc3MgXHU0RTBFIFByb3Blci9JbXByb3BlcicsIGxpbms6ICcvbm90ZXMvbWwtdGhlb3J5L2NoMy1nZW5lcmFsLWxvc3MnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1x1N0IyQ1x1NTZEQlx1N0FFMCBMZWFybmluZyB2aWEgVW5pZm9ybSBDb252ZXJnZW5jZScsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdUZGMDhcdTRFMDBcdUZGMDlcdTUyQThcdTY3M0FcdTRFMEUgXHUwM0I1LXJlcHJlc2VudGF0aXZlJywgbGluazogJy9ub3Rlcy9tbC10aGVvcnkvY2g0LW1vdGl2YXRpb24tcmVwcmVzZW50YXRpdmUnIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1RkYwOFx1NEU4Q1x1RkYwOVx1NjgzOFx1NUZDM1x1NUYxNVx1NzQwNlx1NEUwRVx1NjcwOVx1OTY1MFx1N0M3Qlx1OEJDMVx1NjYwRScsIGxpbms6ICcvbm90ZXMvbWwtdGhlb3J5L2NoNC1jb3JlLWxlbW1hLXVjLWZpbml0ZScgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHVGRjA4XHU0RTA5XHVGRjA5SG9lZmZkaW5nIFx1NEUwRFx1N0I0OVx1NUYwRicsIGxpbms6ICcvbm90ZXMvbWwtdGhlb3J5L2NoNC1ob2VmZmRpbmcnIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1RkYwOFx1NTZEQlx1RkYwOVx1NjUzRVx1NTZERSBNTFx1MzAwMVVuaW9uIEJvdW5kIFx1NEUwRVx1NjgzN1x1NjcyQ1x1NTkwRFx1Njc0Mlx1NUVBNicsIGxpbms6ICcvbm90ZXMvbWwtdGhlb3J5L2NoNC1iYWNrLXRvLW1sLXVuaW9uLWJvdW5kJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdUZGMDhcdTRFOTRcdUZGMDlcdThCQzFcdTY2MEVcdTVERTVcdTUxNzdcdTdCQjFcdTRFMEVcdTkwMDJcdTc1MjhcdThGQjlcdTc1NEMnLCBsaW5rOiAnL25vdGVzL21sLXRoZW9yeS9jaDQtdG9vbGJveC1hcHBsaWNhYmlsaXR5JyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTRFNjBcdTk4OThcdTRFMEVcdTVFRjZcdTVDNTVcdUZGMDhcdTk2NDRcdTVGNTVcdUZGMDknLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU3QjJDXHU0RThDXHU3QUUwXHVGRjA4XHU0RTk0XHVGRjA5XHU1RUY2XHU1QzU1XHUzMDAxXHU1QzQyXHU2QjIxXHU1ODU0XHU0RTBFXHU0RTYwXHU5ODk4JywgbGluazogJy9ub3Rlcy9tbC10aGVvcnkvY2gyLWV4dGVuc2lvbnMtZXhlcmNpc2VzJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTdCMkNcdTRFMDlcdTdBRTBcdUZGMDhcdTRFOTRcdUZGMDlcdThCQzFcdTY2MEVcdTVERTVcdTUxNzdcdTdCQjFcdTMwMDFcdTRFNjBcdTk4OThcdTRFMEVcdTUzOEJcdTdGMjknLCBsaW5rOiAnL25vdGVzL21sLXRoZW9yeS9jaDMtcHJvb2YtdG9vbHMtZXhlcmNpc2VzJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTdCMkNcdTU2REJcdTdBRTBcdUZGMDhcdTUxNkRcdUZGMDlEaXNjcmV0aXphdGlvblx1MzAwMVx1NEU2MFx1OTg5OFx1NEUwRVx1NTM4Qlx1N0YyOScsIGxpbms6ICcvbm90ZXMvbWwtdGhlb3J5L2NoNC1kaXNjcmV0aXphdGlvbi1leGVyY2lzZXMnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiAnXHU2NTcwXHU1QjY2XHU1N0ZBXHU3ODQwJyxcclxuICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICB7IHRleHQ6ICdcdTk2OEZcdTY3M0FcdTVGQUVcdTUyMDZcdTY1QjlcdTdBMEJcdTUxNjVcdTk1RTgnLCBsaW5rOiAnL25vdGVzL21hdGgvc2RlLXByaW1lcicgfSxcclxuICAgICAgICAgICAgICB7IHRleHQ6ICdcdTVCNjZcdTRFNjBcdTc0MDZcdThCQkFcdTc2ODRcdTY1NzBcdTVCNjYnLCBsaW5rOiAnL25vdGVzL21hdGgvbWF0aC1mb3ItbGVhcm5pbmcnIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU2NTcwXHU1QjY2XHU2OTgyXHU1RkY1XHU4OUUzXHU4QkZCJywgbGluazogJy9ub3Rlcy9tYXRoL21hdGgtaW50ZXJwcmV0YXRpb24nIH0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiAnXHU2MDFEXHU4MDAzJyxcclxuICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6ICdcdTk2OEZcdTdCMTQnLFxyXG4gICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTk2OEZcdTdCMTQgXHUwMEI3IFx1NUJGQ1x1OEJGQicsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTk2OEZcdTdCMTRcdTYwM0JcdTg5QzhcdUZGMDhcdThCRkJcdThGRDlcdTdCQzdcdTUxNDhcdUZGMDknLCBsaW5rOiAnL25vdGVzL2Vzc2F5cy9odWInIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGV4dDogJ1x1NjVCOVx1NTQxMVx1NTczMFx1NTZGRVx1RkYwOFx1NEVDRVx1OEZEOVx1OTFDQ1x1NUYwMFx1NTlDQlx1RkYwOScsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdBSSBcdTRFMTNcdTRFMUFcdTVCNjZcdTRFNjBcdTUzODZcdTdBMEJcdTRFMEVcdTY1QjlcdTU0MTFcdTU3MzBcdTU2RkUnLCBsaW5rOiAnL25vdGVzL2Vzc2F5cy9yb2FkbWFwJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTc5RDFcdTc4MTRcdTVGQzNcdTYwMDFcdTRFMEVcdTY1QjlcdTU0MTEnLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1OTgyXHU0RjU1XHU5MDA5XHU2MkU5XHU3ODE0XHU3QTc2XHU2NUI5XHU1NDExJywgbGluazogJy9ub3Rlcy9lc3NheXMvY2hvb3NlLWRpcmVjdGlvbicgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1MTQ4XHU4REVGJywgbGluazogJy9ub3Rlcy9lc3NheXMvcm9hZG1hcCcgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU5ODc2XHU0RjFBXHU4QkJBXHU2NTg3XHU4QkU1XHU2MDBFXHU0RTQ4XHU4QkZCJywgbGluazogJy9ub3Rlcy9lc3NheXMvcmVzZWFyY2gtanVkZ21lbnQnIH0sXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NEVDMFx1NEU0OFx1NjI0RFx1N0I5N1x1NzcxRlx1NkI2M1x1NzY4NFx1NzlEMVx1NzgxNFx1OEQyMVx1NzMyRScsIGxpbms6ICcvbm90ZXMvZXNzYXlzL3doYXQtY291bnRzLWFzLXJlc2VhcmNoJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTU5MERcdTUyMjlcdTYwMURcdTYwRjNcdTRFMEVcdTc4MTRcdTdBNzZcdTU4QzFcdTU3OTInLCBsaW5rOiAnL25vdGVzL2Vzc2F5cy9oYW1taW5nLWNvbXBvdW5kJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTRFRTVcdTVDMEZcdTUzNUFcdTU5MjdcdTc2ODRcdTc4MTRcdTdBNzZcdTY4NDhcdTRGOEInLCBsaW5rOiAnL25vdGVzL2Vzc2F5cy9sZWFuLXJlc2VhcmNoJyB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdcdTc5RDFcdTVCNjZcdTU0RjJcdTVCNjYnLFxyXG4gICAgICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU3OUQxXHU1QjY2XHU0RTBFXHU1REU1XHU3QTBCXHU3Njg0XHU1MjA2XHU5MUNFJywgbGluazogJy9ub3Rlcy9lc3NheXMvc2NpZW5jZS12cy1lbmdpbmVlcmluZycgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU3OUQxXHU1QjY2XHU0RjVDXHU0RTNBXHU1OTI5XHU4MDRDXHVGRjA4XHU5N0U2XHU0RjJGXHVGRjA5JywgbGluazogJy9ub3Rlcy9lc3NheXMvc2NpZW5jZS1hcy12b2NhdGlvbicgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1QzFBXHU2NzJBXHU4OUUzXHU1MUIzXHU3Njg0XHU1RjAwXHU2NTNFXHU5NUVFXHU5ODk4JywgbGluazogJy9ub3Rlcy9lc3NheXMvYmlnLXF1ZXN0aW9ucycgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU4MkU2XHU2REE5XHU2NTU5XHU4QkFEXHU1MThEXHU4OUUzXHU4QkZCJywgbGluazogJy9ub3Rlcy9lc3NheXMvYml0dGVyLWxlc3Nvbi1pbmR1Y3RpdmUtYmlhcycgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0OiAnXHU2MjgwXHU2NzJGXHU0RTBFXHU3OTNFXHU0RjFBJyxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NTkwRFx1Njc0Mlx1N0NGQlx1N0VERlx1NEUwRVx1OEJBMVx1N0I5N1x1NEUwRFx1NTNFRlx1N0VBNicsIGxpbms6ICcvbm90ZXMvZXNzYXlzL2NvbXBsZXgtc3lzdGVtcycgfSxcclxuICAgICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1MTc3XHU4RUFCXHU2NjdBXHU4MEZEJywgbGluazogJy9ub3Rlcy9lc3NheXMvZW1ib2RpZWQtaW50ZWxsaWdlbmNlJyB9LFxyXG4gICAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTRFQkFcdTc2ODRcdTRFMERcdTUzRUZcdTY2RkZcdTRFRTNcdTRFRjdcdTUwM0MnLCBsaW5rOiAnL25vdGVzL2Vzc2F5cy9odW1hbi12YWx1ZS1pbi1haS1lcmEnIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiAnXHU3ODE0XHU3QTc2XHU1NEMxXHU1NDczJyxcclxuICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICB7IHRleHQ6ICdcdTRFQzBcdTRFNDhcdTY2MkZcdTMwMENcdTY3MDlcdThEQTNcdTMwMERcdTc2ODRcdTc4MTRcdTdBNzYnLCBsaW5rOiAnL25vdGVzL3Jlc2VhcmNoLXRhc3RlL3doYXQtaXMtaW50ZXJlc3RpbmcnIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU5ODc2XHU0RjFBXHU1MjA2XHU2NzkwXHU4QkJBXHU2NTg3XHU1MDVBXHU1QkY5XHU0RTg2XHU0RUMwXHU0RTQ4JywgbGluazogJy9ub3Rlcy9yZXNlYXJjaC10YXN0ZS9jbGFzc2ljLWFuYWx5c2VzJyB9LFxyXG4gICAgICAgICAgICAgIHsgdGV4dDogJ1x1NTk4Mlx1NEY1NVx1ODFFQVx1NEUwQVx1ODAwQ1x1NEUwQlx1NEVBN1x1NzUxRlx1OEJGRVx1OTg5OCcsIGxpbms6ICcvbm90ZXMvcmVzZWFyY2gtdGFzdGUvdG9waWMtZ2VuZXJhdGlvbicgfSxcclxuICAgICAgICAgICAgICB7IHRleHQ6ICdcdTU5MjdcdTZBMjFcdTU3OEJcdTY1RjZcdTRFRTNcdTc2ODRcdTMwMENcdTY3MDlcdThEQTNcdTMwMEQnLCBsaW5rOiAnL25vdGVzL3Jlc2VhcmNoLXRhc3RlL2ZvdW5kYXRpb24tZXJhJyB9LFxyXG4gICAgICAgICAgICAgIHsgdGV4dDogJ1x1NTIwNlx1Njc5MFx1N0M3Qlx1OEJCQVx1NjU4N1x1NzY4NCAxOCBcdTRFMkFcdTUzRTVcdTZDRDVcdTlBQThcdTY3QjYnLCBsaW5rOiAnL25vdGVzL3Jlc2VhcmNoLXRhc3RlL3NlbnRlbmNlLXBhdHRlcm5zJyB9LFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogJ1x1NURFNVx1N0EwQlx1NEUwRVx1NUU5NFx1NzUyOCcsXHJcbiAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgeyB0ZXh0OiAnUHl0aG9uIFx1NEUwRSBQeVRvcmNoIFx1NURFNVx1N0EwQlx1NTdGQVx1Nzg0MCcsIGxpbms6ICcvbm90ZXMvZW5naW5lZXJpbmcvcHl0aG9uLXB5dG9yY2gnIH0sXHJcbiAgICAgICAgICB7IHRleHQ6ICdBSSBcdTU3MjhcdTkxRDFcdTg3OERcdTk4ODZcdTU3REZcdTc2ODRcdTk3NUVcdTVFNzNcdTdBMzNcdTYwMjdcdTk2QkVcdTk4OTgnLCBsaW5rOiAnL25vdGVzL2VuZ2luZWVyaW5nL2FpLWluLWZpbmFuY2UnIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6ICdcdUQ4M0NcdURGMUYgXHU3Q0JFXHU5MDA5JyxcclxuICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxyXG4gICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHRleHQ6ICdcdTdDQkVcdTkwMDkgXHUwMEI3IFx1NUJGQ1x1OEJGQicsXHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU3Q0JFXHU5MDA5XHVGRjFBXHU3QjJDXHU0RTAwXHU2ODYzXHU0RUY3XHU1MDNDXHU2NTg3XHU3QUUwJywgbGluazogJy9ub3Rlcy9lc3NheXMvZmVhdHVyZWQnIH0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0ZXh0OiAnXHU2NTM2XHU1RjU1XHU2NTg3XHU3QUUwJyxcclxuICAgICAgICAgICAgaXRlbXM6IFtcclxuICAgICAgICAgICAgICB7IHRleHQ6ICdcdTc5RDFcdTVCNjZcdTc4MTRcdTdBNzZcdUZGMUFcdTY2MkZcdTRFQzBcdTRFNDhcdTMwMDFcdTRFM0FcdTRFQzBcdTRFNDhcdTMwMDFcdTYwMEVcdTRFNDhcdTUwNUEnLCBsaW5rOiAnL25vdGVzL2Vzc2F5cy9zY2llbnRpZmljLXJlc2VhcmNoJyB9LFxyXG4gICAgICAgICAgICAgIHsgdGV4dDogJ1x1NTE0OFx1OERFRicsIGxpbms6ICcvbm90ZXMvZXNzYXlzL3JvYWRtYXAnIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU4MUVBXHU1NkRFXHU1RjUyXHU1OTI3XHU2QTIxXHU1NzhCXHU3Njg0XHU1MTg1XHU5MEU4XHU2NzNBXHU1MjM2JywgbGluazogJy9ub3Rlcy9yZXByZXNlbnRhdGlvbi9hdXRvcmVncmVzc2l2ZS1pbnRlcm5hbHMnIH0sXHJcbiAgICAgICAgICAgICAgeyB0ZXh0OiAnQmVuY2htYXJrIFx1OEJCQVx1NjU4N1x1NTE5OVx1NEY1QycsIGxpbms6ICcvbm90ZXMvbWV0aG9kb2xvZ3kvYmVuY2htYXJrLXdyaXRpbmcnIH0sXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICBdLFxyXG5cclxuICAgIHNvY2lhbExpbmtzOiBbeyBpY29uOiAnZ2l0aHViJywgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS9MdW1lbkF1cm9yYScgfV0sXHJcblxyXG4gICAgZm9vdGVyOiB7XHJcbiAgICAgIG1lc3NhZ2U6ICdcdTU3RkFcdTRFOEVcdTRFMkFcdTRFQkFcdTdCMTRcdThCQjBcdTY1NzRcdTc0MDYgXHUwMEI3IFx1NTE4NVx1NUJCOVx1NEVDNVx1NEVFM1x1ODg2OFx1OTYzNlx1NkJCNVx1NjAyN1x1NzQwNlx1ODlFMycsXHJcbiAgICAgIGNvcHlyaWdodDogJ0NvcHlyaWdodCBcdTAwQTkgMjAyNiBDaGFuZ25pbmcgTGl1JyxcclxuICAgIH0sXHJcblxyXG4gICAgZWRpdExpbms6IHtcclxuICAgICAgcGF0dGVybjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9MdW1lbkF1cm9yYS9MdW1lbkF1cm9yYS5naXRodWIuaW8vZWRpdC9tYWluLzpwYXRoJyxcclxuICAgICAgdGV4dDogJ1x1NTcyOCBHaXRIdWIgXHU0RTBBXHU3RjE2XHU4RjkxXHU2QjY0XHU5ODc1JyxcclxuICAgIH0sXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrWCxTQUFTLG9CQUFvQjtBQUMvWSxTQUFTLGFBQWE7QUFHdEIsU0FBUyxTQUFTLE1BQXdCO0FBQ3hDLFFBQU0sU0FBbUIsQ0FBQztBQUMxQixRQUFNLEtBQUssS0FBSyxZQUFZLEVBQUUsTUFBTSxlQUFlO0FBQ25ELE1BQUksR0FBSSxRQUFPLEtBQUssR0FBRyxFQUFFO0FBQ3pCLFFBQU0sS0FBSyxLQUFLLE1BQU0sa0JBQWtCO0FBQ3hDLE1BQUksSUFBSTtBQUNOLGFBQVMsSUFBSSxHQUFHLElBQUksR0FBRyxRQUFRLEtBQUs7QUFDbEMsYUFBTyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFVBQUksSUFBSSxJQUFJLEdBQUcsT0FBUSxRQUFPLEtBQUssR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUNBLFNBQU87QUFDVDtBQUVBLElBQU8saUJBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLE9BQU87QUFBQSxFQUNQLGVBQWU7QUFBQSxFQUNmLGFBQ0U7QUFBQSxFQUNGLE1BQU07QUFBQSxJQUNKLENBQUMsUUFBUSxFQUFFLE1BQU0sZUFBZSxTQUFTLFVBQVUsQ0FBQztBQUFBLElBQ3BELENBQUMsUUFBUSxFQUFFLFVBQVUsV0FBVyxTQUFTLFVBQVUsQ0FBQztBQUFBLElBQ3BELENBQUMsUUFBUSxFQUFFLFVBQVUsYUFBYSxTQUFTLFFBQVEsQ0FB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
