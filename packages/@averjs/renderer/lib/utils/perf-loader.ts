import path from 'path';
import { warmup } from 'thread-loader';
import { Module, Rule } from 'webpack-chain';
import { AverWebpackConfig } from '@averjs/config/lib/configs/renderer';

interface PoolConfig {
  [index: string]: {
    poolConfig: {
      name: string;
      poolTimeout: number;
    };
    loaders?: string[];
    useThread: boolean;
  };
}

export default class PerformanceLoader {
  isServer: boolean;
  config: AverWebpackConfig;
  isProd = process.env.NODE_ENV === 'production';

  constructor(isServer: boolean, config: AverWebpackConfig) {
    this.isServer = isServer;
    this.config = config;
  }

  get pools(): PoolConfig {
    const poolTimeout = !this.isProd ? Infinity : 2000;
    return {
      vue: {
        poolConfig: { name: 'vue', poolTimeout },
        useThread: false
      },
      js: {
        poolConfig: { name: 'js', poolTimeout },
        loaders: ['babel-loader'],
        useThread: true
      },
      css: {
        poolConfig: { name: 'css', poolTimeout },
        loaders: ['css-loader'],
        useThread: !this.config?.css?.extract
      }
    };
  }

  warmupLoaders() {
    if (!this.isProd) {
      for (const key of Object.keys(this.pools)) {
        const pool = this.pools[key];
        if (pool.loaders) warmup(pool.poolConfig, pool.loaders);
      }
    }
  }

  apply(rule: Rule<Rule | Module>, name: string) {
    const pool = this.pools[name];
    if (pool) {
      rule
        .use('cache-loader')
        .loader('cache-loader')
        .options({
          cacheDirectory: path.resolve(
            process.env.PROJECT_PATH,
            `../node_modules/.cache/cache-loader/${
              this.isServer ? 'server' : 'client'
            }/${name}`
          ),
          cacheIdentifier: name
        })
        .end();

      if (pool.useThread) {
        rule
          .use('thread-loader')
          .loader('thread-loader')
          .options(pool.poolConfig)
          .end();
      }
    }
  }
}
