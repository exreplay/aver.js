import path from 'path';
import fs from 'fs';

export default class PluginContainer {
  constructor(aver) {
    this.aver = aver;
    this.config = aver.config;
  }

  async register() {
    if (!Array.isArray(this.config.plugins)) return;

    // Run plugins in sequence by promisify everyone
    await this.config.plugins.reduce((promise, plugin) => {
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
    const requireModule = require('esm')(module);
    let pluginPath;

    pluginPath = this.resolveModule(src);

    if (!pluginPath) {
      pluginPath = this.resolvePath(src);
    }

    if (!pluginPath) {
      throw new Error(`Could not resolve plugin '${src}'. Please make sure either the package is installed or the file exists.`);
    }

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

  resolvePath(plugin) {
    const pluginPath = path.resolve(process.env.PROJECT_PATH, '../', plugin);
    if (fs.existsSync(pluginPath)) return pluginPath;
    else return undefined;
  }
}
