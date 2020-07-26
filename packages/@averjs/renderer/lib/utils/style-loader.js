import path from 'path';
import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin';
import map from 'lodash/map';
import PostCSS from './postcss';

export default class StyleLoader {
  constructor(isServer, config, perfLoader) {
    this.isProd = process.env.NODE_ENV === 'production';
    this.isServer = isServer;
    this.config = config;
    this.perfLoader = perfLoader;

    if (this.config.postcss) this.postcss = new PostCSS(this.config);
  }

  get stylesAreInline() {
    return this.postcss || !this.config.css.extract;
  }

  get exportOnlyLocals() {
    return this.isServer && this.config.css.extract;
  }

  get importLoaders() {
    let cnt = 1;
    if (this.postcss) cnt++;
    if (this.stylesAreInline) cnt++;
    return cnt;
  }

  async apply(name, rule, loaders = []) {
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

  applyStyle(rule, module = false) {
    this.perfLoader.apply(rule, this.name);

    this.extract(rule);
        
    if (module) this.cssModules(rule);
    else this.css(rule);

    if (this.postcss) this.postcss.apply(rule);
  }

  extract(rule) {
    if (this.config.css.extract && !this.isServer) {
      rule
        .use('extract-css')
          .loader(ExtractCssPlugin.loader)
          .options({ reloadAll: true });
    } else if (!this.config.css.extract) {
      rule
        .use('vue-style-loader')
          .loader('vue-style-loader')
          .options({ sourceMap: !this.isProd });
    }
  }

  styleResources(rule) {
    const { resources, options } = this.config.css.styleResources;
    if (resources.length === 0 || this.name === 'css') return;
    
    const patterns = map(resources, resource => path.resolve(process.cwd(), resource));

    rule
      .use('style-resources-loader')
        .loader('style-resources-loader')
        .options({
          patterns,
          ...options
        });
  }

  css(rule) {
    rule
      .use('css-loader')
        .loader('css-loader')
        .options({
          esModule: false,
          importLoaders: this.importLoaders,
          sourceMap: !this.isProd
        });
  }

  cssModules(rule) {
    rule
      .use('css-loader')
        .loader('css-loader')
        .options({
          esModule: false,
          modules: {
            localIdentName: `_${this.isProd ? '[hash:base64]' : '[path][name]---[local]'}`,
            exportOnlyLocals: this.exportOnlyLocals,
            exportLocalsConvention: 'camelCase'
          },
          importLoaders: this.importLoaders
        });
  }
}
