import session from 'express-session';
import Redis from 'ioredis';
import ConnectRedis from 'connect-redis';
import uuid from 'uuid';

export default class SessionAdapter {
    constructor(app, config) {
        const sessionConf = {
            secret: process.env.REDIS_SECRET,
            genid: () => uuid.v4(),
            resave: false,
            saveUninitialized: false,
            cookie: {
                expires: new Date(Date.now() + (60 * 60 * 1000)),
                maxAge: 60 * 60 * 1000
            }
        };

        if (process.env.REDIS_HOST) {
            const RedisStore = ConnectRedis(session);
            Object.assign(sessionConf, {
                store: new RedisStore({
                    client: new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST, {
                        password: process.env.REDIS_PASSWORD
                    }),
                    prefix: 'sess-' + new Date().getDate() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getFullYear() + ':',
                    ttl: 3600
                }),
            });
        }

        if (process.env.NODE_ENV === 'production') sessionConf.cookie.secure = true;

        return session(Object.assign(sessionConf, config));
    }
}