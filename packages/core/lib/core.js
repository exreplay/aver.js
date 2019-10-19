import Server from './server';
import Hookable from './hookable';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { getAverjsConfig } from '@averjs/config';

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
  }
  
  async run() {
    this.config = getAverjsConfig();
    this.initModuleAliases();
    this.registerPlugins();
    const server = new Server(this);
    await server.setup();
    server.startServer();
  }

  registerPlugins() {
    if (!Array.isArray(this.config.plugins)) return;

    const requireModule = require('esm')(module);

    for (const plugin of this.config.plugins) {
      if (typeof plugin === 'string') requireModule(plugin).default(this, {});
      else if (Array.isArray(plugin)) requireModule(plugin[0]).default(this, plugin[1] || {});
      else if (typeof plugin === 'function') plugin(this, {});
    }
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
