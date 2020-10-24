/* eslint-disable @typescript-eslint/no-explicit-any */
import ref from 'chalk';
import { Compiler } from 'webpack';
import { isJS } from './utils';

const red = ref.red;
const yellow = ref.yellow;

const prefix = "[vue-server-renderer-webpack-plugin]";
const warn = exports.warn = function (msg: string) { return console.error(red((prefix + " " + msg + "\n"))); };
const tip = exports.tip = function (msg: string) { return console.log(yellow((prefix + " " + msg + "\n"))); };

interface ServerManifest {
  entry: string;
  files: Record<string, any>;
  maps: Record<string, any>;
}

export default class VueSSRServerPlugin {
  options: any;

  constructor(options = {}) {
    this.options = Object.assign({
      filename: 'vue-ssr-server-bundle.json'
    }, options);
  }
  
  apply(compiler: Compiler) {
    this.validate(compiler);

    compiler.hooks.emit.tapAsync('vue-server-plugin', (compilation, cb) => {
      const stats = compilation.getStats().toJson();
      const entryName = Object.keys(stats.entrypoints)[0];
      const entryInfo = stats.entrypoints[entryName];

      if (!entryInfo) {
        // #5553
        return cb()
      }

      const entryAssets = entryInfo.assets.filter((a: { name: string }) => isJS(a.name));

      if (entryAssets.length > 1) {
        throw new Error(
          "Server-side bundle should have one single entry file. " +
          "Avoid using CommonsChunkPlugin in the server config."
        )
      }

      const entry = entryAssets[0].name;
      if (!entry || typeof entry !== 'string') {
        throw new Error(
          ("Entry \"" + entryName + "\" not found. Did you specify the correct entry option?")
        )
      }

      const bundle: ServerManifest = {
        entry: entry,
        files: {},
        maps: {}
      };

      stats.assets.forEach((asset: { name: string }) => {
        if (isJS(asset.name)) {
          bundle.files[asset.name] = compilation.assets[asset.name].source();
        } else if (asset.name.match(/\.js\.map$/)) {
          bundle.maps[asset.name.replace(/\.map$/, '')] = JSON.parse(compilation.assets[asset.name].source() as string);
        }
        // do not emit anything else for server
        delete compilation.assets[asset.name];
      });

      const json = JSON.stringify(bundle, null, 2);
      const filename = this.options.filename;

      compilation.assets[filename] = {
        source: function () { return json; },
        size: function () { return json.length; }
      } as any;

      cb();
    });
  }

  validate(compiler: Compiler) {
    if (compiler.options.target !== 'node') {
      warn('webpack config `target` should be "node".');
    }
  
    if (compiler.options.output && compiler.options.output.library?.type !== 'commonjs2') {
      warn('webpack config `output.libraryTarget` should be "commonjs2".');
    }
  
    if (!compiler.options.externals) {
      tip(
        'It is recommended to externalize dependencies in the server build for ' +
        'better build performance.'
      );
    }
  }
}
