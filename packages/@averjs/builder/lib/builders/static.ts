/* eslint-disable @typescript-eslint/no-var-requires */

import BaseBuilder, { BuilderContext } from './base';
import path from 'path';
import fs from 'fs-extra';
import serialize from 'serialize-javascript';
import template from 'lodash/template';
import { minify } from 'html-minifier';
import { BundleRenderer } from 'vue-server-renderer';
import { AverConfig } from '@averjs/config';
import Core from '@averjs/core';

const requireModule = require('esm')(module);

export default class StaticBuilder extends BaseBuilder {
  aver: Core;
  config: AverConfig;
  renderer: BundleRenderer | null = null;
  readyPromise: Promise<boolean> | null = null;
  isProd = process.env.NODE_ENV === 'production';
  distPath: string;
  cacheDir: string;

  constructor(aver: Core) {
    super();
    this.aver = aver;
    this.config = aver.config;
    this.isProd = process.env.NODE_ENV === 'production';
    this.distPath = this.config.distPath;
    this.cacheDir = this.config.cacheDir;

    this.initRenderer();
  }

  initRenderer() {
    const serverBundle = require(path.join(this.distPath, './vue-ssr-server-bundle.json'));
    const clientManifest = require(path.join(this.distPath, './vue-ssr-client-manifest.json'));
    this.renderer = this.createRenderer(serverBundle, Object.assign({
      clientManifest: clientManifest
    }, this.config.createRenderer));
  }
  
  async build() {
    const routes = requireModule(path.join(process.env.PROJECT_PATH, './pages')).default;
    for (const route of routes) {
      const context: BuilderContext = {
        title: process.env.APP_NAME,
        url: route.path,
        req: {
          cookies: []
        }
      };

      if (this.config.csrf) Object.assign(context, { csrfToken: '' });
    
      const html = await this.renderer?.renderToString(context);
      if (!context.meta) return;

      const {
        title, htmlAttrs, bodyAttrs, headAttrs, link,
        style, script, noscript, meta
      } = context.meta.inject();

      const HEAD = [
        meta?.text(),
        title?.text(),
        link?.text(),
        context.renderStyles?.(),
        style?.text(),
        context.renderResourceHints?.(),
        script?.text(),
        noscript?.text()
      ];

      const BODY = [
        style?.text({ pbody: true }),
        script?.text({ pbody: true }),
        noscript?.text({ pbody: true }),
        html,
        `<script>window.__INITIAL_STATE__=${serialize(context.state, { isJSON: true })}</script>`,
        context.renderScripts?.(),
        style?.text({ body: true }),
        script?.text({ body: true }),
        noscript?.text({ body: true })
      ];
      
      const HEAD_ATTRS = headAttrs?.text();
      const HTML_ATTRS = htmlAttrs?.text(true);
      const BODY_ATTRS = bodyAttrs?.text();

      await this.aver.callHook('builder:before-compile-static', {
        context,
        HTML_ATTRS,
        HEAD_ATTRS,
        HEAD,
        BODY_ATTRS,
        BODY
      });
  
      const fileToCompile = fs.readFileSync(path.resolve(this.cacheDir, './index.template.html'), 'utf-8');
      const compiled = template(fileToCompile, { interpolate: /{{([\S\s]+?)}}/g });
      const compiledTemplate = compiled({
        HTML_ATTRS,
        HEAD_ATTRS,
        HEAD: HEAD.join(''),
        BODY_ATTRS,
        BODY: BODY.join('')
      });
  
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
