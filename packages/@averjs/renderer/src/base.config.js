import fs from 'fs';
import path from 'path';
import glob from 'glob-all';
import webpack from 'webpack';
import WebpackChain from 'webpack-chain';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { warmup } from 'thread-loader';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import SafeParser from 'postcss-safe-parser';
import PurgeCssPlugin from 'purgecss-webpack-plugin';
import StyleLoader from './styleLoader';
import Webpackbar from 'webpackbar';

export default class WebpackBaseConfiguration {
    constructor(isServer) {
        this.chainConfig = new WebpackChain();
        this.isServer = isServer;
        this.libRoot = path.resolve(require.resolve('@averjs/core'), '../');
    
        this.isProd = process.env.NODE_ENV === 'production';
        this.nodeEnv = process.env.NODE_ENV || "development";

        this.commonRules = [];

        if (!this.isProd) warmup({}, ['babel-loader', 'css-loader', 'css-loader/locals'])

        this.loadGlobalConfig();
        this.modernizr();
    }

    loadGlobalConfig() {
        const globalConfPath = path.resolve(process.env.PROJECT_PATH, '../aver-config.js');
        if (fs.existsSync(globalConfPath)) {
            this.globalConfig = require(globalConfPath).default;
            this.globalConfig = (typeof this.globalConfig.webpack !== 'undefined') ? this.globalConfig.webpack : {};
        } else {
            this.globalConfig = {};
        }
    }

    plugins() {
        this.chainConfig
            .plugin('vue-loader')
                .use(VueLoaderPlugin);

        this.chainConfig
            .plugin('webpackbar')
                .use(Webpackbar, [{
                    name: this.isServer ? 'Server' : 'Client',
                    color: this.isServer ? 'blue' : 'green'
                }]);

        if (this.isProd) {
            if (!this.isServer)  {
                this.chainConfig
                    .plugin('mini-css')
                        .use(MiniCssExtractPlugin, [{
                            filename: !this.isProd ? 'css/[name].css' : 'css/[name].[contenthash].css',
                            chunkFilename: !this.isProd ? 'css/[id].css' : 'css/[id].[contenthash].css',
                        }]);
            }

            if (typeof this.globalConfig.obfuscator !== 'undefined') {
                const JavaScriptObfuscator = require('webpack-obfuscator');

                this.chainConfig
                    .plugin('obfuscator')
                        .use(JavaScriptObfuscator, [Object.assign({
                            rotateUnicodeArray: true
                        }, this.globalConfig.obfuscator)]);
            }
            
            this.chainConfig
                .plugin('optimize-css')
                    .use(OptimizeCssAssetsPlugin, [{
                        cssProcessorOptions: {
                            parser: SafeParser,
                            discardComments: {
                                removeAll: true
                            }
                        }
                    }])
                    .end()
                .plugin('hashed-module-ids')
                    .use(webpack.HashedModuleIdsPlugin)
                    .end()
                .plugin('module-concatenation')
                    .use(webpack.optimize.ModuleConcatenationPlugin);
            
            if (typeof this.globalConfig.purgeCss !== 'undefined') {
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
        } else {
            this.chainConfig
                .plugin('friendly-errors')
                    .use(FriendlyErrorsPlugin);
        }
    }

    modernizr() {
        const modernizrPath = path.resolve(process.env.PROJECT_PATH, '../.modernizrrc');
        if (fs.existsSync(modernizrPath)) {
            this.chainConfig.resolve
                .alias
                    .set('modernizr$', modernizrPath)
                    .end()
                .end()
            .module
                .rule('modernizr-js')
                    .test(/\.modernizrrc.js$/)
                    .use('modernizr-loader')
                        .loader('modernizr-loader')
                        .end()
                    .end()
                .rule('modernizr-json')
                    .test(/\.modernizrrc(\.json)?$/)
                    .use('modernizr-loader')
                    .use('json-loader')
                        .loader('json-loader');
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
                    .add(path.resolve(require.resolve("@averjs/core"), "../"))
                    .add(path.resolve(require.resolve("vuex-decorators"), "../"))
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
                        "presets": [
                            ["@babel/preset-env", {
                                "modules": false,
                                "targets": {
                                    "browsers": [
                                        "> 1%",
                                        "last 2 versions",
                                        "not ie <= 8"
                                    ]
                                }
                            }]
                        ],
                        "plugins": [
                            "@babel/syntax-dynamic-import",
                            [
                                "@babel/plugin-proposal-decorators",
                                { 
                                    "legacy": true
                                }
                            ],
                            [
                                "@babel/proposal-class-properties",
                                {
                                    "loose" : true
                                }
                            ],
                            "@babel/proposal-object-rest-spread",
                            "@babel/transform-runtime"
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
                
        const styleLoader = new StyleLoader(this.isServer);

        const cssRule = this.chainConfig.module.rule('css-loader').test(/\.css$/);
        styleLoader.apply('css', cssRule);

        const scssRule = this.chainConfig.module.rule('scss-loader').test(/\.scss$/);
        styleLoader.apply('scss', scssRule, [{
            name: 'sass-loader',
            options: { sourceMap: !this.isProd }
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

    styleLoader(loader, test, options) {
        const baseRule = this.chainConfig.module.rule(loader).test(test);
        
        const moduleRule = baseRule
                .oneOf(`${loader}-module`)
                    .resourceQuery(/module/);
        this.applyStyle(loader, moduleRule, true);
        if (loader !== 'css-loader') moduleRule.use(loader).loader(loader).options(options);
        
        const rule = baseRule.oneOf(loader);
        this.applyStyle(loader, rule);
        if (loader !== 'css-loader') rule.use(loader).loader(loader).options(options);
    }

    applyStyle(loaderName, loader, module = false) {
        const postcssConfigExists = fs.existsSync(path.resolve(process.env.PROJECT_PATH, '../postcss.config.js'));

        if(loaderName === 'css-loader') {
            loader
                .use('cache-loader')
                    .loader('cache-loader')
                    .options({
                        cacheDirectory: path.resolve(process.env.PROJECT_PATH, '../node_modules/.cache/cache-loader'),
                        cacheIdentifier: 'css'
                    })
                    .end()
                .use('thread-loader')
                    .loader('thread-loader')
                    .options({
                        name: 'css',
                        poolTimeout: !this.isProd ? Infinity : 2000
                    })
                    .end()
        }

        if (this.isServer || !this.isProd) {
            loader
                .use('vue-style-loader')
                    .loader('vue-style-loader')
                    .options({ sourceMap: true });
        } else {
            loader
                .use('mini-css')
                    .loader(MiniCssExtractPlugin.loader)
        }

        loader
            .use('css-loader')
                .loader(module ? 'css-loader' : this.isServer ? 'css-loader/locals' : 'css-loader')
                .options((module) ? {
                    modules: true,
                    importLoaders: postcssConfigExists && loaderName !== 'css-loader' ? 2 : 1,
                    localIdentName: `_${this.isProd ? '[hash:base64]' : '[path][name]---[local]'}`,
                    camelCase: true,
                    sourceMap: !this.isProd,
                    minimize: this.isProd
                } : {
                    importLoaders: postcssConfigExists && loaderName !== 'css-loader' ? 2 : 1,
                    sourceMap: !this.isProd,
                    minimize: this.isProd
                });
        
        

        if (postcssConfigExists) loader.use('postcss-loader').loader('postcss-loader').options({ sourceMap: !this.isProd });
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
