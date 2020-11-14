/* eslint-disable @typescript-eslint/no-var-requires */
import BaseBuilder, { BuilderContext } from './base';
import path from 'path';
import fs from 'fs';
import serialize from 'serialize-javascript';
import template from 'lodash/template';
import { minify } from 'html-minifier';
import HTMLCodeError from '../errors/HTMLCodeError';
import { AverConfig } from '@averjs/config';
import { BundleRenderer } from 'vue-server-renderer';
import { Request } from 'express';
import Core from '@averjs/core';
import Renderer from '@averjs/renderer';

export default class SsrBuilder extends BaseBuilder {
  aver: Core;
  config: AverConfig;
  renderer: BundleRenderer | null = null;
  readyPromise: Promise<void> | null = null;
  isProd: boolean;
  cacheDir: string;
  distPath: string;
  webpackRenderer?: Renderer;

  constructor(aver: Core) {
    super();
    this.aver = aver;
    this.config = aver.config;
    this.cacheDir = aver.config.cacheDir;
    this.distPath = aver.config.distPath;
    this.isProd = aver.config.isProd;
  }

  async close() {
    await this.webpackRenderer?.close();
  }

  async initRenderer() {
    if (this.isProd) {
      const serverBundle = require(path.join(this.distPath, './vue-ssr-server-bundle.json'));
      const clientManifest = require(path.join(this.distPath, './vue-ssr-client-manifest.json'));
      this.renderer = this.createRenderer(serverBundle, Object.assign({
        clientManifest: clientManifest
      }, this.config.createRenderer));
    } else {
      const { default: Renderer } = await import('@averjs/renderer');
      this.webpackRenderer = new Renderer({}, this.aver);
      await this.webpackRenderer.setup();
      this.readyPromise = this.webpackRenderer.compile((bundle, options) => {
        this.renderer = this.createRenderer(bundle, Object.assign(options, this.config.createRenderer));
      });
    }
  }

  async build(req: Request) {
    const context: BuilderContext = {
      title: process.env.APP_NAME,
      url: req.url,
      req
    };

    if (this.config.csrf) Object.assign(context, { csrfToken: req.csrfToken() });
    
    try {
      const html = await this.renderer?.renderToString(context);
      if (!context.meta) return;

      const {
        title, htmlAttrs, headAttrs, bodyAttrs, link,
        style, script, noscript, meta
      } = context.meta.inject();

      const HEAD = [];

      if (this.config.csrf) HEAD.push(`<meta name="csrf-token" content="${req.csrfToken()}">`);

      HEAD.push(
        meta?.text(),
        title?.text(),
        link?.text(),
        context.renderStyles?.(),
        style?.text(),
        context.renderResourceHints?.(),
        script?.text(),
        noscript?.text()
      );

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
      const compiled = template(fileToCompile, { interpolate: /{{([\S\s]+?)}}/g });
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
