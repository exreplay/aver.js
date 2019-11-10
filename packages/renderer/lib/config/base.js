import path from 'path';
import glob from 'glob-all';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import { VueLoaderPlugin } from 'vue-loader';
import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin';
import PurgeCssPlugin from 'purgecss-webpack-plugin';
import StyleLoader from '../utils/style-loader';
import PerformanceLoader from '../utils/perf-loader';
import Webpackbar from 'webpackbar';
import FilesChanged from '../plugins/FilesChanged';

export default class WebpackBaseConfiguration {
  constructor(isServer, aver) {
    this.chainConfig = new WebpackChain();
    this.isServer = isServer;
    this.libRoot = path.resolve(require.resolve('@averjs/core'), '../');
    this.cacheDir = path.resolve('node_modules/.cache/averjs');
    
    this.isProd = process.env.NODE_ENV === 'production';
    this.nodeEnv = process.env.NODE_ENV || 'development';

    this.commonRules = [];

    const { webpack } = aver.config;
    this.globalConfig = webpack;

    this.perfLoader = new PerformanceLoader(this.isServer, this.globalConfig);
    this.perfLoader.warmupLoaders();
    this.styleLoader = new StyleLoader(this.isServer, this.globalConfig, this.perfLoader);
  }

  plugins() {
    if (!this.isServer && this.globalConfig.css.extract) {
      this.chainConfig
        .plugin('extract-css')
          .use(ExtractCssPlugin, [ {
            filename: !this.isProd ? '_averjs/css/[name].css' : '_averjs/css/[name].[contenthash].css',
            chunkFilename: !this.isProd ? '_averjs/css/[id].css' : '_averjs/css/[id].[contenthash].css'
          } ]);
    }

    this.chainConfig
      .plugin('vue-loader')
        .use(VueLoaderPlugin);
    
    if (!this.isServer && !this.isProd) {
      this.chainConfig
        .plugin('files-changed')
          .use(FilesChanged);
    }

    this.chainConfig
      .plugin('webpackbar')
        .use(Webpackbar, [ {
          name: this.isServer ? 'Server' : 'Client',
          color: this.isServer ? 'blue' : 'green'
        } ]);

    if (this.isProd) {
      this.chainConfig
        .plugin('hashed-module-ids')
          .use(webpack.HashedModuleIdsPlugin)
          .end()
        .plugin('module-concatenation')
          .use(webpack.optimize.ModuleConcatenationPlugin);
            
      if (this.globalConfig.purgeCss) {
        this.chainConfig
          .plugin('purge-css')
            .use(PurgeCssPlugin, [ {
              paths: glob.sync([
                path.resolve(process.env.PROJECT_PATH, './**/*.js'),
                path.resolve(process.env.PROJECT_PATH, './**/*.vue')
              ]),
              whitelistPatterns: [ /^_/ ]
            } ]);
      }
    }
  }

  alias() {
    for (const alias of Object.keys(this.globalConfig.alias)) {
      this.chainConfig.resolve.alias.set(alias, this.globalConfig.alias[alias]);
    }
  }

  rules() {
    const vueLoaderRule = this.chainConfig.module
      .rule('vue-loader')
        .test(/\.vue$/);

    this.perfLoader.apply(vueLoaderRule, 'vue');

    vueLoaderRule.use('vue-loader')
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
        
    this.chainConfig.module
      .rule('eslint')
        .test(/\.(js|vue)$/)
        .pre()
        .exclude
          .add(/node_modules/)
          .end()
        .use('eslint')
          .loader('eslint-loader')
          .options({
            cache: true
          });

    const jsRule = this.chainConfig.module
      .rule('js')
        .test(/\.js$/)
        .include
          .add(process.env.PROJECT_PATH)
          .end();

    this.perfLoader.apply(jsRule, 'js');

    jsRule.use('babel-loader')
          .loader('babel-loader')
          .options({
            presets: [
              [
                require.resolve('@averjs/babel-preset-app'),
                {
                  buildTarget: this.isServer ? 'server' : 'client'
                }
              ]
            ]
          });
        
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
        .exclude
          .add(/node_modules/)
          .end()
        .use('yaml')
          .loader('json-loader!yaml-loader');

    const cssRule = this.chainConfig.module.rule('css-loader').test(/\.css$/);
    this.styleLoader.apply('css', cssRule);

    const scssRule = this.chainConfig.module.rule('scss-loader').test(/\.scss$/);
    this.styleLoader.apply('scss', scssRule, [ {
      name: 'sass-loader',
      options: { sourceMap: !this.isProd }
    } ]);
                    
    this.chainConfig.module
      .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/)
        .use('url-loader')
          .loader('url-loader')
          .options({
            limit: 1000,
            name: '_averjs/fonts/[name].[hash:7].[ext]'
          });
        
    this.chainConfig.module
      .rule('images')
        .test(/\.(png|jpe?g|gif|svg)$/)
        .use('url-loader')
          .loader('url-loader')
          .options({
            limit: 1000,
            name: '_averjs/img/[name].[hash:7].[ext]'
          });
        
    this.chainConfig.module
      .rule('videos')
        .test(/\.(webm|mp4)$/)
        .use('file-loader')
          .loader('file-loader')
          .options({
            name: '_averjs/videos/[name].[hash:7].[ext]'
          });
        
    this.chainConfig.module
      .rule('resources')
        .test(/\.pdf$/)
        .use('file-loader')
          .loader('file-loader')
          .options({
            name: '_averjs/resources/[name].[hash:7].[ext]'
          });
  }

  optimization() {
  }

  async config(isStatic) {
    this.chainConfig
      .output
        .path(path.resolve(process.env.PROJECT_PATH, '../dist/'))
        .publicPath(isStatic ? '/' : '/dist/')
        .end()
      .node
        .set('setImmediate', false)
        .set('dgram', 'empty')
        .set('fs', 'empty')
        .set('net', 'empty')
        .set('tls', 'empty')
        .set('child_process', 'empty')
        .end()
      .devtool(this.isProd ? false : 'cheap-module-eval-source-map')
      .mode(process.env.NODE_ENV)
      .module
        .noParse(/es6-promise\.js$/)
        .end()
      .resolve
        .extensions
          .merge([ '.js', '.json', '.vue', '.yaml' ])
          .end()
        .modules
          .add('node_modules')
          .end()
        .end()
      .resolveLoader
        .modules
          .add('node_modules')
          .end()
        .end()
      .performance
        .maxEntrypointSize(1000 * 1024)
        .maxAssetSize(300000)
        .hints(this.isProd ? 'warning' : false);

    this.rules();
    this.alias();
    this.optimization();
    this.plugins();

    if (typeof this.globalConfig.base === 'function') this.globalConfig.base(this.chainConfig);

    await this.aver.callHook('renderer:base-config', this.chainConfig);
  }
};
