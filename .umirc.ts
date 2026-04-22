import { defineConfig } from "umi";
import { sysRoutes } from "./src/routes/index";
import { config } from "./src/config";
import { iconList } from "./src/icons";

const server1 = '123.249.26.106';
const server2 = '115.120.63.198';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const rawBasePath = process.env.UMI_APP_BASE_PATH || '/';
const normalizedBasePath = rawBasePath.endsWith('/') ? rawBasePath : `${rawBasePath}/`;
const routeBasePath = isGitHubPages ? '/' : normalizedBasePath;

export default defineConfig({
  plugins: [
    "@umijs/plugins/dist/access",
    "@umijs/plugins/dist/initial-state",
    "@umijs/plugins/dist/model",
    "@umijs/plugins/dist/locale",
    // "@umijs/plugins/dist/icons",
  ],
  analyze: {
    // 默认即可；你也可以指定 analyzerPort / openAnalyzer 等
  },
  codeSplitting: {
    jsStrategy: 'granularChunks', // 或 'depPerChunk'
  },
  base: routeBasePath,
  publicPath: normalizedBasePath,
  history: {
    type: isGitHubPages ? 'hash' : 'browser',
  },
  title: config.appName,
  // access: {},
  // model: {},
  // initialState: {},
  clientLoader: {},
  icons: {
    autoInstall: {},
    include: [...iconList],
    defaultComponentConfig: {}
  },
  mock: {
    include: ["src/mock/**/index.ts"],
  },
  externals: {
    echarts: "echarts",
    'cherry-markdown/dist/cherry-markdown.core': 'Cherry',

  },
  headScripts: ["https://unpkg.com/echarts@5.6.0/dist/echarts.min.js",
    "https://unpkg.com/cherry-markdown@0.10.3/dist/cherry-markdown.core.js",
    // "https://cdn.jsdelivr.net/npm/cherry-markdown@0.10.3",

  ],
  routes: sysRoutes,
  locale: {
    // 默认使用 src/locales/zh-CN.ts 作为多语言文件
    default: 'zh-CN',
    baseSeparator: '-',
  },
  lessLoader: {
    modifyVars: {
      hack: `true; @import "~@/styles/index.less";`,
    },
  },
  sassLoader: {
    additionalData: `@use "@/ppt/styles/variable.scss" as *; @use "@/ppt/styles/mixin.scss" as *;`,
  },
  // 只设置 dev 阶段的 sourcemap
  devtool: process.env.NODE_ENV === 'development' ? 'eval' : false,
  // devServer: {
  //   // 其他配置...
  //   compress: false, // 禁用 gzip 压缩
  //   // 其他配置...
  // },

  npmClient: "pnpm",
  proxy: {

    "/helper/api": {
      target: "http://115.120.17.160:9091/",
      // target: 'http://26.177.21.79:8085',
      //target: "http://127.0.0.1:9091/",
      changeOrigin: true,

      // onProxyRes: (proxyRes, req, res) => {
      //   console.log('proxyRes', proxyRes);
      //   // 确保响应头支持流式传输
      //   proxyRes.headers['transfer-encoding'] = 'chunked';
      //   proxyRes.headers['connection'] = 'keep-alive';

      //   // 禁用缓存以支持流式传输
      //   delete proxyRes.headers['cache-control'];
      //   delete proxyRes.headers['expires'];
      //   delete proxyRes.headers['etag'];
      // },


    },
    "/knowledgeq/api": {
      target: "http://115.120.17.160:9092/",
      changeOrigin: true,
    },
    "/dataq/api": {
      target: "http://115.120.17.160:9093/",
      changeOrigin: true,
    },
    "/agent/api": {
      target: "http://115.120.17.160:9095/",
      changeOrigin: true,
    },
    "/aippt/api": {
      target: `http://${server2}:8081/`,
      changeOrigin: true,
    },
    "/demo": {
      target: "https://api.mateppt.codingfgd.asia",
      changeOrigin: true,
      secure: true,
    },
    "/__oss_proxy": {
      target: "https://mateppt.oss-cn-shanghai.aliyuncs.com",
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        "^/__oss_proxy": "",
      },
    },
    "/aiavatar/api": {
      target: `http://${server2}:8087/`,
      changeOrigin: true,
    },

  },
  esbuildMinifyIIFE: true,
  // vite: {},
});
