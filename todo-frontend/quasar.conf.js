import { defineConfig } from 'quasar/wrappers'

export default defineConfig(function (/* ctx */) {
  return {
    boot: [],
    css: ['app.scss'],
    extras: [
      'roboto-font',
      'material-icons',
    ],
    build: {
      target: {
        browser: ['es2019'],
        node: 'node16',
      },
      vueRouterMode: 'hash',
      vueRouterBase: '/',
      publicPath: '/',
      preloadChunks: true,
      showProgress: false,
      gzip: false,
      analyze: false,
      env: {
        API_URL: process.env.API_URL || 'http://localhost:3000',
      },
      extendWebpack (cfg) {
      },
    },
    devServer: {
      open: true,
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '',
          },
        },
      },
    },
    framework: {
      config: {
        dark: false,
      },
      components: [],
      plugins: [],
    },
    animations: 'all',
    ssr: {
      pwa: false,
    },
    pwa: {
      workboxPluginMode: 'GenerateSW',
    },
    cordova: {
    },
    capacitor: {
      hideSplashscreen: true,
    },
    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 9222,
      bundler: 'webpack',
      preloadScripts: [],
      mainProcessFile: 'src-electron/electron-main.ts',
      preloadScripts: [
        'src-electron/electron-preload.ts',
      ],
    },
    bex: {
      contentScripts: [],
      manifests: {
        v2: {
          permissions: ['tabs', 'http://*/*', 'https://*/*'],
        },
        v3: {
          action: { default_title: 'Render some tabs' },
          host_permissions: ['http://*/*', 'https://*/*'],
        },
      },
    },
  }
})
