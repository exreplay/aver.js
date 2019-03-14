import fs from 'fs';
import path from 'path';
import ExtractCssPlugin from 'extract-css-chunks-webpack-plugin';

export default class StyleLoader {
    constructor(isServer, config) {
        this.isProd = process.env.NODE_ENV === 'production';
        this.isServer = isServer;
        this.config = config;
        this.postcssConfigExists = fs.existsSync(path.resolve(process.env.PROJECT_PATH, '../postcss.config.js'));
    }

    apply(name, rule, loaders = []) {
        this.name = name;

        const moduleRule = rule.oneOf(`${name}-module`).resourceQuery(/module/);
        this.applyStyle(moduleRule, true);

        const plainRule = rule.oneOf(name);
        this.applyStyle(plainRule);

        for(const loader of loaders){
            moduleRule.use(loader.name).loader(loader.name).options(loader.options);
            plainRule.use(loader.name).loader(loader.name).options(loader.options);
        }
    }

    applyStyle(rule, module = false) {
        this.performanceLoader(rule);

        this.extract(rule);
        
        if(module) this.cssModules(rule)
        else this.css(rule);

        this.postcss(rule);
    }

    performanceLoader(rule) {
        if(this.name === 'css' && !this.isProd) {
            rule
                .use('cache-loader')
                    .loader('cache-loader')
                    .options({
                        cacheDirectory: path.resolve(process.env.PROJECT_PATH, '../node_modules/.cache/cache-loader'),
                        cacheIdentifier: 'css'
                    })
                    .end();
            
            if(!this.config.css.extract) {
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

    css(rule) {
        rule
            .use('css-loader')
                .loader('css-loader')
                .options({
                    importLoaders: this.postcssConfigExists ? 2 : 1,
                    sourceMap: !this.isProd,
                    exportOnlyLocals: this.isServer && this.config.css.extract
                });
    }

    cssModules(rule) {
        rule
            .use('css-loader')
                .loader('css-loader')
                .options({
                    modules: true,
                    importLoaders: this.postcssConfigExists ? 2 : 1,
                    localIdentName: `_${this.isProd ? '[hash:base64]' : '[path][name]---[local]'}`,
                    camelCase: true,
                    sourceMap: !this.isProd,
                    exportOnlyLocals: this.isServer && this.config.css.extract
                });
    }

    postcss(rule) {
        if (this.postcssConfigExists) {
            rule
                .use('postcss-loader')
                    .loader('postcss-loader')
                    .options({ sourceMap: !this.isProd });
        }
    }
}