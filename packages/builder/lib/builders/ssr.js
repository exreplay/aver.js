import path from 'path';
import fs from 'fs';
import LRU from 'lru-cache';
import { createBundleRenderer } from 'vue-server-renderer';
import HTMLCodeError from '../errors/HTMLCodeError';

export default class SsrBuilder {
  constructor(config, middlewares) {
    this.config = config;
    this.middlewares = middlewares;
    this.renderer = null;
    this.readyPromise = null;
    this.isProd = process.env.NODE_ENV === 'production';

    this.initRenderer();
  }

  initRenderer() {
    if (this.isProd) {
      const serverBundle = require(path.join(process.env.PROJECT_PATH, '../dist/vue-ssr-server-bundle.json'));
      const clientManifest = require(path.join(process.env.PROJECT_PATH, '../dist/vue-ssr-client-manifest.json'));
      this.renderer = this.createRenderer(serverBundle, Object.assign({
        clientManifest: clientManifest
      }, this.config.createRenderer));
    } else {
      const Renderer = require('@averjs/renderer');
      const renderer = new Renderer({}, this.middlewares);
      this.readyPromise = renderer.compile((bundle, options) => {
        this.renderer = this.createRenderer(bundle, Object.assign(bundle, options, this.config.createRenderer));
      });
    }
  }
      
  createRenderer(bundle, options) {
    const bundleOptions = {
      cache: new LRU({
        max: 1000,
        maxAge: 1000 * 60 * 15
      }),
      runInNewContext: false
    };
  
    if (this.isProd) {
      Object.assign(bundleOptions, {
        template: fs.readFileSync(path.resolve(process.env.PROJECT_PATH, '../dist/index.ssr.html'), 'utf-8')
      });
    }
  
    return createBundleRenderer(bundle, Object.assign(options, bundleOptions));
  }

  async build(req) {
    const context = {
      title: process.env.APP_NAME,
      url: req.url,
      cookies: req.cookies,
      host: req.headers.host
    };

    if (this.config.csrf) Object.assign(context, { csrfToken: req.csrfToken() });

    if (typeof req.flash === 'function') Object.assign(context, { flash: req.flash() });
    if (typeof req.isAuthenticated === 'function') Object.assign(context, { isAuthenticated: req.isAuthenticated(), user: req.user });
    
    try {
      return await this.renderer.renderToString(context);
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
