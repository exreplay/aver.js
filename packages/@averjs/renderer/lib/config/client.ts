import webpack, { Configuration } from 'webpack';
import WebpackBaseConfiguration from './base';
import fs from 'fs';
import path from 'path';
import VueSSRClientPlugin from '../utils/vue/client-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import HTMLPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'css-minimizer-webpack-plugin';
import SafeParser from 'postcss-safe-parser';
import cloneDeep from 'lodash/cloneDeep';
import FriendlyErrorsPlugin from '@averjs/friendly-errors-webpack-plugin';
import Core from '@averjs/core';
import TerserPlugin from 'terser-webpack-plugin';
import { TerserOptions } from 'terser-webpack-plugin/types/utils';
import {
  GenerateSW,
  GenerateSWOptions,
  InjectManifest,
  InjectManifestOptions
} from 'workbox-webpack-plugin';
import { SplitChunksOptions } from 'webpack-chain';

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

    if (fs.existsSync(path.resolve(this.projectRoot, './resources/images'))) {
      this.chainConfig.plugin('copy').use(CopyWebpackPlugin, [
        {
          patterns: [
            {
              from: path.resolve(this.projectRoot, './resources/images'),
              to: path.resolve(this.projectRoot, '../public/images'),
              force: true
            }
          ]
        }
      ]);
    }

    this.chainConfig
      .plugin('html')
      .use(HTMLPlugin, [htmlPluginOptions])
      .end()
      .plugin('define')
      .use(webpack.DefinePlugin, [
        {
          'process.env.NODE_ENV': JSON.stringify(
            process.env.NODE_ENV || 'development'
          ),
          'process.env.VUE_ENV': JSON.stringify('client'),
          PRODUCTION: this.isProd,
          ...this.webpackConfig?.process?.env
        }
      ])
      .end()
      .plugin('vue-ssr-client')
      .use(VueSSRClientPlugin);

    this.chainConfig.plugin('friendly-errors').use(FriendlyErrorsPlugin, [
      {
        showSuccessInfo: false,
        showCompilingInfo: false,
        clearConsole: false,
        logLevel: 'WARNING'
      }
    ]);
  }

  serviceWorker() {
    if (!this.webpackConfig?.sw) return;

    let plugin: GenerateSW | InjectManifest = GenerateSW;
    const swConfig = this.webpackConfig.sw;
    const mode = swConfig.mode || 'GenerateSW';
    const conf = {
      exclude: [/\.map$/, /img\/icons\//, /favicon\.ico$/, /manifest\.json$/],
      ...swConfig
    } as GenerateSWOptions | InjectManifestOptions;

    delete swConfig.mode;

    if (mode === 'GenerateSW' && !(conf as GenerateSWOptions).cacheId)
      (conf as GenerateSWOptions).cacheId = 'averjs';

    if (mode === 'GenerateSW' && 'cacheId' in conf) {
      conf.inlineWorkboxRuntime = true;
    } else if (mode === 'InjectManifest' && 'swSrc' in conf) {
      plugin = InjectManifest;
      conf.swSrc = path.resolve(process.env.PROJECT_PATH, conf.swSrc);
    }

    this.chainConfig.plugin('workbox').use(plugin, [conf]);
  }

  optimization() {
    super.optimization();

    this.chainConfig.optimization.runtimeChunk('single');

    const splitChunks: SplitChunksOptions = {
      cacheGroups: {
        defaultVendors: {
          name: 'vendors',
          test: /[/\\]node_modules[/\\]/,
          priority: -10,
          chunks: 'initial'
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    };

    if (this.isProd && this.webpackConfig.css?.extract) {
      splitChunks.cacheGroups.styles = {
        name: 'styles',
        type: 'css/mini-extract',
        test: /\.(s?css|vue)$/,
        chunks: 'initial',
        minChunks: 1,
        enforce: true
      };
    }

    if (this.webpackConfig?.runtimeChunk)
      this.chainConfig.optimization.runtimeChunk(
        this.webpackConfig.runtimeChunk
      );

    this.chainConfig.optimization.splitChunks(splitChunks);

    // Speed up tests by disabling minification
    if (process.env.NODE_ENV !== 'test') {
      this.chainConfig.optimization.minimizer('terser').use(TerserPlugin, [
        {
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
        } as TerserOptions
      ] as never);
    }

    this.chainConfig.optimization
      .minimizer('minimize-css')
      .use(MiniCssExtractPlugin, [
        {
          minimizerOptions: {
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
        }
      ]);
  }

  async config(isStatic: boolean) {
    await super.config(isStatic);

    this.chainConfig.output //     .end() //     .add(path.join(this.libRoot, 'vue/entry-client.js')) // .entry('app')
      .filename(`_averjs/js/${this.isProd ? '[contenthash].' : '[name].'}js`);

    if (typeof this.webpackConfig?.client === 'function')
      this.webpackConfig.client({
        chain: this.chainConfig,
        isServer: false,
        config: this.aver.config
      });

    await this.aver.callHook('renderer:client-config', this.chainConfig);

    const configObj = this.chainConfig.toConfig();
    const config: Configuration = Object.assign(configObj, {
      entry: {
        app: path.join(this.cacheDir, 'entry-client.js')
      },
      resolve: {
        ...configObj.resolve,
        fallback: {
          setImmediate: false,
          dgram: 'empty',
          fs: 'empty',
          net: 'empty',
          tls: 'empty',
          child_process: 'empty'
        }
      },
      optimization: {
        moduleIds: 'deterministic'
      }
    } as Configuration);

    return cloneDeep(config);
  }
}
