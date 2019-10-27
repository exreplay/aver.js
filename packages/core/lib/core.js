import Server from './server';
import Hookable from './hookable';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { getAverjsConfig } from '@averjs/config';
import Renderer from '@averjs/renderer';
import PluginContainer from './plugins';

export default class Core extends Hookable {
  constructor() {
    super();

    if (fs.existsSync(path.resolve(process.env.PROJECT_PATH, '../.env'))) {
      const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.env.PROJECT_PATH, '../.env')));
      for (const k in envConfig) {
        process.env[k] = envConfig[k];
      }
      if (dotenv.error) {
        throw dotenv.error;
      }
    } else {
      console.warn("In order to use dotenv, please create a '.env' file in your project root.");
    }

    this.config = getAverjsConfig();

    this.plugins = new PluginContainer(this);
    this.plugins.register();
  }

  async run() {
    this.initModuleAliases();
    const server = new Server(this);
    await server.setup();
    server.startServer();
  }

  async build(args) {
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
