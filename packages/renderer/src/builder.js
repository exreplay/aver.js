import fs from 'fs-extra';
import path from 'path';
import webpack from 'webpack';
import template from 'lodash/template';
import klawSync from 'klaw-sync';
import WebpackClientConfiguration from './client.config';
import WebpackServerConfiguration from './server.config';
import { getAverjsConfig, defaultFileName } from '@averjs/config';

export default class Builder {
  constructor() {
    this.cacheDir = path.resolve('node_modules/.cache/averjs');
    this.corePkgPath = path.resolve(require.resolve('@averjs/core'), '../');
    this.globalConfig = getAverjsConfig(this.getConfig());

    if (!fs.existsSync(this.cacheDir)) fs.mkdirSync(this.cacheDir);

    this.prepareTemplates();

    this.clientConfig = new WebpackClientConfiguration().config();
    this.serverConfig = new WebpackServerConfiguration().config();
  }

  getConfig() {
    const globalConfPath = path.resolve(process.env.PROJECT_PATH, `../${defaultFileName}`);
    let userConf = {};
    if (fs.existsSync(globalConfPath)) userConf = require(globalConfPath).default;

    return userConf;
  }

  prepareTemplates() {
    const appDir = path.resolve(this.corePkgPath, './vue');
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
            i18n: this.globalConfig.i18n
          }
        });

        fs.writeFileSync(path.resolve(this.cacheDir, pathName !== 'vue' ? `${pathName}/${fileName}` : fileName), compiledApp);
      }
    }
  }
    
  compile() {
    const promises = [];
    const compilers = [];

    compilers.push(this.clientConfig);
    compilers.push(this.serverConfig);
        
    for (const compiler of this.compilers) {
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
}
