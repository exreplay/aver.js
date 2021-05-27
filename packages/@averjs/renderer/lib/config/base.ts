import path from 'path';
import webpack, { Configuration } from 'webpack';
import WebpackChain from 'webpack-chain';
import { VueLoaderPlugin } from 'vue-loader';
import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin';
import StyleLoader from '../utils/style-loader';
import PerformanceLoader from '../utils/perf-loader';
import BabelLoader from '../utils/babel-loader';
import Webpackbar from 'webpackbar';
import FilesChanged from '../plugins/FilesChanged';
import Core from '@averjs/core';
import { AverWebpackConfig } from '@averjs/config';
import ESLintPlugin from 'eslint-webpack-plugin';

export default class WebpackBaseConfiguration {
  aver: Core;
  webpackConfig: AverWebpackConfig;

  chainConfig = new WebpackChain();
  isServer: boolean;
  cacheDir: string;
  distPath: string;
  isProd: boolean;
  commonRules = [];

  perfLoader: PerformanceLoader;
  styleLoader: StyleLoader;
  babelLoader: BabelLoader;

  constructor(isServer: boolean, aver: Core) {
    this.aver = aver;
    this.webpackConfig = aver.config.webpack || {};

    this.chainConfig = new WebpackChain();
    this.isServer = isServer;
    this.cacheDir = aver.config.cacheDir;
    this.distPath = aver.config.distPath;
    this.isProd = aver.config.isProd;

    this.commonRules = [];

    this.perfLoader = new PerformanceLoader(this.isServer, aver.config);
    this.perfLoader.warmupLoaders();
    this.styleLoader = new StyleLoader(
      this.isServer,
      aver.config,
      this.perfLoader
    );
    this.babelLoader = new BabelLoader(
      this.isServer,
      aver.config,
      this.perfLoader
    );
  }

  plugins() {
    this.chainConfig.plugin('eslint-webpack-plugin').use(ESLintPlugin, [
      {
        extensions: [...(this.webpackConfig.additionalExtensions || []), 'vue'],
        cache: true
      }
    ]);

    if (!this.isServer && this.webpackConfig?.css?.extract) {
      this.chainConfig.plugin('extract-css').use(ExtractCssPlugin, [
        {
          filename: !this.isProd
            ? '_averjs/css/[name].css'
            : '_averjs/css/[name].[contenthash].css',
          chunkFilename: !this.isProd
            ? '_averjs/css/[id].css'
            : '_averjs/css/[id].[contenthash].css'
        }
      ]);
    }

    this.chainConfig.plugin('vue-loader').use(VueLoaderPlugin);

    if (!this.isServer && !this.isProd) {
      this.chainConfig.plugin('files-changed').use(FilesChanged);
    }

    this.chainConfig.plugin('webpackbar').use(Webpackbar, [
      {
        name: this.isServer ? 'Server' : 'Client',
        color: this.isServer ? 'blue' : 'green'
      }
    ]);

    if (this.isProd) {
      this.chainConfig
        .plugin('module-concatenation')
        .use(webpack.optimize.ModuleConcatenationPlugin);
    }
  }

  alias() {
    for (const alias of Object.keys(this.webpackConfig.alias || {})) {
      this.chainConfig.resolve.alias.set(
        alias,
        this.webpackConfig.alias?.[alias] || ''
      );
    }
  }

  rules() {
    const vueLoaderRule = this.chainConfig.module
      .rule('vue-loader')
      .test(/\.vue$/);

    this.perfLoader.apply(vueLoaderRule, 'vue');

    vueLoaderRule
      .use('vue-loader')
      .loader('vue-loader')
      .options({
        compilerOptions: {
          preserveWhitespace: false
        },
        transformAssetUrls: {
          video: 'src',
          source: 'src',
          object: 'src',
          embed: 'src'
        }
      });

    this.chainConfig.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@kazupon/vue-i18n-loader');

    this.babelLoader.apply(this.chainConfig);

    this.chainConfig.module
      .rule('pug')
      .test(/\.pug$/)
      .oneOf('vue-template-pug')
      .resourceQuery(/^\?vue/)
      .use('pug-plain-loader')
      .loader('pug-plain-loader')
      .end()
      .end()
      .oneOf('js-pug')
      .use('raw-loader')
      .loader('raw-loader')
      .end()
      .use('pug-plain-loader')
      .loader('pug-plain-loader');

    this.chainConfig.module
      .rule('yaml')
      .test(/\.y(a)?ml$/)
      .exclude.add(/node_modules/)
      .end()
      .use('json-loader')
      .loader('json-loader')
      .end()
      .use('yaml-loader')
      .loader('yaml-loader');

    const cssRule = this.chainConfig.module.rule('css-loader').test(/\.css$/);
    this.styleLoader.apply('css', cssRule);

    const scssRule = this.chainConfig.module
      .rule('scss-loader')
      .test(/\.scss$/);
    this.styleLoader.apply('scss', scssRule, [
      {
        name: 'sass-loader',
        options: {
          sourceMap: !this.isProd,
          implementation: require('sass'),
          sassOptions: {
            fiber: require('fibers')
          }
        }
      }
    ]);

    this.chainConfig.module
      .rule('fonts')
      .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 1000,
        name: '_averjs/fonts/[name].[hash:7].[ext]',
        esModule: false
      });

    this.chainConfig.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|svg)$/)
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 1000,
        name: '_averjs/img/[name].[hash:7].[ext]',
        esModule: false
      });

    this.chainConfig.module
      .rule('videos')
      .test(/\.(webm|mp4)$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: '_averjs/videos/[name].[hash:7].[ext]',
        esModule: false
      });

    this.chainConfig.module
      .rule('resources')
      .test(/\.pdf$/)
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: '_averjs/resources/[name].[hash:7].[ext]',
        esModule: false
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  optimization() {}

  async config(isStatic: boolean): Promise<Configuration | void> {
    this.chainConfig.output
      .path(this.distPath)
      .publicPath(isStatic ? '/' : '/dist/')
      .end()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .devtool(this.isProd ? false : 'eval-cheap-module-source-map')
      .mode(
        process.env.NODE_ENV === 'development'
          ? 'development'
          : process.env.NODE_ENV === 'production'
          ? 'production'
          : process.env.NODE_ENV === 'test'
          ? 'production'
          : 'none'
      )
      .module.noParse(/es6-promise\.js$/)
      .end()
      .resolve.extensions.merge(['.js', '.json', '.vue', '.yaml'])
      .end()
      .modules.add('node_modules')
      .end()
      .end()
      .resolveLoader.modules.add('node_modules')
      .end()
      .end()
      .performance.maxEntrypointSize(1000 * 1024)
      .maxAssetSize(300_000)
      .hints(this.isProd ? 'warning' : false);

    this.rules();
    this.alias();
    this.optimization();
    this.plugins();

    this.chainConfig.cache({
      type: 'filesystem',
      cacheLocation: path.resolve(
        this.cacheDir,
        this.isServer
          ? `../webpack/${this.isProd ? 'prod/' : 'dev/'}server`
          : `../webpack/${this.isProd ? 'prod/' : 'dev/'}client`
      )
    });

    if (typeof this.webpackConfig?.base === 'function')
      this.webpackConfig.base(this.chainConfig);

    await this.aver.callHook('renderer:base-config', this.chainConfig);
  }
}
