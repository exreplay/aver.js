/* eslint-disable @typescript-eslint/no-namespace */
/* concat start */
import { Server as SocketIoServer } from 'socket.io';

declare global {
  namespace Express {
    interface Request {
      io: SocketIoServer;
    }
  }
}
/* concat end */

export {};
