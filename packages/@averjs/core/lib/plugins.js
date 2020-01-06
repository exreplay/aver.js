import path from 'path';
import fs from 'fs';

const requireModule = require('esm')(module);
export default class PluginContainer {
  constructor(aver) {
    this.aver = aver;
    this.config = aver.config;
    this.cacheDir = path.resolve('node_modules/.cache/averjs');
  }

  async register() {
    if (this.config.buildPlugins && Array.isArray(this.config.buildPlugins) && !this.config._production) {
      await this.sequence(this.config.buildPlugins);
    }

    if (this.config.plugins && Array.isArray(this.config.plugins)) {
      await this.sequence(this.config.plugins);
    }
  }

  async sequence(plugins) {
    // Run plugins in sequence by promisify everyone
    await plugins.reduce((promise, plugin) => {
      return promise.then(() => this.addModule(plugin));
    }, Promise.resolve());
  }

  async addModule(plugin) {
    let src;
    let options;
    let handler;

    if (typeof plugin === 'string') {
      src = plugin;
    } else if (typeof plugin === 'function') {
      handler = plugin;
    } else if (Array.isArray(plugin)) {
      [ src, options ] = plugin;
    }

    if (!handler) {
      handler = this.require(src);
    }

    if (typeof handler !== 'function') {
      throw new Error('Plugin should export a function.');
    }

    if (!options) {
      options = {};
    }

    await handler.call(this, options);
  }

  require(src) {
    let pluginPath;

    pluginPath = this.resolveModule(src);

    if (!pluginPath) {
      pluginPath = this.resolvePath(src);
    }

    if (!pluginPath) {
      throw new Error(`Could not resolve plugin '${src}'. Please make sure either the package is installed or the file exists.`);
    }

    this.resolveEntryFiles(pluginPath);

    return requireModule(pluginPath).default;
  }

  resolveModule(plugin) {
    try {
      return require.resolve(plugin);
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
    }
  }

  resolveEntryFiles(pluginPath) {
    const pluginPathDir = this.normalizePluginPath(pluginPath);
    let dirname = pluginPathDir.split('/');
    dirname = dirname[dirname.length - 1];
    const pluginCachePath = path.resolve(this.cacheDir, dirname);

    if (!fs.existsSync(pluginCachePath)) fs.mkdirSync(pluginCachePath);

    const appFile = path.resolve(pluginPathDir, './app.js');
    const clientFile = path.resolve(pluginPathDir, './entry-client.js');
    const serverFile = path.resolve(pluginPathDir, './entry-server.js');

    if (fs.existsSync(appFile)) fs.copyFileSync(appFile, path.resolve(pluginCachePath, './app.js'));
    if (fs.existsSync(clientFile)) fs.copyFileSync(clientFile, path.resolve(pluginCachePath, './entry-client.js'));
    if (fs.existsSync(serverFile)) fs.copyFileSync(serverFile, path.resolve(pluginCachePath, './entry-server.js'));

    // if (!this.config.entries) this.config.entries = {};
    // if (!this.config.entries.app) this.config.entries.app = [];
    // if (!this.config.entries.client) this.config.entries.client = [];
    // if (!this.config.entries.server) this.config.entries.server = [];

    // if (fs.existsSync(appFile)) this.config.entries.app.push(this.relativeCacheDirPath(appFile));
    // if (fs.existsSync(clientFile)) this.config.entries.client.push(this.relativeCacheDirPath(clientFile));
    // if (fs.existsSync(serverFile)) this.config.entries.server.push(this.relativeCacheDirPath(serverFile));
  }

  normalizePluginPath(pluginPath) {
    if (fs.lstatSync(pluginPath).isDirectory()) return pluginPath;
    else return path.dirname(pluginPath);
  }

  relativeCacheDirPath(filePath) {
    return path.relative(
      path.resolve(process.cwd(), this.cacheDir),
      filePath
    );
  }

  resolvePath(plugin) {
    const pluginPath = path.resolve(process.env.PROJECT_PATH, '../', plugin);
    if (fs.existsSync(pluginPath)) return pluginPath;
    else return undefined;
  }
}
