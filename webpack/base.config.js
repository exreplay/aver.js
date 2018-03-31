const webpack                   = require('webpack');
const path                      = require('path');
const glob                      = require('glob');
const projectRoot               = path.resolve(__dirname, '..');
const FriendlyErrorsPlugin      = require('friendly-errors-webpack-plugin');
const ExtractTextPlugin         = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin   = require('optimize-css-assets-webpack-plugin');
const CompressionWebpackPlugin  = require('compression-webpack-plugin');
const ProgressBarPlugin         = require('./plugins/progress');
const chalk                     = require('chalk');
const UglifyJsPlugin            = require('uglifyjs-webpack-plugin');
const HardSourceWebpackPlugin   = require('hard-source-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';
const nodeEnv = process.env.NODE_ENV || "development";

module.exports = function baseConfiguration({ isServer }) {
    const commonPlugins = [
        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(nodeEnv),
            "PRODUCTION": isProd
        }),
        new ExtractTextPlugin({
            filename: 'common.[chunkhash].css',
            allChunks: true,
            ignoreOrder: true
        }),
        new ProgressBarPlugin({
            name: isServer ? 'SSR' : 'Client',
            color: isServer ? 'cyan' : 'green'
        })
    ];

    return {
        output: {
            path: path.resolve(process.env.PROJECT_PATH, '../dist/'),
            publicPath: '/dist/',
        },
        node: {
            fs: 'empty'
        },
        devtool: isProd ? false : 'cheap-source-map',
        mode: process.env.NODE_ENV,
        module: {
            noParse: /es6-promise\.js$/,
            rules: [
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            i18n: '@kazupon/vue-i18n-loader',
                            scss: isProd ? ExtractTextPlugin.extract({
                                use: 'css-loader!sass-loader',
                                fallback: 'vue-style-loader'
                            }) : 'vue-style-loader!css-loader?'+ JSON.stringify({
                                sourceMap: true
                            }) +'!sass-loader?'+ JSON.stringify({
                                sourceMap: true
                            })
                        },
                        cssModules: {
                            localIdentName: isProd ? '[hash:base64]' : '[path][name]---[local]',
                            camelCase: true
                        }
                    }
                },
                {
                    enforce: 'pre',
                    test: /\.(js|vue)$/,
                    loader: 'eslint-loader',
                    exclude: /node_modules/
                },
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.yaml$/,
                    loader: 'json-loader!yaml-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.scss?$/,
                    loaders: ['vue-style-loader', 'css-loader', 'sass-loader']
                },
                {
                    test: /\.css?$/,
                    loaders: ['vue-style-loader', 'css-loader', 'sass-loader']
                },
                {
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    loader: 'url-loader',
                    options: {
                        limit: 1000,
                        name: 'fonts/[name].[hash:7].[ext]'
                    }
                },
                {
                    test: /\.(png|jpe?g|gif|svg)$/,
                    loader: 'url-loader',
                    options: {
                        limit: 1000,
                        name: 'img/[name].[hash:7].[ext]'
                    }
                },
                {
                    test: /\.modernizrrc.js$/,
                    use: [ 'modernizr-loader' ]
                },
                {
                    test: /\.modernizrrc(\.json)?$/,
                    use: [ 'modernizr-loader', 'json-loader' ]
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.json', '.vue', '.yaml'],
            alias: {
				'@': path.join(process.env.PROJECT_PATH),
                modernizr$: path.join(projectRoot, '.modernizrrc')
            }
        },
        performance: {
            maxEntrypointSize: 1000 * 1024,
            maxAssetSize: 300000,
            hints: isProd ? 'warning' : false
        },
        optimization: {
            minimizer: [
                new UglifyJsPlugin({
                    parallel: true,
                    sourceMap: false,
                    extractComments: {
                        filename: 'LICENSES'
                    },
                    uglifyOptions: {
                        output: {
                            comments: /^\**!|@preserve|@license|@cc_on/
                        },
                        keep_classnames: true,
                        keep_fnames: true
                    }
                })
            ]
        },
        plugins: isProd
            ? commonPlugins.concat([
                new OptimizeCssAssetsPlugin(),
                new webpack.HashedModuleIdsPlugin(),
                new webpack.optimize.ModuleConcatenationPlugin(),
                new CompressionWebpackPlugin({
                    asset: '[path].gz[query]',
                    algorithm: 'gzip',
                    test: new RegExp(
                        '\\.(' +
                        ['js', 'css'].join('|') +
                        ')$'
                    ),
                    threshold: 10240,
                    minRatio: 0.8
                })
            ])
            : commonPlugins.concat([
                new FriendlyErrorsPlugin(),
                new HardSourceWebpackPlugin()
            ]),
        node: {
            setImmediate: false,
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty'
        }
    }
};