import path from 'path';
import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin';
import map from 'lodash/map';
import PostCSS from './postcss';

export default class StyleLoader {
  constructor(isServer, config) {
    this.isProd = process.env.NODE_ENV === 'production';
    this.isServer = isServer;
    this.config = config;
    this.postcss = new PostCSS(this.config);
  }

  get stylesAreInline() {
    return this.postcss.postcssConfigExists || !this.config.css.extract;
  }

  get exportOnlyLocals() {
    return this.isServer && this.config.css.extract;
  }

  get importLoaders() {
    let cnt = 1;
    if (this.postcss.postcssConfigExists) cnt++;
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
    this.performanceLoader(rule);

    this.extract(rule);
        
    if (module) this.cssModules(rule);
    else this.css(rule);

    this.postcss.apply(rule);
  }

  performanceLoader(rule) {
    if (this.name === 'css' && !this.isProd) {
      rule
        .use('cache-loader')
          .loader('cache-loader')
          .options({
            cacheDirectory: path.resolve(process.env.PROJECT_PATH, '../node_modules/.cache/cache-loader'),
            cacheIdentifier: 'css'
          })
          .end();
            
      if (!this.config.css.extract) {
        rule
          .use('thread-loader')
            .loader('thread-loader')
            .options({
              name: 'css',
              poolTimeout: 2000
            });
      }
    }
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
          importLoaders: this.importLoaders,
          sourceMap: !this.isProd,
          onlyLocals: this.exportOnlyLocals
        });
  }

  cssModules(rule) {
    rule
      .use('css-loader')
        .loader('css-loader')
        .options({
          modules: {
            localIdentName: `_${this.isProd ? '[hash:base64]' : '[path][name]---[local]'}`
          },
          importLoaders: this.importLoaders,
          localsConvention: 'camelCase',
          sourceMap: !this.isProd,
          onlyLocals: this.exportOnlyLocals
        });
  }
}
