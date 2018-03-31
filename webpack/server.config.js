const webpack               = require('webpack');
const merge                 = require('webpack-merge');
const base                  = require('./base.config');
const path                  = require('path');
const libRoot               = path.resolve(__dirname, '..');
const VueSSRServerPlugin    = require('vue-server-renderer/server-plugin');
const nodeExternals         = require('webpack-node-externals');
const baseConfig            = base.call(this, { isServer: true });

module.exports = merge(baseConfig, {
    target: 'node',
    entry: {
        app: path.join(libRoot, 'lib/vue/entry-server.js')
    },
    output: {
        libraryTarget: 'commonjs2',
        filename: 'bundle.server.js',
    },
    optimization: {
        splitChunks: false,
        minimizer: []
    },
    externals: [
        nodeExternals({
              whitelist: [/es6-promise|\.(?!(?:js|json)$).{1,5}$/i],
              modulesDir: 'node_modules'
          })
    ],
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.VUE_ENV': JSON.stringify('server')
        }),
        new VueSSRServerPlugin()
    ]
});