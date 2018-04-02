const webpack                   = require('webpack');
const merge                     = require('webpack-merge');
const base                      = require('./base.config');
const path                      = require('path');
const libRoot                   = path.resolve(__dirname, '..');
const projectRoot               = path.resolve(process.env.PROJECT_PATH, '.');
const VueSSRClientPlugin        = require('vue-server-renderer/client-plugin');
const CopyWebpackPlugin         = require('copy-webpack-plugin');
const WriteFilePlugin           = require('write-file-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

const baseConfig = base.call(this, { isServer: false });

const plugins = [
    new CopyWebpackPlugin([
        {
            from: path.join(projectRoot, 'resources/images'),
            to: path.join(projectRoot, '../public/images'),
            force: true
        }
    ]),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.VUE_ENV': JSON.stringify('client')
    }),
    new VueSSRClientPlugin()
];

module.exports = merge(baseConfig, {
    entry: {
        app: path.join(libRoot, 'lib/vue/entry-client.js')
    },
    output: {
        filename: '[name].[chunkhash].js',
    },
    optimization: {
        runtimeChunk: true,
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /node_modules/,
                    name: "vendor",
                    enforce: true,
                    chunks: 'all',
                    minSize: 1
                }
            }
        }
    },
    plugins: isProd ? plugins.concat([
        new webpack.optimize.AggressiveSplittingPlugin({
            minSize: 30000,
            maxSize: 50000
        })
    ]) : plugins.concat([
        new WriteFilePlugin()
    ])
});