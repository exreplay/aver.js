import fs from 'fs';
import path from 'path';
import SafeParser from 'postcss-safe-parser';

export default class PostCSS {
  constructor(config) {
    this.config = config;
    this.postcssConfigExists = false;
    this.findPostcssConfig();
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

  apply(rule) {
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
