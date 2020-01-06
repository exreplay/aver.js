import fs from 'fs-extra';
import path from 'path';
import webpack from 'webpack';
import template from 'lodash/template';
import WebpackClientConfiguration from './config/client';
import WebpackServerConfiguration from './config/server';
import MFS from 'memory-fs';
import { openBrowser } from '@averjs/shared-utils';
import { StaticBuilder } from '@averjs/builder';
import vueApp from '@averjs/vue-app';

export default class Renderer {
  constructor(options, aver) {
    this.aver = aver;
    this.config = aver.config;
    this.isProd = process.env.NODE_ENV === 'production';
    this.options = options;
    this.cacheDir = path.resolve('node_modules/.cache/averjs');
    this.distPath = path.join(process.env.PROJECT_PATH, '../dist');
    this.mfs = new MFS();
    this.isBrowserOpen = false;
    this.bundle = null;
    this.clientManifest = null;
    this.resolve = null;
    this.readyPromise = new Promise(resolve => { this.resolve = resolve; });
  }

  async setup() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirpSync(this.cacheDir);
      this.prepareTemplates();
    }

    this.clientConfig = await new WebpackClientConfiguration(this.aver).config(this.options.static);
    this.serverConfig = await new WebpackServerConfiguration(this.aver).config(this.options.static);
  }

  prepareTemplates() {
    const templates = vueApp();
    for (const templateFile of templates) {
      const finalResolvedPath = path.resolve(this.cacheDir, templateFile.dst);
      const fileToCompile = fs.readFileSync(templateFile.src, 'utf8');
      const compiled = template(fileToCompile, { interpolate: /<%=([\s\S]+?)%>/g });
      const compiledApp = compiled({
        config: {
          progressbar: this.config.progressbar,
          i18n: this.config.i18n,
          csrf: this.config.csrf,
          router: this.config.router,
          store: this.config.store,
          entries: this.config.entries
        }
      });

      fs.outputFileSync(finalResolvedPath, compiledApp);
    }
  }
    
  async compile(cb) {
    const promises = [];
    const compilers = [];

    if (!this.isProd) {
      this.cb = cb;

      const clientCompiler = this.setupClientCompiler();
      const serverCompiler = this.setupServerCompiler();

      // Compile Client
      clientCompiler.hooks.done.tap('averjs', stats => {
        stats = stats.toJson();
        stats.errors.forEach(err => console.error(err));
        stats.warnings.forEach(err => console.warn(err));
        if (stats.errors.length) return;
      
        this.clientManifest = JSON.parse(this.readFile('vue-ssr-client-manifest.json'));
        this.update();
      });

      // Compile server
      serverCompiler.watch({}, (err, stats) => {
        if (err) throw err;
        stats = stats.toJson();
        if (stats.errors.length) return;
              
        this.bundle = JSON.parse(this.readFile('vue-ssr-server-bundle.json'));
        this.update();
      });

      return this.readyPromise;
    }

    if (fs.existsSync(this.distPath)) fs.removeSync(this.distPath);

    compilers.push(this.clientConfig);
    compilers.push(this.serverConfig);
    
    for (const compiler of compilers) {
      promises.push(new Promise((resolve, reject) => {
        const compile = webpack(compiler);
                
        compile.run();
        compile.hooks.done.tap('load-resource', stats => {
          const info = stats.toJson();
    
          if (stats.hasErrors()) {
            console.error(info.errors);
            return reject(info.errors);
          }
    
          resolve(info);
        });
      }));
    }

    await Promise.all(promises);
    
    if (this.options.static) {
      const staticBuilder = new StaticBuilder(this.config);
      staticBuilder.build();
    }
  }

  update() {
    if (this.bundle && this.clientManifest) {
      if (!this.isBrowserOpen) {
        this.isBrowserOpen = true;
        
        let port = process.env.PORT || 3000;
        port = parseInt(port) !== 80 ? `:${port}` : '';
        
        openBrowser(`http://localhost${port}`);
      }
      
      this.resolve();
      this.cb(this.bundle, {
        clientManifest: this.clientManifest
      });
    }
  }

  setupClientCompiler() {
    this.clientConfig.entry.app = [ 'webpack-hot-middleware/client?name=client&reload=true&timeout=30000/__webpack_hmr', this.clientConfig.entry.app ];
    this.clientConfig.output.filename = '[name].js';
    this.clientConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    );
    
    const clientCompiler = webpack(this.clientConfig);
    clientCompiler.outputFileSystem = this.mfs;
    const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
      publicPath: this.clientConfig.output.publicPath,
      noInfo: true,
      stats: 'none',
      logLevel: 'error',
      index: false
    });

    this.aver.tap('server:before-register-middlewares', ({ middlewares }) => {
      middlewares.push(devMiddleware);
    
      middlewares.push(require('webpack-hot-middleware')(clientCompiler, {
        log: false,
        heartbeat: 10000
      }));
    });

    return clientCompiler;
  }

  setupServerCompiler() {
    const serverCompiler = webpack(this.serverConfig);
    serverCompiler.outputFileSystem = this.mfs;
    return serverCompiler;
  }

  readFile(file) {
    try {
      return this.mfs.readFileSync(path.join(this.clientConfig.output.path, file), 'utf-8');
    } catch (e) { console.log(e); }
  }
}
