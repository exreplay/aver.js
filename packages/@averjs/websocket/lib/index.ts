import { createAdapter, RedisAdapterOptions } from 'socket.io-redis';
import redis from 'redis';
import { Server, ServerOptions } from 'socket.io';
import { PluginContainerInterface, PluginFunction } from '@averjs/core';

export interface WebsocketPluginOptions {
  socketIoRedis?: Partial<RedisAdapterOptions>;
  serverOptions?: Partial<ServerOptions>;
  middleware?: (
    this: PluginContainerInterface,
    io: Server
  ) => void | Promise<void>;
}

export function mergeOptions(
  serverOptions?: Partial<ServerOptions>
): Partial<ServerOptions> {
  const defaultServerOptions: Partial<ServerOptions> = {
    pingTimeout: 60_000
  };

  return {
    ...defaultServerOptions,
    ...serverOptions
  };
}

export function setupRedisAdapter(
  socketIoRedis?: Partial<RedisAdapterOptions>
) {
  const pub = redis.createClient(
    parseInt(process.env.REDIS_PORT),
    process.env.REDIS_HOST,
    { auth_pass: process.env.REDIS_PASSWORD }
  );
  const sub = redis.createClient(
    parseInt(process.env.REDIS_PORT),
    process.env.REDIS_HOST,
    { auth_pass: process.env.REDIS_PASSWORD }
  );

  return createAdapter({
    pubClient: pub,
    subClient: sub,
    ...socketIoRedis
  });
}

const plugin: PluginFunction = function (options?: WebsocketPluginOptions) {
  if (process.argv.includes('build')) return;

  const { socketIoRedis, serverOptions, middleware } = options || {};

  if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
    console.error(
      'In order for websockets to work, please provide the following .env variables:\nREDIS_PORT, REDIS_HOST'
    );
    return;
  }

  this.aver.tap(
    'server:after-register-middlewares',
    async ({ server, middlewares }) => {
      const io = new Server(server, {
        pingTimeout: 60_000,
        ...serverOptions
      });

      io.adapter(setupRedisAdapter(socketIoRedis));

      if (middleware) await middleware.call(this, io);

      middlewares.push((req, res, next) => {
        req.io = io;
        next();
      });
    }
  );
};

export default plugin;
