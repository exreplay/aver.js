import path from 'path';
import SafeParser from 'postcss-safe-parser';
import {
  NodeJsInputFileSystem,
  CachedInputFileSystem,
  ResolverFactory
} from 'enhanced-resolve';

export default class PostCSS {
  constructor(config) {
    this.config = config;
    this.isProd = process.env.NODE_ENV === 'production';
  }

  get postCssConfig() {
    return {
      sourceMap: !this.isProd,
      plugins: this.plugins
    };
  }

  plugins() {
    const plugins = [];

    plugins.push(
      require('postcss-import')({
        resolve: this.resolveImports
      })
    );

    plugins.push(...this.config.postcss.plugins);

    plugins.push(
      require('cssnano')({
        parser: SafeParser,
        discardComments: { removeAll: true }
      })
    );

    return plugins;
  }

  resolveImports(id, basedir) {
    const options = {
      alias: {
        '@': path.join(process.env.PROJECT_PATH)
      },
      fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000),
      extensions: [ '.css' ],
      useSyncFileSystemCalls: true
    };
    const resolver = ResolverFactory.createResolver(options);

    return resolver.resolveSync({}, basedir, id);
  }

  apply(rule) {
    rule
      .use('postcss')
        .loader('postcss-loader')
        .options(this.postCssConfig);
  }
}
