const debug = require('debug')('node-test:server');
const http = require('http');

export default class WWW {
    constructor(app) {
        this.port = this.normalizePort(process.env.PORT || '3000');
        this.app = app;
        this.app.set('port', this.port);
    }
    
    startServer() {
        this.server = http.createServer(this.app);
        this.server.listen(this.port);
        this.server.on('error', this.onError.bind(this));
        this.server.on('listening', this.onListening.bind(this));
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
