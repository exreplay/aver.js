import session, { SessionOptions, Store } from 'express-session';
import Redis from 'ioredis';
import ConnectRedis, { RedisStoreOptions, RedisStore } from 'connect-redis';
import { v4 as uuidv4 } from 'uuid';
import merge from 'lodash/merge';
import { PluginFunction } from '@averjs/core';

export interface SessionPluginOptions {
  redisStoreConfig?: RedisStoreOptions;
  expressSessionConfig?: SessionOptions;
  ttl?: number;
}

export function mergeRedisStoreConfig(
  ttl: number,
  client: InstanceType<typeof Redis>,
  redisStoreConfig?: RedisStoreOptions
) {
  const date = new Date();
  const defaultConfig: RedisStoreOptions = {
    client: client as never,
    prefix: `sess-${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}:`,
    ttl
  };
  return merge(defaultConfig, redisStoreConfig);
}

export function mergeExpressSessionConfig(
  isProd: boolean,
  ttl: number,
  expressSessionConfig?: SessionOptions,
  store?: RedisStore
) {
  const defaultConfig: SessionOptions = {
    secret: process.env.REDIS_SECRET || uuidv4(),
    genid: () => uuidv4(),
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: new Date(Date.now() + ttl * 1000),
      maxAge: ttl * 1000,
      secure: isProd
    },
    store: store as Store
  };

  return merge(defaultConfig, expressSessionConfig);
}

export function createRedisStore(ttl: number, config?: RedisStoreOptions) {
  if (
    process.env.REDIS_PORT &&
    process.env.REDIS_HOST &&
    process.env.REDIS_PASSWORD
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const RedisStore = ConnectRedis(session as any);
    const redisClient = new Redis(
      parseInt(process.env.REDIS_PORT),
      process.env.REDIS_HOST,
      {
        password: process.env.REDIS_PASSWORD
      }
    );
    return new RedisStore(mergeRedisStoreConfig(ttl, redisClient, config));
  }
}

const plugin: PluginFunction = function (options?: SessionPluginOptions) {
  if (process.argv.includes('build')) return;

  const { redisStoreConfig, expressSessionConfig, ttl = 60 * 60 } =
    options || {};
  const store: RedisStore | undefined = createRedisStore(ttl, redisStoreConfig);

  const config = mergeExpressSessionConfig(
    this.config.isProd,
    ttl,
    expressSessionConfig,
    store
  );

  this.aver.config.sessionStore = store;

  this.aver.tap('server:after-register-middlewares', ({ app, middlewares }) => {
    if (this.config.isProd) app.set('trust proxy', 1);

    middlewares.push(session(config));
  });
};

export default plugin;
