import express, { Express } from 'express';
import http from 'http';
import { Socket } from 'net';
import Core from './core';

export default class WWW {
  aver: Core;
  app: Express;
  port = this.normalizePort(process.env.PORT || '3000');
  server: http.Server;
  sockets: Socket[] = [];

  constructor(aver: Core) {
    this.aver = aver;
    this.app = express();
    this.server = http.createServer(this.app);
    this.app.set('port', this.port);
  }

  async startServer() {
    await new Promise<void>(resolve => {
      this.server.listen(this.port, resolve);
    });

    this.server.on('error', this.onError.bind(this));
    this.server.on('connection', socket => {
      this.sockets.push(socket);

      socket.on('close', () => {
        this.sockets = this.sockets.filter(s => s !== socket);
      });
    });

    this.aver.watchers.push(async () => {
      await new Promise((resolve, reject) => {
        this.server.close(err => {
          if (err) reject(err);

          for (const socket of this.sockets) socket.destroy();
          this.sockets = [];

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
