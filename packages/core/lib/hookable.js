export default class Hookable {
  constructor() {
    this.hooks = {};
  }

  tap(name, fn) {
    if (!name || typeof fn !== 'function') return;

    if (!this.hooks[name]) this.hooks[name] = [];
    this.hooks[name].push(fn);
  }

  async callHook(name, ...args) {
    if (!this.hooks[name]) return;
    
    for (const hook of this.hooks[name]) {
      await hook(...args);
    }
  }
}
