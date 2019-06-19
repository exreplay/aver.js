import webpack from 'webpack';
import WebpackBaseConfiguration from './base';
import fs from 'fs';
import path from 'path';
import VueSSRClientPlugin from 'vue-server-renderer/client-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HTMLPlugin from 'html-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import SafeParser from 'postcss-safe-parser';
import cloneDeep from 'lodash/cloneDeep';
import FriendlyErrorsPlugin from '@averjs/friendly-errors-webpack-plugin';

export default class WebpackClientConfiguration extends WebpackBaseConfiguration {
  constructor() {
    super(false);
    this.projectRoot = path.resolve(process.env.PROJECT_PATH, '.');
  }

  plugins() {
    super.plugins();
    let htmlPluginOptions = {
      filename: 'index.ssr.html',
      template: path.join(this.cacheDir, 'index.template.html'),
      inject: false
    };

    if (this.isProd && typeof this.globalConfig.sw !== 'undefined') this.serviceWorker();

    if (fs.existsSync(path.join(this.projectRoot, 'resources/images'))) {
      this.chainConfig
        .plugin('copy')
          .use(CopyWebpackPlugin, [
            [{
              from: path.join(this.projectRoot, 'resources/images'),
              to: path.join(this.projectRoot, '../public/images'),
              force: true
            }]
          ]);
    }

    this.chainConfig
      .plugin('html')
        .use(HTMLPlugin, [ htmlPluginOptions ])
        .end()
      .plugin('define')
        .use(webpack.DefinePlugin, [{
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
          'process.env.VUE_ENV': JSON.stringify('client'),
          'PRODUCTION': this.isProd,
          ...this.globalConfig.process.env
        }])
        .end()
      .plugin('vue-ssr-client')
        .use(VueSSRClientPlugin);
      
    this.chainConfig
      .plugin('friendly-errors')
        .use(FriendlyErrorsPlugin, [{
          showSuccessInfo: false,
          showCompilingInfo: false,
          clearConsole: false,
          logLevel: 'WARNING'
        }]);
  }

  serviceWorker() {
    const WorkboxWebpackModule = require('workbox-webpack-plugin');
    const swConfig = this.globalConfig.sw;
    const mode = swConfig.mode || 'GenerateSW';
    delete swConfig.mode;

    let conf = {
      exclude: [
        /\.map$/,
        /img\/icons\//,
        /favicon\.ico$/,
        /manifest\.json$/
      ]
    };

    if (mode === 'GenerateSW') {
      Object.assign(conf, { cacheId: 'averjs' });
    }

    Object.assign(conf, { ...swConfig });

    if (mode === 'InjectManifest') {
      Object.assign(conf, { swSrc: path.resolve(process.env.PROJECT_PATH, conf.swSrc) });
    }

    this.chainConfig
      .plugin('workbox')
        .use(WorkboxWebpackModule[mode], [ conf ]);
  }

  optimization() {
    super.optimization();
        
    this.chainConfig.optimization
      .splitChunks({
        cacheGroups: {
          commons: {
            test: /node_modules[\\/](vue|vue-loader|vue-router|vuex|vue-meta|core-js|babel-runtime|es6-promise|axios|webpack|setimmediate|timers-browserify|process|regenerator-runtime|cookie|js-cookie|is-buffer|dotprop|nuxt\.js)[\\/]/,
            chunks: 'all',
            priority: 10,
            name: true
          }
        }
      });

    const TerserPlugin = require('terser-webpack-plugin');

    this.chainConfig.optimization
      .minimizer('terser')
        .use(TerserPlugin, [{
          sourceMap: true,
          cache: true,
          parallel: false,
          extractComments: {
            filename: 'LICENSES'
          },
          terserOptions: {
            compress: {
              // turn off flags with small gains to speed up minification
              arrows: false,
              collapse_vars: false, // 0.3kb
              comparisons: false,
              computed_props: false,
              hoist_funs: false,
              hoist_props: false,
              hoist_vars: false,
              inline: false,
              loops: false,
              negate_iife: false,
              properties: false,
              reduce_funcs: false,
              reduce_vars: false,
              switches: false,
              toplevel: false,
              typeofs: false,
            
              // a few flags with noticable gains/speed ratio
              // numbers based on out of the box vendor bundle
              booleans: true, // 0.7kb
              if_return: true, // 0.4kb
              sequences: true, // 0.7kb
              unused: true, // 2.3kb
            
              // required features to drop conditional branches
              conditionals: true,
              dead_code: true,
              evaluate: true
            },
            mangle: {
              safari10: true
            },
            output: {
              comments: /^\**!|@preserve|@license|@cc_on/
            }
          }
        }]);
        
    this.chainConfig.optimization
      .minimizer('optimize-css')
        .use(OptimizeCssAssetsPlugin, [{
          cssProcessorPluginOptions: {
            preset: [
              'default',
              {
                parser: SafeParser,
                discardComments: {
                  removeAll: true
                }
              }
            ]
          }
        }]);
  }

  config() {
    super.config();
        
    this.chainConfig
      // .entry('app')
      //     .add(path.join(this.libRoot, 'vue/entry-client.js'))
      //     .end()
      .output
        .filename(`js/${this.isProd ? '[contenthash].' : '[name].'}js`);
        
    if (typeof this.globalConfig.client === 'function') this.globalConfig.client(this.chainConfig);

    const config = Object.assign(this.chainConfig.toConfig(), {
      entry: {
        app: path.join(this.cacheDir, 'entry-client.js')
      }
    });

    return cloneDeep(config);
  }
}
