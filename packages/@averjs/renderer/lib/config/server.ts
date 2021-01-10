import webpack, { Configuration } from 'webpack';
import WebpackBaseConfiguration from './base';
import path from 'path';
import nodeExternals, { Options } from 'webpack-node-externals';
import VueSSRServerPlugin from '../plugins/vue/server-plugin';
import cloneDeep from 'lodash/cloneDeep';
import Core from '@averjs/core';

export default class WebpackServerConfiguration extends WebpackBaseConfiguration {
  get nodeExternalsOptions() {
    const options = { ...(this.webpackConfig.nodeExternals || {}) };
    const allowList = options.allowlist;
    delete options.allowlist;

    return {
      allowlist: [
        /es6-promise|\.(?!(?:js|json)$).{1,5}$/i,
        /\.css$/,
        /\?vue&type=style/,
        ...this.babelLoader.transpileDeps,
        ...(Array.isArray(allowList) ? allowList : [allowList])
      ],
      modulesDir: 'node_modules',
      ...options
    } as Options;
  }

  constructor(aver: Core) {
    super(true, aver);
  }

  rules() {
    super.rules();

    this.chainConfig.module
      .rule('js-server')
      .test(/\.js$/)
      .resourceQuery(/^\?vue/)
      .use(require.resolve('./registerComponent'));
  }

  plugins() {
    super.plugins();

    this.chainConfig
      .plugin('define')
      .use(webpack.DefinePlugin, [
        {
          'process.env.NODE_ENV': JSON.stringify(
            process.env.NODE_ENV || 'development'
          ),
          'process.env.VUE_ENV': JSON.stringify('server'),
          __VUE_OPTIONS_API__: JSON.stringify(true),
          __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
          PRODUCTION: this.isProd
        }
      ])
      .end()
      .plugin('vue-ssr-server')
      .use(VueSSRServerPlugin);
  }

  async config(isStatic: boolean) {
    await super.config(isStatic);

    this.chainConfig
      .target('node')
      // .entry('app')
      //     .add(path.join(this.libRoot, 'vue/entry-server.js'))
      //     .end()
      .output.libraryTarget('commonjs2')
      .filename('bundle.server.js')
      .end()
      .optimization.splitChunks({})
      .end()
      .externals(nodeExternals(this.nodeExternalsOptions));

    if (typeof this.webpackConfig?.server === 'function')
      this.webpackConfig.server(this.chainConfig);

    await this.aver.callHook('renderer:server-config', this.chainConfig);

    const config: Configuration = Object.assign(this.chainConfig.toConfig(), {
      entry: {
        app: path.join(this.cacheDir, 'entry-server.js')
      }
    } as Configuration);

    return cloneDeep(config);
  }
}
