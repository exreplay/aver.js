const debug = require('debug')('node-test:server');
const http = require('http');
const redisAdapter = require('socket.io-redis');
const redis = require('redis');

export default class WWW {
    constructor(app) {
        this.port = this.normalizePort(process.env.PORT || '3000');
        this.app = app;
        this.app.set('port', this.port);
        this.startServer();
    }
    
    startServer() {
        this.server = http.createServer(this.app);
        this.server.listen(this.port);
        this.server.on('error', this.onError.bind(this));
        this.server.on('listening', this.onListening.bind(this));

        this.configureWebsocket();
    }

    configureWebsocket() {
        this.io = require('socket.io')(this.server);
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
    
    normalizePort(val) {
        const port = parseInt(val, 10);
        
        if (isNaN(port)) return val;
        if (port >= 0) return port;
        
        return false;
    }
    
    onError(error) {
        if (error.syscall !== 'listen') throw error;
        
        var bind = typeof port === 'string'
            ? 'Pipe ' + this.port
            : 'Port ' + this.port;
        
        switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
        }
    }
    
    onListening() {
        var addr = this.server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
}
