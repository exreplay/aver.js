import BaseBuilder from './base';
import path from 'path';
import fs from 'fs';
import serialize from 'serialize-javascript';
import template from 'lodash/template';
import { minify } from 'html-minifier';
import HTMLCodeError from '../errors/HTMLCodeError';

export default class SsrBuilder extends BaseBuilder {
  constructor(aver) {
    super();
    this.aver = aver;
    this.config = aver.config;
    this.renderer = null;
    this.readyPromise = null;
    this.isProd = process.env.NODE_ENV === 'production';
    this.cacheDir = aver.config.cacheDir;
    this.distPath = aver.config.distPath;
  }

  async initRenderer() {
    if (this.isProd) {
      const serverBundle = require(path.join(this.distPath, './vue-ssr-server-bundle.json'));
      const clientManifest = require(path.join(this.distPath, './vue-ssr-client-manifest.json'));
      this.renderer = this.createRenderer(serverBundle, Object.assign({
        clientManifest: clientManifest
      }, this.config.createRenderer));
    } else {
      const Renderer = require('@averjs/renderer');
      const renderer = new Renderer({}, this.aver);
      await renderer.setup();
      this.readyPromise = renderer.compile((bundle, options) => {
        this.renderer = this.createRenderer(bundle, Object.assign(options, this.config.createRenderer));
      });
    }
  }

  async build(req) {
    const context = {
      title: process.env.APP_NAME,
      url: req.url,
      req
    };

    if (this.config.csrf) Object.assign(context, { csrfToken: req.csrfToken() });
    
    try {
      const html = await this.renderer.renderToString(context);

      const {
        title, htmlAttrs, headAttrs, bodyAttrs, link,
        style, script, noscript, meta
      } = context.meta.inject();

      const HEAD = [];

      if (this.config.csrf) HEAD.push(`<meta name="csrf-token" content="${req.csrfToken()}">`);

      HEAD.push(
        meta.text(),
        title.text(),
        link.text(),
        context.renderStyles(),
        style.text(),
        context.renderResourceHints(),
        script.text(),
        noscript.text()
      );

      const BODY = [
        style.text({ pbody: true }),
        script.text({ pbody: true }),
        noscript.text({ pbody: true }),
        html,
        `<script>window.__INITIAL_STATE__=${serialize(context.state, { isJSON: true })}</script>`,
        context.renderScripts(),
        style.text({ body: true }),
        script.text({ body: true }),
        noscript.text({ body: true })
      ];

      const HEAD_ATTRS = headAttrs.text();
      const HTML_ATTRS = htmlAttrs.text(true);
      const BODY_ATTRS = bodyAttrs.text();

      await this.aver.callHook('builder:before-compile-ssr', {
        context,
        HTML_ATTRS,
        HEAD_ATTRS,
        HEAD,
        BODY_ATTRS,
        BODY
      });

      const templatePath = this.isProd
        ? path.resolve(this.distPath, './index.ssr.html')
        : path.resolve(this.cacheDir, './index.template.html');
      const fileToCompile = fs.readFileSync(templatePath, 'utf-8');
      const compiled = template(fileToCompile, { interpolate: /{{([\s\S]+?)}}/g });
      const compiledTemplate = compiled({
        HTML_ATTRS,
        HEAD_ATTRS,
        HEAD: HEAD.join(''),
        BODY_ATTRS,
        BODY: BODY.join('')
      });

      if (this.isProd) {
        return minify(compiledTemplate, {
          collapseBooleanAttributes: true,
          decodeEntities: true,
          minifyCSS: true,
          minifyJS: true,
          processConditionalComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          trimCustomFragments: true,
          useShortDoctype: true
        });
      } else {
        return compiledTemplate;
      }
    } catch (err) {
      if (err) {
        if (err.code === 404) {
          throw new HTMLCodeError(404, '404 | Page Not Found');
        } else {
          console.error(`error during render : ${req.url}`);
          console.error(err.stack);
          throw new HTMLCodeError(500, '500 | Internal Server Error');
        }
      }
    }
  }
}
