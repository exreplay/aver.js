/* eslint-disable @typescript-eslint/no-var-requires */
import fs from 'fs-extra';
import path from 'path';
import webpack, { Configuration } from 'webpack';
import template from 'lodash/template';
import WebpackClientConfiguration from './config/client';
import WebpackServerConfiguration from './config/server';
import MFS from 'memory-fs';
import { openBrowser } from '@averjs/shared-utils';
import { StaticBuilder } from '@averjs/builder';
import vueApp, { Templates } from '@averjs/vue-app';
import chokidar from 'chokidar';
import { AverConfig } from '@averjs/config';
import Core from '@averjs/core';
import { BundleRendererOptions } from 'vue-server-renderer';
import { ParsedArgs } from 'minimist';
import WebpackDevMiddleware from 'webpack-dev-middleware';
import WebpackHotMiddleware from 'webpack-hot-middleware';

export interface RendererOptions extends Partial<ParsedArgs> {
  static?: boolean;
}

type RendererCallback = (
  bundle: string,
  options: BundleRendererOptions
) => void;

export default class Renderer {
  aver: Core;
  config: AverConfig;
  options: RendererOptions;
  isProd: boolean;
  cacheDir: string;
  distPath: string;
  mfs = new MFS();
  isBrowserOpen = false;
  bundle: string | null = null;
  clientManifest: BundleRendererOptions['clientManifest'] | null = null;
  resolve:
    | ((value?: void | PromiseLike<void> | undefined) => void)
    | null = null;

  readyPromise: Promise<void> = new Promise(resolve => {
    this.resolve = resolve;
  });

  cb: RendererCallback | null = null;

  clientConfig: Configuration = {};
  serverConfig: Configuration = {};

  constructor(options: RendererOptions, aver: Core) {
    this.aver = aver;
    this.config = aver.config;
    this.options = options;
    this.cacheDir = aver.config.cacheDir;
    this.distPath = aver.config.distPath;
    this.isProd = aver.config.isProd;
  }

  async setup() {
    this.prepareTemplates();

    this.clientConfig = await new WebpackClientConfiguration(this.aver).config(
      this.options.static || false
    );
    this.serverConfig = await new WebpackServerConfiguration(this.aver).config(
      this.options.static || false
    );
  }

  prepareTemplates() {
    if (!this.config.templates) return;

    const templates = [...this.config.templates, ...vueApp()];

    for (const templateFile of templates) this.writeTemplateFile(templateFile);

    if (!this.isProd) this.initTemplatesWatcher();
  }

  initTemplatesWatcher() {
    const watcher = chokidar.watch(this.templatePathsToWatch());
    this.aver.watchers.push(async () => {
      await watcher.close();
    });

    watcher.on('ready', () => {
      watcher.on('all', (event, id) => {
        if (event !== 'addDir' && event !== 'unlinkDir') {
          this.updateTemplateFile(this.config.templates || [], event, id);
        }
      });
    });

    return watcher;
  }

  templatePathsToWatch() {
    return [
      ...new Set(
        this.config.templates?.map(temp =>
          path.resolve(temp.pluginPath || '', './entries')
        )
      )
    ];
  }

  updateTemplateFile(
    templates: Templates[],
    event: 'add' | 'change' | 'unlink',
    id: string
  ) {
    let template = templates.find(temp => temp.src === id);

    if (!template) {
      // Try to find any entry file from same plugin to get the plugin path
      const foundTemplate = templates.find(
        temp =>
          !path
            .relative(path.resolve(temp.pluginPath || '', './entries'), id)
            .startsWith('..')
      );
      if (foundTemplate) {
        const { dirname = '' } = foundTemplate;
        const [, entryFile] = id.split('/entries/');
        const dst = path.join(dirname, entryFile);

        template = { src: id, dst };

        // Push the newly created entry template into the config templates array so we dont have to construct the path again later
        templates?.push(template);
      }
    }

    if (event === 'unlink' && template?.dst)
      fs.unlinkSync(path.resolve(this.cacheDir, template.dst));
    else if (event !== 'unlink' && template) this.writeTemplateFile(template);
  }

  writeTemplateFile(templateFile: Templates) {
    const finalResolvedPath = path.resolve(this.cacheDir, templateFile.dst);
    const fileToCompile = fs.readFileSync(templateFile.src, 'utf8');
    const compiled = template(fileToCompile, {
      interpolate: /<%=([\S\s]+?)%>/g
    });
    const compiledApp = compiled({
      config: {
        additionalExtensions: this.config.webpack?.additionalExtensions,
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
      clientCompiler.hooks.done.tap('averjs', stats => {
        const jsonStats = stats.toJson();
        jsonStats.errors.forEach(err => console.error(err));
        jsonStats.warnings.forEach(err => console.warn(err));
        if (jsonStats.errors.length) return;

        this.clientManifest = JSON.parse(
          this.readFile('vue-ssr-client-manifest.json')
        );
        this.update();
      });

      // Compile server
      const serverWatcher = serverCompiler.watch({}, (err, stats) => {
        if (err) throw err;
        const jsonStats = stats.toJson();
        jsonStats.errors.forEach(err => console.error(err));
        jsonStats.warnings.forEach(err => console.warn(err));
        if (jsonStats.errors.length) return;

        this.bundle = JSON.parse(this.readFile('vue-ssr-server-bundle.json'));
        this.update();
      });

      this.aver.watchers.push(async () => {
        await new Promise(resolve =>
          serverWatcher.close(() => {
            resolve(true);
          })
        );
      });

      return this.readyPromise;
    }

    if (fs.existsSync(this.distPath)) fs.removeSync(this.distPath);

    compilers.push(this.clientConfig);
    compilers.push(this.serverConfig);

    for (const compiler of compilers) {
      if (!compiler) continue;

      promises.push(
        new Promise((resolve, reject) => {
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
        })
      );
    }

    await Promise.all(promises);

    if (this.options.static) {
      const staticBuilder = new StaticBuilder(this.aver);
      await staticBuilder.build();
    }
  }

  update() {
    if (this.bundle && this.clientManifest) {
      if (!this.isBrowserOpen && this.config.openBrowser) {
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
    if (this.clientConfig.entry) {
      const searchparams = new URLSearchParams();

      searchparams.append('reload', 'true');
      searchparams.append('name', 'client');
      searchparams.append('timeout', '30000');
      searchparams.append('path', '/__webpack_hmr/client');

      (this.clientConfig.entry as webpack.Entry).app = [
        `webpack-hot-middleware/client?${searchparams.toString()}`,
        (this.clientConfig.entry as webpack.Entry).app as string
      ];
    }
    if (this.clientConfig.output)
      this.clientConfig.output.filename = '[name].js';
    this.clientConfig.plugins?.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    );

    const clientCompiler = webpack(this.clientConfig);
    clientCompiler.outputFileSystem = this.mfs;
    const devMiddleware = WebpackDevMiddleware(clientCompiler as never, {
      publicPath: this.clientConfig.output?.publicPath,
      stats: 'none',
      logLevel: 'error',
      index: false
    });
    const hotMiddleware = WebpackHotMiddleware(clientCompiler as never, {
      log: false,
      heartbeat: 10_000,
      path: '/__webpack_hmr/client'
    });

    this.aver.watchers.push(() => {
      devMiddleware.close();
    });

    this.aver.watchers.push(() => {
      hotMiddleware.close();
    });

    this.aver.tap('server:before-register-middlewares', ({ middlewares }) => {
      middlewares.push(devMiddleware);
      middlewares.push(hotMiddleware);
    });

    return clientCompiler;
  }

  setupServerCompiler() {
    const serverCompiler = webpack(this.serverConfig);
    serverCompiler.outputFileSystem = this.mfs;
    return serverCompiler;
  }

  readFile(file: string) {
    if (!this.clientConfig?.output?.path) return;

    try {
      return this.mfs.readFileSync(
        path.join(this.clientConfig.output.path, file),
        'utf-8'
      );
    } catch (error) {
      console.log(error);
    }
  }
}
