/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import fs from 'fs';
import klawSync, { Item } from 'klaw-sync';
import Core from './core';
import { AverConfig } from '@averjs/config';

export type PluginFunction = (this: Core, ...args: any[]) => void;
export type Plugin<T = string> = 
  T |
  PluginFunction |
  [T, unknown?]

const requireModule = require('esm')(module);
export default class PluginContainer {
  aver: Core;
  config: AverConfig;
  cacheDir: string;

  constructor(aver: Core) {
    this.aver = aver;
    this.config = aver.config;
    this.cacheDir = aver.config.cacheDir;
  }

  async register() {
    if (this.config.buildPlugins && Array.isArray(this.config.buildPlugins) && !this.config._production) {
      await this.sequence(this.config.buildPlugins);
    }

    if (this.config.plugins && Array.isArray(this.config.plugins)) {
      await this.sequence(this.config.plugins);
    }
  }

  async sequence(plugins: Plugin[]) {
    // Run plugins in sequence by promisify everyone
    await plugins.reduce((promise, plugin) => {
      return promise.then(() => this.addModule(plugin));
    }, Promise.resolve());
  }

  async addModule(plugin: Plugin) {
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

    if (!handler && src) {
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

  require(src: string) {
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

  resolveModule(plugin: string) {
    try {
      return require.resolve(plugin);
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
    }
  }

  resolveEntryFiles(pluginPath: string) {
    const pluginPathDir = this.normalizePluginPath(pluginPath);
    let dirname: string | string[] = pluginPathDir.split('/');
    dirname = dirname[dirname.length - 1];
    const entriesFolder = path.resolve(pluginPathDir, './entries');
    let entries: Readonly<Item[]> = [];
    
    if (fs.existsSync(entriesFolder)) entries = klawSync(entriesFolder, { nodir: true });

    const entryNames = {
      app: new RegExp(`app\\.(${this.config.webpack.additionalExtensions.join('|')})`, 'i'),
      client: new RegExp(`entry-client\\.(${this.config.webpack.additionalExtensions.join('|')})`, 'i'),
      server: new RegExp(`entry-server\\.(${this.config.webpack.additionalExtensions.join('|')})`, 'i')
    };

    for (const entry of entries) {
      const dst = path.relative(dirname, entry.path).replace('entries', dirname);
      this.config.templates.push({ src: entry.path, dst, pluginPath: pluginPathDir, dirname });
      const foundEntry = Object.entries(entryNames).find(([ _, name ]) => entry.path.match(name));
      if (foundEntry && foundEntry[0]) this.config.entries[foundEntry[0]].push('./' + dst);
    }
  }

  normalizePluginPath(pluginPath: string) {
    if (fs.lstatSync(pluginPath).isDirectory()) return pluginPath;
    else return path.dirname(pluginPath);
  }

  relativeCacheDirPath(filePath: string) {
    return path.relative(
      path.resolve(process.cwd(), this.cacheDir),
      filePath
    );
  }

  resolvePath(plugin: string) {
    const pluginPath = path.resolve(process.env.PROJECT_PATH, '../', plugin);
    if (fs.existsSync(pluginPath)) return pluginPath;
    else return undefined;
  }
}
