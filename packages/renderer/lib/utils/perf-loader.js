import path from 'path';
import { warmup } from 'thread-loader';

export default class PerformanceLoader {
  constructor(isServer, config) {
    this.isServer = isServer;
    this.config = config;
    this.isProd = process.env.NODE_ENV === 'production';
  }

  get pools() {
    const poolTimeout = !this.isProd ? Infinity : 2000;
    return {
      vue: {
        useThread: false
      },
      js: {
        poolConfig: { name: 'js', poolTimeout },
        loaders: [ 'babel-loader' ],
        useThread: true
      },
      css: {
        poolConfig: { name: 'css', poolTimeout },
        loaders: [ 'css-loader' ],
        useThread: !this.config.css.extract
      }
    };
  }

  warmupLoaders() {
    for (const key of Object.keys(this.pools)) {
      const pool = this.pools[key];
      if (pool.loaders) warmup(pool.poolConfig, pool.loaders);
    }
  }

  apply(rule, name) {
    const pool = this.pools[name];
    if (pool) {
      rule.use('cache-loader')
          .loader('cache-loader')
          .options({
            cacheDirectory: path.resolve(process.env.PROJECT_PATH, `../node_modules/.cache/cache-loader/${this.isServer ? 'server' : 'client'}/${name}`),
            cacheIdentifier: name
          })
          .end();
      
      if (pool.useThread) {
        rule.use('thread-loader')
        .loader('thread-loader')
        .options(pool.poolConfig)
        .end();
      }
    }
  }
}
