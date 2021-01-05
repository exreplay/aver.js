import session, {
  mergeRedisStoreConfig,
  mergeExpressSessionConfig,
  createRedisStore
} from '../lib';
import Redis, { RedisOptions } from 'ioredis';
import { Handler } from 'express';

interface HookPayload {
  app: {
    set: (id: string, value: unknown) => void;
  };
  middlewares: Handler[];
}

let hooks: ((payload: HookPayload) => Promise<void> | void)[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const averThis: any = {
  config: {
    isProd: true
  },
  aver: {
    config: {},
    tap: (hook: string, fn: (payload: HookPayload) => void) => {
      hooks.push(fn);
    }
  }
};

describe('session plugin', () => {
  beforeEach(() => {
    process.env.API_PATH = __dirname;
  });

  afterEach(() => {
    process.env.API_PATH = '';
    process.env.REDIS_HOST = '';
    process.env.REDIS_PORT = '';
    process.env.REDIS_PASSWORD = '';

    jest.clearAllMocks();

    jest.clearAllMocks();
  });

  it('should merge options correctly', () => {
    const redisConfig = mergeRedisStoreConfig(60, new Redis(), {
      pass: 'test'
    });
    let sessionConfig = mergeExpressSessionConfig(true, 60, {
      secret: 'test'
    });

    expect(redisConfig.ttl).toBe(60);
    expect(redisConfig.pass).toBe('test');

    expect(sessionConfig.cookie?.maxAge).toBe(60_000);
    expect(sessionConfig.cookie?.secure).toBeTruthy();
    expect(sessionConfig.secret).toBe('test');
    expect(typeof sessionConfig.genid?.({} as never)).toBe('string');

    sessionConfig = mergeExpressSessionConfig(false, 60);
    expect(sessionConfig.cookie?.secure).toBeFalsy();
  });

  it('should create redis store correctly', () => {
    let store = createRedisStore(60);
    expect(store).toBeUndefined();

    process.env.REDIS_HOST = 'host';
    process.env.REDIS_PORT = '1234';
    process.env.REDIS_PASSWORD = 'password';

    store = createRedisStore(60);
    if (store && 'options' in store.client) {
      expect((store.client.options as RedisOptions).port).toBe(
        parseInt(process.env.REDIS_PORT)
      );
      expect((store.client.options as RedisOptions).host).toBe(
        process.env.REDIS_HOST
      );
      expect((store.client.options as RedisOptions).password).toBe(
        process.env.REDIS_PASSWORD
      );
    }
  });

  it('should not run when build is set', () => {
    process.argv.push('build');
    const result = session.call(averThis);
    expect(result).toBeUndefined();
    process.argv = process.argv.filter(a => a !== 'build');
  });

  it('should add session as middleware and updated aver config', async () => {
    session.call(averThis);
    let middlewares: Handler[] = [];
    const set = jest.fn();
    await hooks[0]({ app: { set }, middlewares });

    expect(averThis.aver.config.sessionStore).toBeUndefined();
    expect(set.mock.calls.length).toBe(1);
    expect(set.mock.calls[0][0]).toBe('trust proxy');
    expect(set.mock.calls[0][1]).toBe(1);

    process.env.REDIS_HOST = 'host';
    process.env.REDIS_PORT = '1234';
    process.env.REDIS_PASSWORD = 'password';

    middlewares = [];
    session.call(averThis);
    expect(averThis.aver.config.sessionStore.ttl).toBe(3600);

    middlewares = [];
    session.call(averThis, {
      redisStoreConfig: { prefix: 'test' },
      ttl: 123
    });
    expect(averThis.aver.config.sessionStore.ttl).toBe(123);
    expect(averThis.aver.config.sessionStore.prefix).toBe('test');

    middlewares = [];
    hooks = [];
    set.mockClear();
    averThis.config.isProd = false;
    session.call(averThis);
    await hooks[0]({ app: { set }, middlewares });
    expect(set.mock.calls.length).toBe(0);
  });
});
