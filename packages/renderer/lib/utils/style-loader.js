import fs from 'fs';
import path from 'path';
import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin';
import SafeParser from 'postcss-safe-parser';
import map from 'lodash/map';

export default class StyleLoader {
  constructor(isServer, config, perfLoader) {
    this.isProd = process.env.NODE_ENV === 'production';
    this.isServer = isServer;
    this.config = config;
    this.perfLoader = perfLoader;

    this.findPostcssConfig();
  }

  get stylesAreInline() {
    return this.postcssConfigExists || !this.config.css.extract;
  }

  get exportOnlyLocals() {
    return this.isServer && this.config.css.extract;
  }

  get importLoaders() {
    let cnt = 1;
    if (this.postcssConfigExists) cnt++;
    if (this.stylesAreInline) cnt++;
    return cnt;
  }

  findPostcssConfig() {
    const files = [
      '.postcssrc',
      '.postcssrc.js',
      'postcss.config.js',
      '.postcssrc.yaml',
      '.postcssrc.json'
    ];
    const pkg = require(path.resolve(process.cwd(), './package.json'));
    this.postcssConfigExists = false;

    if (pkg.postcss) {
      this.postcssConfigExists = true;
      return;
    }

    for (const file of files) {
      if (fs.existsSync(path.resolve(process.env.PROJECT_PATH, `../${file}`))) {
        this.postcssConfigExists = true;
        break;
      }
    }
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

    this.postcss(rule);
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

  postcss(rule) {
    if (this.stylesAreInline) {
      rule
        .use('cssnano')
          .loader('postcss-loader')
          .options({
            sourceMap: !this.isProd,
            plugins: [
              require('cssnano')({
                parser: SafeParser,
                discardComments: { removeAll: true }
              })
            ]
          });
    }

    if (this.postcssConfigExists) {
      rule
        .use('postcss')
          .loader('postcss-loader')
          .options({ sourceMap: !this.isProd });
    }
  }
}
