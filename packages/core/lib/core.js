import Server from './server';
import Hooks from './hooks';
import path from 'path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { getAverjsConfig } from '@averjs/config';
import ora from 'ora';

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
    this.appDir = path.resolve(require.resolve('@averjs/core'), '../app');
    const srcSpinner = ora('Creating "src" directory').start();

    if (fs.existsSync(process.env.PROJECT_PATH)) {
      srcSpinner.info('Root directory "src" already exists');
    } else {
      fs.copySync(path.resolve(this.appDir, './src'), process.env.PROJECT_PATH, { recursive: true });
      srcSpinner.succeed('Root directory successfully copied!');
    }

    console.log('Copying necessary files...');
    
    this.copyFile('.eslintignore');
    this.copyFile('.eslintrc.js');
    this.copyFile('aver-config.js');
    this.copyFile('_.gitignore', true);
    this.copyFile('jsconfig.json');
    this.copyFile('.env.example');
    
    console.log('Creating api directories...');

    this.createApiDir();
    this.createApiDir('database');
    this.createApiDir('database/seeds');
    this.createApiDir('errors');
    this.createApiDir('mail');
    this.createApiDir('mail/templates');
    this.createApiDir('middlewares');
    this.createApiDir('models');
    this.createApiDir('queues');
    this.createApiDir('routes');

    this.writeFile('./api/routes/index.js', this.trimLines(`
        import app from 'express';

        const router = app.Router();

        module.exports = router;
    `));

    this.writeFile('./api/middlewares/index.js', this.trimLines(`
        import app from 'express';

        const router = app.Router();

        module.exports = router;
    `));

    console.log('Modifying package.json');

    const corePackageJSON = require(path.resolve(this.appDir, './package.json'));
    const packageJSONPath = path.resolve(process.env.PROJECT_PATH, '../package.json');
    const packageJSON = require(packageJSONPath);
    
    fs.writeFileSync(packageJSONPath, JSON.stringify(Object.assign(corePackageJSON, packageJSON), null, 2));
    
    console.log('Project setup successfull!');
  }

  writeFile(file, data) {
    const spinner = ora(`Writing file "${file}"`).start();
    const destination = path.resolve(process.cwd(), file);

    if (!fs.existsSync(destination)) {
      fs.writeFileSync(path.resolve(process.cwd(), file), data);
      spinner.succeed(`File "${file}" successfully written!`);
    } else {
      spinner.info(`File "${file}" already exists`);
    }
  }

  copyFile(file, removeUnderscore = false) {
    const spinner = ora(`Copying "${file}"`).start();
    const destinationFile = removeUnderscore ? file.replace('_', '') : file;
    const destination = path.resolve(process.env.PROJECT_PATH, `../${destinationFile}`);

    if (!fs.existsSync(destination)) {
      fs.copyFileSync(path.resolve(this.appDir, `./${file}`), destination);
      spinner.succeed(`File "${file}" successfully copied!`);
    } else {
      spinner.info(`File "${file}" already exists`);
    }
  }

  createApiDir(dir) {
    const spinner = ora(`Creating "${dir}" directory`).start();
    const dirPath = path.resolve(process.env.API_PATH, dir ? `./${dir}` : '');

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
      spinner.succeed(`Directory "${dir || 'api'}" successfully created!`);
    } else {
      spinner.info(`Directory "${dir || 'api'}" already exists`);
    }
  }

  trimLines(s) {
    const lines = s.split('\n');
    let trimmedLines = [];

    for (const key in lines) {
      const line = lines[key];
      const newLine = line.trim();

      trimmedLines.push(newLine);
    }

    return trimmedLines.join('\n').trimLeft();
  }
}
