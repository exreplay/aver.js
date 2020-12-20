import mongodb, { constructConnectionString, mergeOptions } from '../lib';
import path from 'path';
import { ConnectionOptions } from 'mongoose';

jest.mock('mongoose');

describe('mongodb plugin', () => {
  let errorOutputData = '';
  let outputData = '';

  beforeEach(() => {
    process.env.API_PATH = __dirname;
    errorOutputData = '';
    outputData = '';
    console.error = jest.fn(inputs => (errorOutputData = inputs));
    console.log = jest.fn(inputs => (outputData = inputs));
  });

  afterEach(() => {
    process.env.API_PATH = '';
    process.env.MONGODB_HOST = '';
    process.env.MONGODB_USERNAME = '';
    process.env.MONGODB_PASSWORT = '';
    process.env.MONGODB_DATENBANK = '';
    process.env.MONGODB_OPTIONS = '';

    jest.clearAllMocks();
  });

  it('should not run when build process arg is set', () => {
    process.argv.push('build');
    const result = mongodb.call({} as never);
    expect(result).toBeUndefined();
    process.argv = process.argv.filter(a => a !== 'build');
  });

  it('should not run and log error when one of the necessary options is not set', () => {
    let result = mongodb.call({} as never);
    expect(errorOutputData).toBe(
      '\nThe following .env variables have to be defined in order for Mongodb to work:\nMONGODB_HOST, MONGODB_USERNAME, MONGODB_PASSWORT, MONGODB_HOST, MONGODB_DATENBANK\n'
    );
    expect(result).toBeUndefined();

    process.env.MONGODB_HOST = 'host';

    result = mongodb.call({} as never);
    expect(errorOutputData).toBe(
      '\nThe following .env variables have to be defined in order for Mongodb to work:\nMONGODB_HOST, MONGODB_USERNAME, MONGODB_PASSWORT, MONGODB_HOST, MONGODB_DATENBANK\n'
    );
    expect(result).toBeUndefined();
  });

  it('should merge options correctly', () => {
    const options = mergeOptions({
      useUnifiedTopology: false,
      appname: 'test'
    });

    expect(options).toEqual({
      useNewUrlParser: true,
      useUnifiedTopology: false,
      appname: 'test'
    });
  });

  it('should construct connection string correctly', () => {
    process.env.MONGODB_HOST = 'host';
    process.env.MONGODB_USERNAME = 'username';
    process.env.MONGODB_PASSWORT = 'password';
    process.env.MONGODB_DATENBANK = 'database';

    expect(constructConnectionString()).toBe(
      'mongodb://username:password@host/database?authSource=admin'
    );

    process.env.MONGODB_OPTIONS = '?replicaSet=my-set';

    expect(constructConnectionString()).toBe(
      'mongodb://username:password@host/database?replicaSet=my-set'
    );
  });

  it('should try to connect to mongodb', async () => {
    process.env.MONGODB_HOST = 'host';
    process.env.MONGODB_USERNAME = 'username';
    process.env.MONGODB_PASSWORT = 'password';
    process.env.MONGODB_DATENBANK = 'database';

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mongoose = require('mongoose');
    const once = (event: string, fn: () => void) => {
      fn();
    };
    let options: ConnectionOptions;

    mongoose.connect = jest.fn(
      (connectionString: string, connectionOptions: ConnectionOptions) => {
        options = connectionOptions;
        return Promise.resolve();
      }
    );
    mongoose.connection = {
      on: jest.fn(),
      once
    };

    mongodb.call({} as never, {
      mongooseOptions: { useUnifiedTopology: false }
    });

    await mongoose.connect;

    expect(options).toEqual({
      useNewUrlParser: true,
      useUnifiedTopology: false
    });
    expect(outputData).toBe('Connection to MongoDB successfull!');
  });

  it('should log error when connection fails to mongodb', async () => {
    process.env.MONGODB_HOST = 'host';
    process.env.MONGODB_USERNAME = 'username';
    process.env.MONGODB_PASSWORT = 'password';
    process.env.MONGODB_DATENBANK = 'database';

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mongoose = require('mongoose');
    const on = (event: string, fn: () => void) => fn();
    const error = new Error('mongodb error');
    mongoose.connect = jest.fn(() => Promise.reject(error));
    mongoose.connection = {
      on,
      once: jest.fn()
    };

    mongodb.call({} as never);

    await mongoose.connect;

    expect(outputData).toBe(error);
    expect(errorOutputData).toBe('connection error:');
  });

  it('should requireModels', () => {
    process.env.API_PATH = path.resolve(__dirname, '../__fixtures__');
    process.env.MONGODB_HOST = 'host';
    process.env.MONGODB_USERNAME = 'username';
    process.env.MONGODB_PASSWORT = 'password';
    process.env.MONGODB_DATENBANK = 'database';

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mongoose = require('mongoose');
    mongoose.connect = jest.fn(() => Promise.resolve());

    mongodb.call({} as never, { requireModels: false });

    expect(
      Object.keys(require.cache).filter(f =>
        f.includes('__fixtures__/models/test.ts')
      ).length
    ).toBe(0);

    mongodb.call({} as never, { requireModels: true });

    expect(
      Object.keys(require.cache).filter(f =>
        f.includes('__fixtures__/models/test.ts')
      ).length
    ).toBe(1);
  });
});
