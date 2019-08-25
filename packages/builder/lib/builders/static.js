import BaseBuilder from './base';
import path from 'path';
import fs from 'fs-extra';
import serialize from 'serialize-javascript';
import template from 'lodash/template';
import { minify } from 'html-minifier';

const requireModule = require('esm')(module);

export default class StaticBuilder extends BaseBuilder {
  constructor(config) {
    super();
    this.config = config;
    this.renderer = null;
    this.readyPromise = null;
    this.isProd = process.env.NODE_ENV === 'production';
    this.distPath = path.join(process.env.PROJECT_PATH, '../dist');

    this.initRenderer();
  }

  initRenderer() {
    const serverBundle = require(path.join(process.env.PROJECT_PATH, '../dist/vue-ssr-server-bundle.json'));
    const clientManifest = require(path.join(process.env.PROJECT_PATH, '../dist/vue-ssr-client-manifest.json'));
    this.renderer = this.createRenderer(serverBundle, Object.assign({
      clientManifest: clientManifest
    }, this.config.createRenderer));
  }
  
  async build() {
    const routes = requireModule(path.join(process.env.PROJECT_PATH, './pages')).default;
    for (const route of routes) {
      const context = {
        title: process.env.APP_NAME,
        url: route.path,
        cookies: '',
        host: ''
      };

      if (this.config.csrf) Object.assign(context, { csrfToken: '' });
    
      const html = await this.renderer.renderToString(context);

      const {
        title, htmlAttrs, bodyAttrs, headAttrs, link,
        style, script, noscript, meta
      } = context.meta.inject();

      const HEAD =
        meta.text() +
        title.text() +
        link.text() +
        context.renderStyles() +
        style.text() +
        context.renderResourceHints() +
        script.text() +
        noscript.text();

      const BODY =
        style.text({ pbody: true }) +
        script.text({ pbody: true }) +
        noscript.text({ pbody: true }) +
        html +
        `<script>window.__INITIAL_STATE__=${serialize(context.state, { isJSON: true })}</script>` +
        context.renderScripts() +
        style.text({ body: true }) +
        script.text({ body: true }) +
        noscript.text({ body: true });
      
      const HEAD_ATTRS = headAttrs.text();
      const HTML_ATTRS = htmlAttrs.text(true);
      const BODY_ATTRS = bodyAttrs.text();
  
      const fileToCompile = fs.readFileSync(path.resolve(require.resolve('@averjs/vue-app'), '../index.template.html'), 'utf-8');
      const compiled = template(fileToCompile, { interpolate: /{{([\s\S]+?)}}/g });
      const compiledTemplate = compiled({ HTML_ATTRS, HEAD_ATTRS, HEAD, BODY_ATTRS, BODY });
  
      const indexPath = path.join(this.distPath, route.path);
      if (!fs.existsSync(indexPath)) fs.mkdirpSync(indexPath);
      fs.writeFileSync(path.join(indexPath, 'index.html'), minify(compiledTemplate, {
        collapseBooleanAttributes: true,
        decodeEntities: true,
        minifyCSS: true,
        minifyJS: true,
        processConditionalComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        trimCustomFragments: true,
        useShortDoctype: true
      }));
    }

    fs.removeSync(path.join(this.distPath, 'vue-ssr-server-bundle.json'));
    fs.removeSync(path.join(this.distPath, 'vue-ssr-client-manifest.json'));
    fs.removeSync(path.join(this.distPath, 'index.ssr.html'));
  }
}