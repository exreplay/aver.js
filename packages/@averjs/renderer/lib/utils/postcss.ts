/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs';
import SafeParser from 'postcss-safe-parser';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import { CachedInputFileSystem, ResolverFactory } from 'enhanced-resolve';
import PostCSSPresetEnv from 'postcss-preset-env';
import { Rule } from 'webpack-chain';
import { AverConfig } from '@averjs/config/lib';
import { AverWebpackConfig } from '@averjs/config/lib/configs/renderer';

export default class PostCSS {
  config: AverWebpackConfig;
  preset: PostCSSPresetEnv.pluginOptions;
  isProd: boolean;

  constructor(config: AverConfig) {
    this.config = cloneDeep(config.webpack || {});
    this.isProd = config.isProd;
    this.preset = this.config.postcss?.preset || {};
    delete this.config.postcss?.preset;
  }

  get defaultConfig(): AverWebpackConfig['postcss'] {
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

  loadPlugins(config: AverWebpackConfig['postcss']) {
    if (!config?.plugins) return;
    if (!config.postcssOptions) config.postcssOptions = {};
    if (!config.postcssOptions?.plugins) config.postcssOptions.plugins = [];

    // ensure postcss-preset-env and cssnano comes last
    const sortedPluginsKeys = Object.keys(config.plugins)
      .sort(a => (a === 'postcss-preset-env' ? 1 : -1))
      .sort(a => (a === 'cssnano' ? 1 : -1));
    config.postcssOptions.plugins = [
      ...sortedPluginsKeys.map(p => require(p)(config.plugins?.[p])),
      ...config.postcssOptions.plugins
    ];
    delete config.plugins;
  }

  resolveImports(id: string, basedir: string) {
    const options: Parameters<typeof ResolverFactory['createResolver']>[0] = {
      alias: this.config?.alias,
      fileSystem: new CachedInputFileSystem(fs, 4000).fileSystem,
      extensions: ['.css'],
      useSyncFileSystemCalls: true
    };
    const resolver = ResolverFactory.createResolver(options);

    return resolver.resolveSync({}, basedir, id);
  }

  apply(rule: Rule<Rule>) {
    const config = merge({}, this.defaultConfig, this.config?.postcss);
    this.loadPlugins(config);

    rule
      .use('postcss')
      .loader('postcss-loader')
      .options(config);
  }
}
