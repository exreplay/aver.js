/* eslint-disable @typescript-eslint/no-explicit-any */
import hash from 'hash-sum';
import uniq from 'lodash/uniq';
import { Compiler } from 'webpack';
import { isCSS, isJS } from './utils';

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
    compiler.hooks.emit.tapAsync('vue-client-plugin', (compilation, cb) => {
      const stats = compilation.getStats().toJson();

      const allFiles = uniq(stats.assets as any[]).map(
        (a: { name: string }) => a.name
      );

      const initialFiles = uniq(
        Object.keys(stats.entrypoints || {})
          .map((name) => stats.entrypoints?.[name].assets)
          .reduce((assets, all) => all?.concat(assets || []), [])
          ?.map((file: { name: string }) => file.name)
          .filter((file: string) => isJS(file) || isCSS(file))
      );

      const asyncFiles = allFiles
        .filter((file: string) => isJS(file) || isCSS(file))
        .filter((file: string) => !initialFiles.includes(file));

      const manifest: ClientManifest = {
        publicPath: stats.publicPath || '',
        all: allFiles,
        initial: initialFiles,
        async: asyncFiles,
        modules: {
          /* [identifier: string]: Array<index: number> */
        }
      };

      const assetModules = stats.modules?.filter((m) => m.assets?.length || 0);
      const fileToIndex = (file: string | number) => manifest.all.indexOf(file);
      stats.modules?.forEach((m) => {
        // ignore modules duplicated in multiple chunks
        if (m.chunks?.length === 1) {
          const cid = m.chunks[0];
          const chunk = stats.chunks?.find((c) => {
            return c.id === cid;
          });
          if (!chunk || !chunk.files) {
            return;
          }
          const id = m.identifier?.replace(/\s\w+$/, ''); // remove appended hash
          const files = (manifest.modules[hash(id)] = chunk.files.map(
            fileToIndex
          ));
          // find all asset modules associated with the same chunk
          assetModules?.forEach((m) => {
            if (
              m.chunks?.some(function (id) {
                return id === cid;
              })
            ) {
              // eslint-disable-next-line prefer-spread
              files.push.apply(files, m.assets?.map(fileToIndex) || []);
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

      cb();
    });
  }
}
