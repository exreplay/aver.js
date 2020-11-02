/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs-extra';
import path from 'path';
import webpack, { Configuration } from 'webpack';
import template from 'lodash/template';
import WebpackClientConfiguration, { RendererClientConfig } from './config/client';
import WebpackServerConfiguration from './config/server';
import MFS from 'memory-fs';
import { openBrowser } from '@averjs/shared-utils';
import { StaticBuilder } from '@averjs/builder';
import vueApp, { Templates } from '@averjs/vue-app';
import chokidar from 'chokidar';
import { AverConfig } from '@averjs/config';
import Core from '@averjs/core';
import { ParsedArgs } from 'minimist';

export interface RendererOptions extends Partial<ParsedArgs> {
  static?: boolean;
}

type RendererCallback = (bundle: string, options: any) => void;

export default class Renderer {
  aver: Core;
  config: AverConfig;
  options: RendererOptions;
  isProd = process.env.NODE_ENV === 'production';
  cacheDir: string;
  distPath: string;
  mfs = new MFS();
  isBrowserOpen = false;
  bundle: string | null = null;
  clientManifest: any['clientManifest'] | null = null;
  resolve: ((value?: void | PromiseLike<void> | undefined) => void) | null = null;
  readyPromise: Promise<void> = new Promise(resolve => { this.resolve = resolve; });
  cb: RendererCallback | null = null;

  clientConfig: RendererClientConfig | null = null;
  serverConfig: Configuration = {};

  constructor(options: RendererOptions, aver: Core) {
    this.aver = aver;
    this.config = aver.config;
    this.options = options;
    this.cacheDir = aver.config.cacheDir;
    this.distPath = aver.config.distPath;
  }

  async setup() {
    this.prepareTemplates();

    this.clientConfig = await new WebpackClientConfiguration(this.aver).config(this.options.static || false);
    this.serverConfig = await new WebpackServerConfiguration(this.aver).config(this.options.static || false);
  }

  prepareTemplates() {
    if(!this.config.templates) return;

    const templates = [
      ...this.config.templates,
      ...vueApp()
    ];

    for (const templateFile of templates) this.writeTemplateFile(templateFile);

    if (!this.isProd) {
      const watcher = chokidar.watch(
        // generate a new set of unique paths
        [ ...new Set(this.config.templates?.map(temp => path.resolve(temp.pluginPath || '', './entries'))) ]
      );
            
      watcher.on('ready', () => {
        watcher.on('all', (event, id) => {
          if (event !== 'addDir' && event !== 'unlinkDir') {
            if(!this.config.templates) return;

            let template = this.config.templates.find(temp => temp.src === id);

            if (!template) {
              // Try to find any entry file from same plugin to get the plugin path
              const foundTemplate = this.config.templates.find(temp => !path.relative(path.resolve(temp.pluginPath || '', './entries'), id).startsWith('..'));
              if(foundTemplate) {
                const { dirname = '' } = foundTemplate;
                const dst = path.relative(dirname, id).replace('entries', dirname);
      
                template = { src: id, dst };
      
                // Push the newly created entry template into the config templates array so we dont have to construct the path again later
                this.config.templates?.push(template);
              }
            }
    
            if (event === 'unlink' && template?.dst) fs.unlinkSync(path.resolve(this.cacheDir, template.dst));
            else if (event !== 'unlink' && template) this.writeTemplateFile(template);
          }
        });
      });
    }
  }

  writeTemplateFile(templateFile: Templates) {
    const finalResolvedPath = path.resolve(this.cacheDir, templateFile.dst);
    const fileToCompile = fs.readFileSync(templateFile.src, 'utf8');
    const compiled = template(fileToCompile, { interpolate: /<%=([\s\S]+?)%>/g });
    const compiledApp = compiled({
      config: {
        additionalExtensions: this.config.webpack.additionalExtensions,
        progressbar: this.config.progressbar,
        i18n: this.config.i18n,
        csrf: this.config.csrf,
        store: this.config.store
      }
    });

    fs.outputFileSync(finalResolvedPath, compiledApp);
  }
    
  async compile(cb?: RendererCallback): Promise<void> {
    const promises = [];
    const compilers = [];

    if (!this.isProd) {
      this.cb = cb || null;

      const clientCompiler = this.setupClientCompiler();
      const serverCompiler = this.setupServerCompiler();
      
      // Compile Client
      if(clientCompiler) {
        clientCompiler.hooks.done.tap('averjs', stats => {
          const jsonStats = stats.toJson();
          jsonStats.errors.forEach(err => console.error(err));
          jsonStats.warnings.forEach(err => console.warn(err));
          if (jsonStats.errors.length) return;
          
          this.clientManifest = JSON.parse(this.readFile('vue-ssr-client-manifest.json'));
          this.update();
        });
      }

      // Compile server
      serverCompiler.watch({}, (err, stats) => {
        if (err) throw err;
        const jsonStats = stats.toJson();
        jsonStats.errors.forEach(err => console.error(err));
        jsonStats.warnings.forEach(err => console.warn(err));
        if (jsonStats.errors.length) return;
              
        this.bundle = JSON.parse(this.readFile('vue-ssr-server-bundle.json'));
        this.update();
      });

      return this.readyPromise;
    }

    if (fs.existsSync(this.distPath)) fs.removeSync(this.distPath);

    compilers.push(this.clientConfig);
    compilers.push(this.serverConfig);
    
    for (const compiler of compilers) {
      if(!compiler) continue;

      promises.push(new Promise((resolve, reject) => {
        const compile = webpack(compiler);
                
        compile.run(() => null);
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
      const staticBuilder = new StaticBuilder(this.aver);
      staticBuilder.build();
    }
  }

  update() {
    if (this.bundle && this.clientManifest) {
      if (!this.isBrowserOpen) {
        this.isBrowserOpen = true;
        
        let port = process.env.PORT || '3000';
        port = parseInt(port) !== 80 ? `:${port}` : '';
        
        openBrowser(`http://localhost${port}`);
      }
      
      this.resolve?.();
      this.cb?.(this.bundle, {
        clientManifest: this.clientManifest
      });
    }
  }

  setupClientCompiler() {
    if(!this.clientConfig) return;

    this.clientConfig.entry.app = [ 'webpack-hot-middleware/client?name=client&reload=true&timeout=30000/__webpack_hmr', this.clientConfig.entry.app as string ];
    if(this.clientConfig.output) this.clientConfig.output.filename = '[name].js';
    this.clientConfig.plugins?.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    );
    
    const clientCompiler = webpack(this.clientConfig);
    clientCompiler.outputFileSystem = this.mfs;
    const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
      publicPath: this.clientConfig.output?.publicPath,
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

  readFile(file: string) {
    if(!this.clientConfig?.output?.path) return;

    try {
      return this.mfs.readFileSync(path.join(this.clientConfig.output.path, file), 'utf-8');
    } catch (e) { console.log(e); }
  }
}
