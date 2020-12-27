import express, { Express } from 'express';
import http from 'http';
import Core from './core';

export default class WWW {
  aver: Core;
  app: Express = express();
  port = this.normalizePort(process.env.PORT || '3000');
  server = http.createServer(this.app);

  constructor(aver: Core) {
    this.aver = aver;
    this.app.set('port', this.port);
  }

  startServer() {
    this.server.listen(this.port);
    this.server.on('error', this.onError.bind(this));
    this.aver.watchers.push(async () => {
      await new Promise((resolve, reject) => {
        this.server.close(err => {
          if (err) reject(err);
          resolve(true);
        });
      });
    });
  }

  normalizePort(val: string) {
    const port = parseInt(val, 10);

    if (isNaN(port)) return val;
    else return port.toString();
  }

  onError(error: Error & { syscall: string; code: string }) {
    if (error.syscall !== 'listen') throw error;

    const bind = 'Pipe ' + this.port;

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
