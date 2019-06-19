import webpack from 'webpack';
import WebpackBaseConfiguration from './base';
import path from 'path';
import nodeExternals from 'webpack-node-externals';
import VueSSRServerPlugin from 'vue-server-renderer/server-plugin';
import cloneDeep from 'lodash/cloneDeep';

export default class WebpackServerConfiguration extends WebpackBaseConfiguration {
  constructor() {
    super(true);
  }

  plugins() {
    super.plugins();

    this.chainConfig
      .plugin('define')
        .use(webpack.DefinePlugin, [{
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
          'process.env.VUE_ENV': JSON.stringify('server'),
          'PRODUCTION': this.isProd
        }])
        .end()
      .plugin('vue-ssr-server')
        .use(VueSSRServerPlugin);
  }

  config() {
    super.config();

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
        .splitChunks(false)
        .end()
      .externals(nodeExternals({
        whitelist: [
          /es6-promise|\.(?!(?:js|json)$).{1,5}$/i,
          /\.css$/,
          /\?vue&type=style/
        ],
        modulesDir: 'node_modules'
      }));
        
    if (typeof this.globalConfig.server === 'function') this.globalConfig.server(this.chainConfig);

    const config = Object.assign(this.chainConfig.toConfig(), {
      entry: {
        app: path.join(this.cacheDir, 'entry-server.js')
      }
    });

    return cloneDeep(config);
  }
}
