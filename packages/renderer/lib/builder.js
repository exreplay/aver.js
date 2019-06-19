import fs from 'fs-extra';
import path from 'path';
import webpack from 'webpack';
import template from 'lodash/template';
import klawSync from 'klaw-sync';
import WebpackClientConfiguration from './config/client';
import WebpackServerConfiguration from './config/server';
import MFS from 'memory-fs';
import { openBrowser } from '@averjs/shared-utils';
import { getAverjsConfig } from '@averjs/config';

export default class Builder {
  constructor(middlewares) {
    this.isProd = process.env.NODE_ENV === 'production';
    this.middlewares = middlewares;
    this.cacheDir = path.resolve('node_modules/.cache/averjs');
    this.globalConfig = getAverjsConfig();

    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirpSync(this.cacheDir);
      this.prepareTemplates();
    }

    this.clientConfig = new WebpackClientConfiguration().config();
    this.serverConfig = new WebpackServerConfiguration().config();

    this.mfs = new MFS();
    this.isBrowserOpen = false;
    this.bundle = null;
    this.clientManifest = null;
    this.template = null;
    this.resolve = null;
    this.readyPromise = new Promise(resolve => { this.resolve = resolve; });
  }

  prepareTemplates() {
    const appDir = path.resolve(require.resolve('@averjs/vue-app'), '../');
    const files = klawSync(appDir);
    for (const file of files) {
      if (file.stats.isDirectory()) {
        const dirName = path.basename(file.path);
        fs.mkdirpSync(path.resolve(this.cacheDir, dirName));
      } else if (file.stats.isFile()) {
        const fileName = path.basename(file.path);
        const pathName = path.basename(path.dirname(file.path));
        const fileToCompile = fs.readFileSync(file.path, 'utf8');
        const compiled = template(fileToCompile);
        const compiledApp = compiled({
          config: {
            progressbar: this.globalConfig.progressbar,
            i18n: this.globalConfig.i18n,
            csrf: this.globalConfig.csrf
          }
        });

        fs.writeFileSync(path.resolve(this.cacheDir, pathName !== 'lib' ? `${pathName}/${fileName}` : fileName), compiledApp);
      }
    }
  }
    
  compile(cb) {
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
        this.template = this.readFile('index.ssr.html');
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
        
    return Promise.all(promises);
  }

  update() {
    if (this.bundle && this.clientManifest && this.template) {
      if (!this.isBrowserOpen) {
        this.isBrowserOpen = true;
        
        let port = process.env.PORT || 3000;
        port = parseInt(port) !== 80 ? `:${port}` : '';
        
        openBrowser(`http://localhost${port}`);
      }
      
      this.resolve();
      this.cb(this.bundle, {
        clientManifest: this.clientManifest,
        template: this.template
      });
    }
  }

  setupClientCompiler() {
    this.clientConfig.entry.app = ['webpack-hot-middleware/client?name=client&reload=true&timeout=30000/__webpack_hmr', this.clientConfig.entry.app];
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

    this.middlewares.push(devMiddleware);
    
    this.middlewares.push(require('webpack-hot-middleware')(clientCompiler, {
      log: false,
      heartbeat: 10000
    }));

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
