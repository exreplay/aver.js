// import path from 'path';
import { warmup } from 'thread-loader';
import { Module, Rule } from 'webpack-chain';
import { AverWebpackConfig, InternalAverConfig } from '@averjs/config';

export interface Pool {
  poolConfig: {
    name: string;
    poolTimeout: number;
  };
  loaders?: string[];
  useThread: boolean;
}
export interface PoolConfig {
  [index: string]: Pool;
}

// TODO: add test for thread loader
export default class PerformanceLoader {
  isServer: boolean;
  config: AverWebpackConfig;
  isProd = process.env.NODE_ENV === 'production';

  constructor(isServer: boolean, config: InternalAverConfig) {
    this.isServer = isServer;
    this.config = config.webpack || {};
    this.isProd = config.isProd;
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
      },
      ...this.config.threadLoader?.pools
    };
  }

  /* istanbul ignore next */
  warmupLoaders() {
    if (!this.isProd && process.env.NODE_ENV !== 'test') {
      for (const key of Object.keys(this.pools)) {
        const pool = this.pools[key];
        if (pool.loaders) this.warmup(pool.poolConfig, pool.loaders);
      }
    }
  }

  /* istanbul ignore next */
  warmup(config: Pool['poolConfig'], loaders: Pool['loaders']) {
    warmup(config, loaders);
  }

  apply(rule: Rule<Rule | Module>, name: string) {
    const pool = this.pools[name];
    if (pool) {
      /* istanbul ignore if */
      if (pool.useThread && process.env.NODE_ENV !== 'test') {
        rule
          .use('thread-loader')
          .loader('thread-loader')
          .options(pool.poolConfig)
          .end();
      }
    }
  }
}
