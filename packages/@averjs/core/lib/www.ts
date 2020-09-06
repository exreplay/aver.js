import express from 'express';
import http from 'http';

export default class WWW {
  app = express();
  port = this.normalizePort(process.env.PORT || '3000');
  server = http.createServer(this.app);

  constructor() {
    this.app.set('port', this.port);
  }

  startServer() {
    this.server.listen(this.port);
    this.server.on('error', this.onError.bind(this));
  }
    
  normalizePort(val: string) {
    const port = parseInt(val, 10);
        
    if (isNaN(port)) return val;
    if (port >= 0) return port;
        
    return false;
  }
    
  onError(error: Error & { syscall: string; code: string; }) {
    if (error.syscall !== 'listen') throw error;
        
    const bind = typeof this.port === 'string'
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
