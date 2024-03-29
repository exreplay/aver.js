import path from 'path';
import ExtractCssPlugin from 'mini-css-extract-plugin';
import map from 'lodash/map';
import PostCSS from './postcss';
import PerformanceLoader from './perf-loader';
import { Rule } from 'webpack-chain';
import { StyleResourcesLoaderOptions } from 'style-resources-loader';
import { AverWebpackConfig, InternalAverConfig } from '@averjs/config';

export default class StyleLoader {
  isProd: boolean;
  isServer: boolean;
  config: AverWebpackConfig;
  perfLoader: PerformanceLoader;
  postcss: PostCSS | null = null;
  name: string | null = null;

  constructor(
    isServer: boolean,
    config: InternalAverConfig,
    perfLoader: PerformanceLoader
  ) {
    this.isServer = isServer;
    this.config = config.webpack || {};
    this.isProd = config.isProd;
    this.perfLoader = perfLoader;

    if (this.config.postcss) this.postcss = new PostCSS(config);
  }

  get stylesAreInline() {
    return this.postcss || !this.config.css?.extract;
  }

  get exportOnlyLocals() {
    return this.isServer && this.config.css?.extract;
  }

  get importLoaders() {
    let cnt = 1;
    if (this.postcss) cnt++;
    if (this.stylesAreInline) cnt++;
    return cnt;
  }

  apply(
    name: string,
    rule: Rule,
    loaders: { name: string; options: any }[] = []
  ) {
    this.name = name;

    const moduleRule = rule.oneOf(`${name}-module`).resourceQuery(/module/);
    this.applyStyle(moduleRule, true);

    const plainRule = rule.oneOf(name);
    this.applyStyle(plainRule);

    for (const loader of loaders) {
      moduleRule.use(loader.name).loader(loader.name).options(loader.options);
      plainRule.use(loader.name).loader(loader.name).options(loader.options);
    }

    this.styleResources(moduleRule);
    this.styleResources(plainRule);
  }

  applyStyle(rule: Rule<Rule>, module = false) {
    if (this.config.css?.extract) this.extract(rule);

    this.perfLoader.apply(rule, this.name || '');

    if (!this.config.css?.extract) this.extract(rule);

    if (module) this.cssModules(rule);
    else this.css(rule);

    if (this.postcss) this.postcss.apply(rule);
  }

  extract(rule: Rule<Rule>) {
    if (this.config.css?.extract && !this.isServer) {
      rule.use('extract-css').loader(ExtractCssPlugin.loader);
    } else if (!this.config.css?.extract) {
      rule
        .use('vue-style-loader')
        .loader('vue-style-loader')
        .options({ sourceMap: !this.isProd });
    }
  }

  styleResources(rule: Rule<Rule>) {
    if (!this.config.css?.styleResources) return;

    const { resources = [], options = { patterns: [] } } =
      this.config.css.styleResources;
    const finalOptions: StyleResourcesLoaderOptions = { patterns: [] };
    if (this.name === 'css') return;

    const patterns = map(resources, (resource) =>
      path.resolve(process.cwd(), resource)
    );
    finalOptions.patterns = [...(options.patterns as string[]), ...patterns];

    rule
      .use('style-resources-loader')
      .loader('style-resources-loader')
      .options(finalOptions);
  }

  css(rule: Rule<Rule>) {
    rule.use('css-loader').loader('css-loader').options({
      esModule: false,
      importLoaders: this.importLoaders,
      sourceMap: !this.isProd
    });
  }

  cssModules(rule: Rule<Rule>) {
    rule
      .use('css-loader')
      .loader('css-loader')
      .options({
        esModule: false,
        modules: {
          localIdentName: `_${
            this.isProd ? '[hash:base64]' : '[path][name]---[local]'
          }`,
          exportOnlyLocals: this.exportOnlyLocals,
          exportLocalsConvention: 'camelCase'
        },
        importLoaders: this.importLoaders
      });
  }
}
