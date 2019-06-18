import path from 'path';
import glob from 'glob-all';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import { VueLoaderPlugin } from 'vue-loader';
import { warmup } from 'thread-loader';
import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin';
import PurgeCssPlugin from 'purgecss-webpack-plugin';
import StyleLoader from './styleLoader';
import Webpackbar from 'webpackbar';
import FilesChanged from '../plugins/FilesChanged';
import { getAverjsConfig } from '@averjs/config';

export default class WebpackBaseConfiguration {
  constructor(isServer) {
    this.chainConfig = new WebpackChain();
    this.isServer = isServer;
    this.libRoot = path.resolve(require.resolve('@averjs/core'), '../');
    this.cacheDir = path.resolve('node_modules/.cache/averjs');
    
    this.isProd = process.env.NODE_ENV === 'production';
    this.nodeEnv = process.env.NODE_ENV || 'development';

    this.commonRules = [];

    if (!this.isProd) warmup({}, ['babel-loader', 'css-loader']);

    const { webpack } = getAverjsConfig();
    this.globalConfig = webpack;
  }

  plugins() {
    if (!this.isServer && this.globalConfig.css.extract) {
      this.chainConfig
        .plugin('extract-css')
          .use(ExtractCssPlugin, [{
            filename: !this.isProd ? 'css/[name].css' : 'css/[name].[contenthash].css',
            chunkFilename: !this.isProd ? 'css/[id].css' : 'css/[id].[contenthash].css'
          }]);
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
        .use(Webpackbar, [{
          name: this.isServer ? 'Server' : 'Client',
          color: this.isServer ? 'blue' : 'green'
        }]);

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
            .use(PurgeCssPlugin, [{
              paths: glob.sync([
                path.resolve(process.env.PROJECT_PATH, './**/*.js'),
                path.resolve(process.env.PROJECT_PATH, './**/*.vue')
              ]),
              whitelistPatterns: [/^_/]
            }]);
      }
    }
  }

  alias() {
    this.chainConfig.resolve
      .alias
        .set('@', path.join(process.env.PROJECT_PATH))
        .set('@@', path.resolve(process.env.PROJECT_PATH, '../'))
        .set('@components', path.resolve(process.env.PROJECT_PATH, './components'))
        .set('@resources', path.resolve(process.env.PROJECT_PATH, './resources'))
        .set('@mixins', path.resolve(process.env.PROJECT_PATH, './mixins'))
        .set('@pages', path.resolve(process.env.PROJECT_PATH, './pages'))
        .set('@vuex', path.resolve(process.env.PROJECT_PATH, './vuex'));
  }

  rules() {
    this.chainConfig.module
      .rule('vue-loader')
        .test(/\.vue$/)
        .use('cache-loader')
          .loader('cache-loader')
          .options({
            cacheDirectory: path.resolve(process.env.PROJECT_PATH, '../node_modules/.cache/cache-loader'),
            cacheIdentifier: 'vue-loader'
          })
          .end()
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

    this.chainConfig.module
      .rule('js')
        .test(/\.js$/)
        .include
          .add(process.env.PROJECT_PATH)
          .add(path.resolve(process.env.PROJECT_PATH, '../aver-config.js'))
          .add(path.resolve(require.resolve('@averjs/core'), '../'))
          .add(path.resolve(require.resolve('@averjs/vuex-decorators'), '../'))
          .end()
        .use('cache-loader')
          .loader('cache-loader')
          .options({
            cacheDirectory: path.resolve(process.env.PROJECT_PATH, '../node_modules/.cache/cache-loader'),
            cacheIdentifier: 'js'
          })
          .end()
        .use('thread-loader')
          .loader('thread-loader')
          .options({
            name: 'js',
            poolTimeout: !this.isProd ? Infinity : 2000
          })
          .end()
        .use('babel-loader')
          .loader('babel-loader')
          .options({
            'presets': [
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
                
    const styleLoader = new StyleLoader(this.isServer, this.globalConfig);

    const cssRule = this.chainConfig.module.rule('css-loader').test(/\.css$/);
    styleLoader.apply('css', cssRule);

    const scssRule = this.chainConfig.module.rule('scss-loader').test(/\.scss$/);
    styleLoader.apply('scss', scssRule, [{
      name: 'sass-loader',
      options: { sourceMap: !this.isProd, minimize: true }
    }]);
                    
    this.chainConfig.module
      .rule('fonts')
        .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/)
        .use('url-loader')
          .loader('url-loader')
          .options({
            limit: 1000,
            name: 'fonts/[name].[hash:7].[ext]'
          });
        
    this.chainConfig.module
      .rule('images')
        .test(/\.(png|jpe?g|gif|svg)$/)
        .use('url-loader')
          .loader('url-loader')
          .options({
            limit: 1000,
            name: 'img/[name].[hash:7].[ext]'
          });
        
    this.chainConfig.module
      .rule('videos')
        .test(/\.(webm|mp4)$/)
        .use('file-loader')
          .loader('file-loader')
          .options({
            name: 'videos/[name].[hash:7].[ext]'
          });
        
    this.chainConfig.module
      .rule('resources')
        .test(/\.pdf$/)
        .use('file-loader')
          .loader('file-loader')
          .options({
            name: 'resources/[name].[hash:7].[ext]'
          });
  }

  optimization() {
  }

  config() {
    this.chainConfig
      .output
        .path(path.resolve(process.env.PROJECT_PATH, '../dist/'))
        .publicPath('/dist/')
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
          .merge(['.js', '.json', '.vue', '.yaml'])
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
  }
};
