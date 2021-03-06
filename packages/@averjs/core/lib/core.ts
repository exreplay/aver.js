/* eslint-disable @typescript-eslint/no-var-requires */
import Server from './server';
import Hookable from './hookable';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { getAverjsConfig, InternalAverConfig } from '@averjs/config';
import PluginContainer, { PluginContainerInterface } from './plugins';
import Renderer, { RendererOptions } from '@averjs/renderer';

export type Watcher = () => Promise<void> | void;

export default class Core extends Hookable {
  config: InternalAverConfig;
  plugins: PluginContainerInterface;
  server: Server | null = null;
  renderer: Renderer | null = null;
  watchers: Watcher[] = [];

  constructor() {
    super();

    if (fs.existsSync(path.resolve(process.env.PROJECT_PATH, '../.env'))) {
      const envConfig = dotenv.parse(
        fs.readFileSync(path.resolve(process.env.PROJECT_PATH, '../.env'))
      );
      for (const k in envConfig) {
        process.env[k] = envConfig[k];
      }
    } else {
      console.warn(
        "In order to use dotenv, please create a '.env' file in your project root."
      );
    }

    this.config = getAverjsConfig();
    this.plugins = new PluginContainer(this);
  }

  async close() {
    await this.callHook('before-close', this.watchers);
    for (const close of this.watchers) await close();
    this.watchers = [];
    this.hooks = {};
    await this.callHook('after-close');
  }

  async run() {
    await this.plugins.register();
    await this.initModuleAliases();
    this.server = new Server(this);
    await this.server.setup();
    await this.server.startServer();
  }

  async build(args: RendererOptions) {
    await this.plugins.register();
    const { default: Renderer } = await import('@averjs/renderer');
    this.renderer = new Renderer(args, this);
    await this.renderer.setup();
    await this.renderer.compile();
    this.hooks = {};
  }

  async initModuleAliases() {
    const { default: ModuleAlias } = await import('module-alias');
    const aliases = {
      '@models': `${process.env.API_PATH}/models`,
      '@errors': `${process.env.API_PATH}/errors`,
      '@middlewares': `${process.env.API_PATH}/middlewares`,
      '@mail': `${process.env.API_PATH}/mail`,
      '@database': `${process.env.API_PATH}/database`,
      '@queues': `${process.env.API_PATH}/queues`,
      '@routes': `${process.env.API_PATH}/routes`
    };

    if (typeof this.config.aliases !== 'undefined')
      Object.assign(aliases, this.config.aliases);

    ModuleAlias.addAliases(aliases);
  }
}
