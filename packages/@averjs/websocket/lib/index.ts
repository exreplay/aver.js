import redisAdapter from 'socket.io-redis';
import redis from 'redis';
import Server from 'socket.io';
import { PluginContainerInterface, PluginFunction } from '@averjs/core/dist/plugins';
export * from './global';

export interface WebsocketPluginOptions {
  socketIoRedis?: redisAdapter.SocketIORedisOptions;
  serverOptions?: Server.ServerOptions;
  middleware?: (this: PluginContainerInterface, io: Server.Server) => void | Promise<void>;
}

const plugin: PluginFunction = function(options: WebsocketPluginOptions) {
  if (process.argv.includes('build')) return;

  const {
    socketIoRedis,
    serverOptions,
    middleware
  } = options;
  
  if (!process.env.REDIS_HOST && !process.env.REDIS_PORT) {
    console.error(`
        In order for websockets to work, please provide the following .env variables:\n
        REDIS_PORT, REDIS_HOST
      `);
    return;
  }

  this.aver.tap('server:after-register-middlewares', async({ server, middlewares }) => {
    const io = new Server(server, {
      pingTimeout: 60000,
      ...serverOptions
    });
    const pub = redis.createClient(parseInt(process.env.REDIS_PORT), process.env.REDIS_HOST, { auth_pass: process.env.REDIS_PASSWORD });
    const sub = redis.createClient(parseInt(process.env.REDIS_PORT), process.env.REDIS_HOST, { auth_pass: process.env.REDIS_PASSWORD });

    io.adapter(redisAdapter({ pubClient: pub, subClient: sub, ...socketIoRedis }));

    if(middleware) await middleware.bind(this, io);

    middlewares.push((req, res, next) => {
      req.io = io;
      next();
    });
  });
};

export default plugin;
