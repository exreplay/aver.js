export default class PluginContainer {
  constructor(aver) {
    this.aver = aver;
    this.config = aver.config;
  }

  register() {
    if (!Array.isArray(this.config.plugins)) return;

    const requireModule = require('esm')(module);

    for (const plugin of this.config.plugins) {
      if (typeof plugin === 'string') requireModule(plugin).default(this, {});
      else if (Array.isArray(plugin)) requireModule(plugin[0]).default(this, plugin[1] || {});
      else if (typeof plugin === 'function') plugin(this, {});
    }
  }
}
