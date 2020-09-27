import webpack, { Configuration } from 'webpack';
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
import Core from '@averjs/core';
import TerserPlugin, { ExtractCommentOptions } from 'terser-webpack-plugin';
import { GenerateSW, GenerateSWOptions, InjectManifest, InjectManifestOptions } from 'workbox-webpack-plugin';
import { SplitChunksOptions } from 'webpack-chain';

export interface RendererClientConfig extends Configuration {
  entry: {
    app: string | string[]
  }
}

export default class WebpackClientConfiguration extends WebpackBaseConfiguration {
  projectRoot = path.resolve(process.env.PROJECT_PATH, '.');

  constructor(aver: Core) {
    super(false, aver);
  }

  plugins() {
    super.plugins();
    const htmlPluginOptions = {
      filename: 'index.ssr.html',
      template: path.join(this.cacheDir, 'index.template.html'),
      minify: false,
      inject: false
    };

    if (this.isProd) this.serviceWorker();

    if (fs.existsSync(path.join(this.projectRoot, 'resources/images'))) {
      this.chainConfig
        .plugin('copy')
          .use(CopyWebpackPlugin, [
            {
              patterns: [
                {
                  from: path.join(this.projectRoot, 'resources/images'),
                  to: path.join(this.projectRoot, '../public/images'),
                  force: true
                }
              ]
            }
          ]);
    }

    this.chainConfig
      .plugin('html')
        .use(HTMLPlugin, [ htmlPluginOptions ])
        .end()
      .plugin('define')
        .use(webpack.DefinePlugin, [ {
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
          'process.env.VUE_ENV': JSON.stringify('client'),
          PRODUCTION: this.isProd,
          ...this.webpackConfig.process?.env
        } ])
        .end()
      .plugin('vue-ssr-client')
        .use(VueSSRClientPlugin);
      
    this.chainConfig
      .plugin('friendly-errors')
        .use(FriendlyErrorsPlugin, [ {
          showSuccessInfo: false,
          showCompilingInfo: false,
          clearConsole: false,
          logLevel: 'WARNING'
        } ]);
  }

  serviceWorker() {
    if(!this.webpackConfig.sw) return;

    let plugin: GenerateSW | InjectManifest = GenerateSW;
    const swConfig = this.webpackConfig.sw;
    const mode = swConfig.mode || 'GenerateSW';
    let conf = {
      exclude: [
        /\.map$/,
        /img\/icons\//,
        /favicon\.ico$/,
        /manifest\.json$/
      ]
    } as GenerateSWOptions | InjectManifestOptions;

    delete swConfig.mode;

    if (mode === 'GenerateSW' && 'cacheId' in conf) {
      conf.cacheId = 'averjs';
      conf.inlineWorkboxRuntime = true;
    }
    else if (mode === 'InjectManifest' && 'swSrc' in conf) {
      plugin = InjectManifest;
      conf.swSrc = path.resolve(process.env.PROJECT_PATH, conf.swSrc);
    }

    conf = {
      ...conf,
      ...swConfig
    }

    this.chainConfig
      .plugin('workbox')
      .use(plugin, [ conf ]);
  }

  optimization() {
    super.optimization();

    this.chainConfig.optimization.runtimeChunk('single');

    const splitChunks: SplitChunksOptions = {
      cacheGroups: {
        commons: {
          test: /node_modules[\\/](vue|vue-loader|vue-router|vuex|vue-meta|core-js|babel-runtime|es6-promise|axios|webpack|setimmediate|timers-browserify|process|regenerator-runtime|cookie|js-cookie|is-buffer|dotprop)[\\/].*\.js$/,
          chunks: 'all',
          priority: 10,
          name: true
        }
      }
    };
    
    if (process.env.NODE_ENV === 'production' && this.webpackConfig.css?.extract) {
      splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(s?css|vue)$/,
        minChunks: 1,
        chunks: 'all',
        enforce: true
      };
    }
    
    this.chainConfig.optimization
      .splitChunks(splitChunks);

    this.chainConfig.optimization
      .minimizer('terser')
        .use(TerserPlugin, [ {
          sourceMap: true,
          cache: true,
          parallel: false,
          extractComments: {
            filename: 'LICENSES'
          } as ExtractCommentOptions,
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
        } ]);
        
    this.chainConfig.optimization
      .minimizer('optimize-css')
        .use(OptimizeCssAssetsPlugin, [ {
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
        } ]);
  }

  async config(isStatic: boolean): Promise<RendererClientConfig> {
    await super.config(isStatic);
        
    this.chainConfig
      // .entry('app')
      //     .add(path.join(this.libRoot, 'vue/entry-client.js'))
      //     .end()
      .output
        .filename(`_averjs/js/${this.isProd ? '[contenthash].' : '[name].'}js`);
        
    if (typeof this.webpackConfig.client === 'function') this.webpackConfig.client(this.chainConfig);
    
    await this.aver.callHook('renderer:client-config', this.chainConfig);

    const config = Object.assign(this.chainConfig.toConfig(), {
      entry: {
        app: path.join(this.cacheDir, 'entry-client.js')
      }
    });

    return cloneDeep(config);
  }
}
