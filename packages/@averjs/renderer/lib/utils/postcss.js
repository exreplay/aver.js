import SafeParser from 'postcss-safe-parser';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import {
  NodeJsInputFileSystem,
  CachedInputFileSystem,
  ResolverFactory
} from 'enhanced-resolve';

export default class PostCSS {
  constructor(config) {
    this.config = cloneDeep(config);
    this.preset = this.config.postcss.preset;
    delete this.config.postcss.preset;
    this.isProd = process.env.NODE_ENV === 'production';
  }

  get defaultConfig() {
    return {
      sourceMap: !this.isProd,
      plugins: {
        'postcss-import': {
          resolve: this.resolveImports.bind(this)
        },
        'postcss-preset-env': this.preset || {},
        cssnano: {
          parser: SafeParser,
          discardComments: { removeAll: true }
        }
      }
    };
  }

  loadPlugins(config) {
    // ensure postcss-preset-env and cssnano comes last
    const sortedPluginsKeys = Object.keys(config.plugins).sort(a => a === 'postcss-preset-env').sort(a => a === 'cssnano');
    config.plugins = sortedPluginsKeys.map(p => require(p)(config.plugins[p]));
  }

  resolveImports(id, basedir) {
    const options = {
      alias: this.config.alias,
      fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000),
      extensions: [ '.css' ],
      useSyncFileSystemCalls: true
    };
    const resolver = ResolverFactory.createResolver(options);

    return resolver.resolveSync({}, basedir, id);
  }

  apply(rule) {
    const config = merge({}, this.defaultConfig, this.config.postcss);
    this.loadPlugins(config);

    rule
      .use('postcss')
        .loader('postcss-loader')
        .options(config);
  }
}
