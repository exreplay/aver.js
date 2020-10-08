import { Server } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      io: Server;
    }
  }
}

export {};
