import path from 'path';

export default () => ({
  babel: {},
  additionalExtensions: [ 'js' ],
  transpileDependencies: [],
  postcss: {},
  css: {
    extract: false,
    styleResources: {
      resources: [],
      options: {}
    }
  },
  alias: {
    '@': path.join(process.env.PROJECT_PATH),
    '@@': path.resolve(process.env.PROJECT_PATH, '../'),
    '@components': path.resolve(process.env.PROJECT_PATH, './components'),
    '@resources': path.resolve(process.env.PROJECT_PATH, './resources'),
    '@mixins': path.resolve(process.env.PROJECT_PATH, './mixins'),
    '@pages': path.resolve(process.env.PROJECT_PATH, './pages'),
    '@vuex': path.resolve(process.env.PROJECT_PATH, './vuex')
  },
  base: false,
  client: false,
  server: false,
  sw: false,
  process: {
    env: {}
  }
});
