/* eslint-disable @typescript-eslint/no-var-requires */
import Server from './server';
import Hookable from './hookable';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { getAverjsConfig, AverConfig } from '@averjs/config';
import PluginContainer, { PluginContainerInterface } from './plugins';
import { RendererOptions } from '@averjs/renderer';

export default class Core extends Hookable {
  config: AverConfig;
  plugins: PluginContainerInterface;

  constructor() {
    super();

    if (fs.existsSync(path.resolve(process.env.PROJECT_PATH, '../.env'))) {
      const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.env.PROJECT_PATH, '../.env')));
      for (const k in envConfig) {
        process.env[k] = envConfig[k];
      }
    } else {
      console.warn("In order to use dotenv, please create a '.env' file in your project root.");
    }

    this.config = getAverjsConfig();
    this.plugins = new PluginContainer(this);
  }

  async run() {
    await this.plugins.register();
    this.initModuleAliases();
    const server = new Server(this);
    await server.setup();
    server.startServer();
  }

  async build(args: RendererOptions) {
    await this.plugins.register();
    const { default: Renderer } = await import('@averjs/renderer');
    const renderer = new Renderer(args, this);
    await renderer.setup();
    await renderer.compile();
  }

  initModuleAliases() {
    const ModuleAlias = require('module-alias');
    const aliases = {
      '@models': `${process.env.API_PATH}/models`,
      '@errors': `${process.env.API_PATH}/errors`,
      '@middlewares': `${process.env.API_PATH}/middlewares`,
      '@mail': `${process.env.API_PATH}/mail`,
      '@database': `${process.env.API_PATH}/database`,
      '@queues': `${process.env.API_PATH}/queues`,
      '@routes': `${process.env.API_PATH}/routes`
    };

    if (typeof this.config.aliases !== 'undefined') Object.assign(aliases, this.config.aliases);

    ModuleAlias.addAliases(aliases);
  }
}
