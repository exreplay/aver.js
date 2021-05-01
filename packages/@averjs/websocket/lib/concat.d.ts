import { Server as SocketIoServer } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      io: SocketIoServer;
    }
  }
}
