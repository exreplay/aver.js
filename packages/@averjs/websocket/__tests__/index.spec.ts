/* eslint-disable @typescript-eslint/no-var-requires */
import { Request, Response, NextFunction } from 'express';
import websocket, { mergeOptions, setupRedisAdapter } from '../lib';
import Server from 'socket.io';

jest.mock('socket.io-redis', () => jest.fn((...args: unknown[]) => args));
jest.mock('socket.io');

type PartialRequest = Partial<Request & { io: typeof Server }>;
type Handler = (
  req: PartialRequest,
  res: Partial<Response>,
  next: NextFunction
) => void;

interface HookPayload {
  server: Record<string, unknown>;
  middlewares: Handler[];
}

let hooks: ((payload: HookPayload) => Promise<void> | void)[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const averThis: any = {
  aver: {
    tap: (hook: string, fn: (payload: HookPayload) => void) => {
      hooks.push(fn);
    }
  }
};

describe('mailer plugin', () => {
  let errorOutputData = '';

  beforeEach(() => {
    process.env.API_PATH = __dirname;
    errorOutputData = '';
    console.error = jest.fn((inputs) => (errorOutputData = inputs));
  });

  afterEach(() => {
    process.env.API_PATH = '';
    process.env.REDIS_HOST = '';
    process.env.REDIS_PORT = '';
    process.env.REDIS_PASSWORD = '';

    jest.clearAllMocks();
  });

  it('should not run when build process arg is set', () => {
    process.argv.push('build');
    const result = websocket.call(averThis);
    expect(result).toBeUndefined();
    process.argv = process.argv.filter((a) => a !== 'build');
  });

  it('should log error when one of the env variables is not set', () => {
    const result = websocket.call(averThis);
    expect(errorOutputData).toBe(
      'In order for websockets to work, please provide the following .env variables:\nREDIS_PORT, REDIS_HOST'
    );
    expect(result).toBeUndefined();
  });

  it('should merge options correctly', () => {
    const result = mergeOptions({ pingTimeout: 10, cookiePath: 'test' });
    expect(result).toEqual({ pingTimeout: 10, cookiePath: 'test' });
  });

  it('should set up redis adapter correctly', () => {
    process.env.REDIS_HOST = 'host';
    process.env.REDIS_PORT = '1234';
    process.env.REDIS_PASSWORD = 'password';

    const redis = require('redis');
    redis.createClient = jest.fn((...args) => args);

    const result = (setupRedisAdapter({ port: 1234 }) as unknown) as unknown[];

    expect(redis.createClient.mock.calls.length).toBe(2);
    for (const call of redis.createClient.mock.calls) {
      expect(call[0]).toBe(1234);
      expect(call[1]).toBe('host');
      expect(call[2]).toEqual({ auth_pass: 'password' });
    }

    expect(result[0]).toEqual({
      pubClient: [1234, 'host', { auth_pass: 'password' }],
      subClient: [1234, 'host', { auth_pass: 'password' }],
      port: 1234
    });
  });

  it('should add middleware and pass the socket to the request object', async () => {
    process.env.REDIS_HOST = 'host';
    process.env.REDIS_PORT = '1234';

    websocket.call(averThis);
    expect(hooks.length).toBe(1);

    const middlewares: Handler[] = [];
    await hooks[0]({ server: {}, middlewares });
    expect(middlewares.length).toBe(1);

    const req: PartialRequest = {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    middlewares[0](req, {}, () => {});
    expect(req.io).toBeInstanceOf(Server);

    const middleware = jest.fn();
    hooks = [];
    websocket.call(averThis, { middleware });
    await hooks[0]({ server: {}, middlewares });
    expect(middleware.mock.calls.length).toBe(1);
  });
});
