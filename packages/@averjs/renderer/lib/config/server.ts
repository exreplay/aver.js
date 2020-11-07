import webpack, { Configuration } from 'webpack';
import WebpackBaseConfiguration from './base';
import path from 'path';
import nodeExternals from 'webpack-node-externals';
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin';
import cloneDeep from 'lodash/cloneDeep';
import Core from '@averjs/core';

export default class WebpackServerConfiguration extends WebpackBaseConfiguration {
  constructor(aver: Core) {
    super(true, aver);
  }

  plugins() {
    super.plugins();

    this.chainConfig
      .plugin('define')
      .use(webpack.DefinePlugin, [{
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.VUE_ENV': JSON.stringify('server'),
        PRODUCTION: this.isProd
      }])
      .end()
      .plugin('vue-ssr-server')
      .use(VueSSRServerPlugin);
  }

  async config(isStatic: boolean): Promise<Configuration> {
    await super.config(isStatic);

    this.chainConfig
      .target('node')
      // .entry('app')
      //     .add(path.join(this.libRoot, 'vue/entry-server.js'))
      //     .end()
      .output
      .libraryTarget('commonjs2')
      .filename('bundle.server.js')
      .end()
      .optimization
      .splitChunks({})
      .end()
      .externals(nodeExternals({
        allowlist: [
          /es6-promise|\.(?!(?:js|json)$).{1,5}$/i,
          /\.css$/,
          /\?vue&type=style/,
          ...this.babelLoader.transpileDeps
        ],
        modulesDir: 'node_modules'
      }));
        
    if (typeof this.webpackConfig.server === 'function') this.webpackConfig.server(this.chainConfig);

    await this.aver.callHook('renderer:server-config', this.chainConfig);

    const config = Object.assign(this.chainConfig.toConfig(), {
      entry: {
        app: path.join(this.cacheDir, 'entry-server.js')
      }
    });

    return cloneDeep(config);
  }
}
