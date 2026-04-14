import { configure } from 'quasar/wrappers';

export default configure(function (ctx) {
  return {
    supportTS: false,

    boot: [],

    css: ['app.scss'],

    extras: ['material-icons'],

    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13'],
      },
    },

    devServer: {
      open: true,
      port: 8080,
    },

    framework: {
      config: {},
      plugins: [],
    },

    animations: [],

    ssr: {
      pwa: false,
    },

    pwa: {
      workboxPluginMode: 'GenerateSW',
    },
  };
});
