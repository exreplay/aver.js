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

  addModule(plugin) {
    const requireModule = require('esm')(module);
    
    if (typeof plugin === 'string') requireModule(plugin).default.call(this, {});
    else if (Array.isArray(plugin)) requireModule(plugin[0]).default.call(this, plugin[1] || {});
    else if (typeof plugin === 'function') plugin.call(this, {});
  }
}
