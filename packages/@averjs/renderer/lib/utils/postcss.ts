/* eslint-disable @typescript-eslint/no-var-requires */
import SafeParser from 'postcss-safe-parser';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import {
  NodeJsInputFileSystem,
  CachedInputFileSystem,
  ResolverFactory
} from 'enhanced-resolve';
import { AverConfig } from '@averjs/config';
import PostCSSPresetEnv from 'postcss-preset-env';
import { Rule } from 'webpack-chain';

export default class PostCSS {
  config: AverConfig['webpack'];
  preset: PostCSSPresetEnv.pluginOptions;
  isProd = process.env.NODE_ENV === 'production';

  constructor(config: AverConfig['webpack']) {
    this.config = cloneDeep(config);
    this.preset = this.config.postcss?.preset;
    delete this.config.postcss?.preset;
  }

  get defaultConfig(): {
    sourceMap: boolean;
    plugins: AverConfig['webpack']['postcss']
  } {
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

  loadPlugins(config: AverConfig['webpack']['postcss']) {
    if(!config) return;
    // ensure postcss-preset-env and cssnano comes last
    const sortedPluginsKeys = Object.keys(config.plugins).sort(a => a === 'postcss-preset-env' ? 1 : -1).sort(a => a === 'cssnano' ? 1 : -1);
    config.plugins = sortedPluginsKeys.map(p => require(p)(config.plugins[p]));
  }

  resolveImports(id: string, basedir: string) {
    const options = {
      alias: this.config.alias,
      fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 4000).fileSystem,
      extensions: [ '.css' ],
      useSyncFileSystemCalls: true
    };
    const resolver = ResolverFactory.createResolver(options);

    return resolver.resolveSync({}, basedir, id);
  }

  apply(rule: Rule<Rule>) {
    const config = merge({}, this.defaultConfig, this.config.postcss);
    this.loadPlugins(config);

    rule
      .use('postcss')
        .loader('postcss-loader')
        .options(config);
  }
}