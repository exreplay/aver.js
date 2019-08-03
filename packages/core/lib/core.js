import Server from './server';
import Hooks from './hooks';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { getAverjsConfig } from '@averjs/config';

export default class Core {
  constructor() {
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
  
  run(hooks = {}) {
    this.hooks = new Hooks();
    this.globalConfig = getAverjsConfig();
    this.initModuleAliases();
    this.registerPlugins();
    const server = new Server(this.hooks, this.globalConfig);
    server.startServer();
  }

  registerPlugins() {
    if (typeof this.globalConfig.plugins !== 'undefined') {
      for (const plugin of this.globalConfig.plugins) {
        require(plugin)({
          config: this.globalConfig,
          hooks: this.hooks
        });
      }
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

    if (typeof this.globalConfig.aliases !== 'undefined') Object.assign(aliases, this.globalConfig.aliases);

    ModuleAlias.addAliases(aliases);
  }
}
