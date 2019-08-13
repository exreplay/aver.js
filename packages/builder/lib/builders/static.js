import path from 'path';
import fs from 'fs-extra';
import LRU from 'lru-cache';
import { createBundleRenderer } from 'vue-server-renderer';

const requireModule = require('esm')(module);

export default class StaticBuilder {
  constructor(config) {
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
      
  createRenderer(bundle, options) {
    const bundleOptions = {
      cache: new LRU({
        max: 1000,
        maxAge: 1000 * 60 * 15
      }),
      runInNewContext: false,
      template: fs.readFileSync(path.resolve(process.env.PROJECT_PATH, '../dist/index.ssr.html'), 'utf-8')
    };
  
    return createBundleRenderer(bundle, Object.assign(options, bundleOptions));
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
  
      const indexPath = path.join(this.distPath, route.path);
      if (!fs.existsSync(indexPath)) fs.mkdirpSync(indexPath);
      fs.writeFileSync(path.join(indexPath, 'index.html'), html);
    }

    fs.removeSync(path.join(this.distPath, 'vue-ssr-server-bundle.json'));
    fs.removeSync(path.join(this.distPath, 'vue-ssr-client-manifest.json'));
    fs.removeSync(path.join(this.distPath, 'index.ssr.html'));
  }
}
