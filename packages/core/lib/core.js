import Server from './server';
import Hooks from './hooks';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { getAverjsConfig } from '@averjs/config';

if (!process.env.AVER_NO_INIT) {
  if (fs.existsSync(path.resolve(process.env.PROJECT_PATH, '../.env'))) {
    const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.env.PROJECT_PATH, '../.env')));
    for (let k in envConfig) {
      process.env[k] = envConfig[k];
    }
    if (dotenv.error) {
      throw dotenv.error;
    }
  } else {
    console.warn("In order to use dotenv, please create a '.env' file in your project root.");
  }
}

export default class Core {
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
        require(plugin).default({
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
    
  build() {
    const Builder = require('@averjs/renderer').default;
    const builder = new Builder();
    return builder.compile();
  }

  init() {
    console.log('Check if required folder and files exist...');

    if (fs.existsSync(process.env.PROJECT_PATH)) {
      console.log('Root directory "src" already exists');
    } else {
      try {
        console.log('Root directory does not exist. Setting it up...');

        const appDir = path.resolve(require.resolve('@averjs/core'), '../app');
                
        fs.copySync(path.resolve(appDir, './src'), process.env.PROJECT_PATH, { recursive: true });
    
        console.log('Root directory successfully copied!');
        console.log('Copying necessary files...');

        fs.copyFileSync(path.resolve(appDir, './.eslintignore'), path.resolve(process.env.PROJECT_PATH, '../.eslintignore'));
        fs.copyFileSync(path.resolve(appDir, './.eslintrc.js'), path.resolve(process.env.PROJECT_PATH, '../.eslintrc.js'));
        fs.copyFileSync(path.resolve(appDir, './aver-config.js'), path.resolve(process.env.PROJECT_PATH, '../aver-config.js'));
        fs.copyFileSync(path.resolve(appDir, './_.gitignore'), path.resolve(process.env.PROJECT_PATH, '../.gitignore'));
        fs.copyFileSync(path.resolve(appDir, './jsconfig.json'), path.resolve(process.env.PROJECT_PATH, '../jsconfig.json'));
        fs.copyFileSync(path.resolve(appDir, './.env.example'), path.resolve(process.env.PROJECT_PATH, '../.env.example'));
    
        console.log('Creating api directories...');

        fs.mkdirSync(process.env.API_PATH);
        fs.mkdirSync(path.resolve(process.env.API_PATH, './database'));
        fs.mkdirSync(path.resolve(process.env.API_PATH, './database/seeds'));
        fs.mkdirSync(path.resolve(process.env.API_PATH, './errors'));
        fs.mkdirSync(path.resolve(process.env.API_PATH, './mail'));
        fs.mkdirSync(path.resolve(process.env.API_PATH, './mail/templates'));
        fs.mkdirSync(path.resolve(process.env.API_PATH, './middlewares'));
        fs.mkdirSync(path.resolve(process.env.API_PATH, './models'));
        fs.mkdirSync(path.resolve(process.env.API_PATH, './queues'));
        fs.mkdirSync(path.resolve(process.env.API_PATH, './routes'));

        fs.writeFileSync(path.resolve(process.env.API_PATH, './routes/index.js'), `import app from 'express';

const router = app.Router();

module.exports = router;`);

        fs.writeFileSync(path.resolve(process.env.API_PATH, './middlewares/index.js'), `import app from 'express';

const router = app.Router();

module.exports = router;`);

        console.log('Modifying package.json');

        const corePackageJSON = require(path.resolve(appDir, './package.json'));
        const packageJSONPath = path.resolve(process.env.PROJECT_PATH, '../package.json');
        const packageJSON = require(packageJSONPath);
    
        fs.writeFileSync(packageJSONPath, JSON.stringify(Object.assign(corePackageJSON, packageJSON), null, 2));
    
        console.log('Project setup successfull!');
      } catch (err) {
        console.log(err);
      }
    }
  }
}
