import express from 'express';
import http from 'http';

export default class WWW {
  constructor(hooks, config) {
    this.config = config;
    this.hooks = hooks;
    this.app = express();
    this.port = this.normalizePort(process.env.PORT || '3000');
    this.app.set('port', this.port);
    this.server = http.createServer(this.app);
  }

  startServer() {
    this.server.listen(this.port);
    this.server.on('error', this.onError.bind(this));
  }
    
  normalizePort(val) {
    const port = parseInt(val, 10);
        
    if (isNaN(port)) return val;
    if (port >= 0) return port;
        
    return false;
  }
    
  onError(error) {
    if (error.syscall !== 'listen') throw error;
        
    const bind = typeof port === 'string'
      ? 'Pipe ' + this.port
      : 'Port ' + this.port;
    
    if (error.code === 'EACCES') {
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    } else if (error.code === 'EADDRINUSE') {
      console.error(bind + ' is already in use');
      process.exit(1);
    } else {
      throw error;
    }
  }
}
