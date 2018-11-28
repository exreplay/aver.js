import redisAdapter from 'socket.io-redis';
import redis from 'redis';

export default class Websocket {
    constructor(server) {
        this.io = require('socket.io')(server);
        const pub = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, { auth_pass: process.env.REDIS_PASSWORD });
        const sub = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, { auth_pass: process.env.REDIS_PASSWORD });

        this.io.adapter(redisAdapter({ pubClient: pub, subClient: sub }));
        this.io.on('connection', socket => {
            console.log('client connect');
            socket.on('echo', function (data) {
                io.sockets.emit('message', data);
            });
        });
    }
}