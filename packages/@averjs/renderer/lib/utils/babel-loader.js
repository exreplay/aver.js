import merge from 'lodash/merge';
import { isPureObject } from '@averjs/shared-utils';

export default class BabelLoader {
  constructor(isServer, config, perfLoader) {
    this.config = config.webpack;
    this.isServer = isServer;
    this.perfLoader = perfLoader;
    this.cacheDir = config.cacheDir;
  }

  get transpileDeps() {
    return this.config.transpileDependencies.map(dep => {
      if (typeof dep === 'string') {
        return new RegExp(dep);
      } else if (dep instanceof RegExp) {
        return dep;
      } else {
        return false;
      }
    }).filter(_ => _);
  }

  presetConfig() {
    let config = {
      buildTarget: this.isServer ? 'server' : 'client'
    };

    if (typeof this.config.babel === 'function') {
      this.config.babel({ isServer: this.isServer }, config);
    } else if (isPureObject(this.config.babel)) {
      config = merge({}, config, this.config.babel);
    }

    return config;
  }

  apply(chain) {
    const jsRule = chain.module
      .rule('js')
        .test(/\.js$/)
        .exclude
          .add(filepath => {
            // always transpile javascript in vue files
            if (/\.vue\.js$/.test(filepath)) return false;
            
            // transpile project path
            if (filepath.includes(process.env.PROJECT_PATH)) return false;

            // transpile cache dir
            if (filepath.includes(this.cacheDir)) return false;

            // check if user wants to transpile it
            if (this.transpileDeps.some(dep => dep.test(filepath))) return false;

            // Ignore node_modules
            return /node_modules/.test(filepath);
          })
          .end();

    this.perfLoader.apply(jsRule, 'js');

    jsRule.use('babel-loader')
          .loader('babel-loader')
          .options({
            presets: [
              [
                require.resolve('@averjs/babel-preset-app'),
                this.presetConfig()
              ]
            ]
          });
  }
}
