import { connect, connection, set, ConnectionOptions } from 'mongoose';
import path from 'path';
import fs from 'fs';
import { PluginFunction } from '@averjs/core';
import './global';

export interface MongodbPluginOptions {
  mongooseOptions: ConnectionOptions;
  requireModels: boolean;
}

export function mergeOptions(options: ConnectionOptions): ConnectionOptions {
  const defaultOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

  return {
    ...defaultOptions,
    ...options
  };
}

export function constructConnectionString() {
  return `mongodb://${process.env.MONGODB_USERNAME}:${
    process.env.MONGODB_PASSWORT
  }@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATENBANK}${
    process.env.MONGODB_OPTIONS
      ? process.env.MONGODB_OPTIONS
      : '?authSource=admin'
  }`;
}

const plugin: PluginFunction = function(options?: MongodbPluginOptions) {
  if (process.argv.includes('build')) return;

  const { mongooseOptions = {}, requireModels = true } = options || {};

  if (
    !process.env.MONGODB_HOST ||
    !process.env.MONGODB_USERNAME ||
    !process.env.MONGODB_PASSWORT ||
    !process.env.MONGODB_DATENBANK
  ) {
    console.error(
      '\nThe following .env variables have to be defined in order for Mongodb to work:\nMONGODB_HOST, MONGODB_USERNAME, MONGODB_PASSWORT, MONGODB_HOST, MONGODB_DATENBANK\n'
    );
    return;
  }

  const connectionString = constructConnectionString();

  if (requireModels) {
    const modelsDir = path.resolve(process.env.API_PATH, './models');

    if (fs.existsSync(modelsDir)) {
      const models = fs.readdirSync(modelsDir);
      for (const model of models) {
        require(path.resolve(modelsDir, model));
      }
    }
  }

  connect(connectionString, mergeOptions(mongooseOptions)).catch(error =>
    console.log(error)
  );
  set('useCreateIndex', true);

  connection.on('error', console.error.bind(console, 'connection error:'));
  connection.once('open', function() {
    console.log('Connection to MongoDB successfull!');
  });
};

export default plugin;
