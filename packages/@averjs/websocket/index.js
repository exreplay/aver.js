import redisAdapter from 'socket.io-redis';
import redis from 'redis';

export default function() {
  if (!process.env.REDIS_HOST && !process.env.REDIS_PORT) {
    console.error(`
        In order for websockets to work, please provide the following .env variables:\n
        REDIS_PORT, REDIS_HOST
      `);
    return;
  }

  this.aver.tap('server:after-register-middlewares', ({ server, middlewares }) => {
    const io = require('socket.io')(server);
    const pub = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, { auth_pass: process.env.REDIS_PASSWORD });
    const sub = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, { auth_pass: process.env.REDIS_PASSWORD });

    io.adapter(redisAdapter({ pubClient: pub, subClient: sub }));

    middlewares.push((req, res, next) => {
      req.io = io;
      next();
    });
  });
};
