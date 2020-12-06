import session, { SessionOptions } from 'express-session';
import Redis from 'ioredis';
import ConnectRedis, { RedisStoreOptions } from 'connect-redis';
import { v4 as uuidv4 } from 'uuid';
import merge from 'lodash/merge';
import { PluginFunction } from '@averjs/core/lib/plugins';
import './global';

export interface SessionPluginOptions {
  redisStoreConfig?: RedisStoreOptions;
  expressSessionConfig?: SessionOptions;
  ttl?: number;
}

const plugin: PluginFunction = function(options: SessionPluginOptions) {
  if (process.argv.includes('build')) return;

  const { redisStoreConfig, expressSessionConfig, ttl = 60 * 60 } = options;
  let store = null;

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
    const date = new Date();
    store = new RedisStore({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client: redisClient as any,
      prefix: `sess-${date.getDate()}-${date.getMonth() +
        1}-${date.getFullYear()}:`,
      ttl,
      ...redisStoreConfig
    });
  }

  const config = merge(
    {
      secret: process.env.REDIS_SECRET || uuidv4(),
      genid: () => uuidv4(),
      resave: false,
      saveUninitialized: true,
      cookie: {
        expires: new Date(Date.now() + ttl * 1000),
        maxAge: ttl * 1000,
        secure: this.config.isProd
      },
      store
    } as SessionOptions,
    expressSessionConfig
  );

  this.aver.config.sessionStore = store;

  this.aver.tap('server:after-register-middlewares', ({ app, middlewares }) => {
    if (this.config.isProd) app.set('trust proxy', 1);

    middlewares.push(session(config));
  });
};

export default plugin;
