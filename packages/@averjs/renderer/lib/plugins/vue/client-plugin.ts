/* eslint-disable @typescript-eslint/no-explicit-any */
import hash from 'hash-sum';
import uniq from 'lodash/uniq';
import { Compilation, Compiler } from 'webpack';
import { isCSS, isJS } from './utils';

interface AssetModule {
  chunks: any[];
  assets: [];
  identifier: string;
}

interface ClientManifest {
  publicPath: string;
  all: any[];
  initial: any[];
  async: any[];
  modules: Record<string, any>;
}

export default class VueSSRClientPlugin {
  options: any;

  constructor(options = {}) {
    this.options = Object.assign(
      {
        filename: 'vue-ssr-client-manifest.json'
      },
      options
    );
  }

  apply(compiler: Compiler) {
    compiler.hooks.make.tap('vue-client-plugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'generate-client-manifest',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
        },
        () => {
          const stats = compilation.getStats().toJson();

          const allFiles = uniq(stats.assets as any[]).map(
            (a: { name: string }) => a.name
          );

          const initialFiles = uniq(
            Object.keys(stats.entrypoints)
              .map((name) => stats.entrypoints[name].assets)
              .reduce((assets, all) => all.concat(assets), [])
              .filter((file: string) => isJS(file) || isCSS(file))
              .map((file: { name: string }) => file.name)
          );

          const asyncFiles = allFiles
            .filter((file: string) => isJS(file) || isCSS(file))
            .filter((file: string) => !initialFiles.includes(file));

          const manifest: ClientManifest = {
            publicPath: stats.publicPath,
            all: allFiles,
            initial: initialFiles,
            async: asyncFiles,
            modules: {
              /* [identifier: string]: Array<index: number> */
            }
          };

          const assetModules = stats.modules.filter(
            (m: { assets: any[] }) => m.assets.length
          );
          const fileToIndex = (file: string) => manifest.all.indexOf(file);
          stats.modules.forEach((m: AssetModule) => {
            // ignore modules duplicated in multiple chunks
            if (m.chunks.length === 1) {
              const cid = m.chunks[0];
              const chunk = stats.chunks.find(
                (c: { id: string }) => c.id === cid
              );

              if (!chunk || !chunk.files) return;

              const id = m.identifier
                .replace(/\|.*/, '')
                .split('!')
                .pop(); /* use only 'base' filepath */
              const files = (manifest.modules[hash(id)] = chunk.files.map(
                fileToIndex
              ));
              // find all asset modules associated with the same chunk
              assetModules.forEach(function (m: AssetModule) {
                if (
                  m.chunks.some(function (id) {
                    return id === cid;
                  })
                ) {
                  // eslint-disable-next-line prefer-spread
                  files.push.apply(files, m.assets.map(fileToIndex));
                }
              });
            }
          });

          const json = JSON.stringify(manifest, null, 2);

          compilation.assets[this.options.filename] = {
            source: function () {
              return json;
            },
            size: function () {
              return json.length;
            }
          } as any;
        }
      );
    });
  }
}
