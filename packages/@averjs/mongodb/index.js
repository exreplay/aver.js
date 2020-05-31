import { connect, connection, set } from 'mongoose';
import path from 'path';
import fs from 'fs';

export default (options) => {
  if (process.argv.indexOf('build') !== -1) return;

  const {
    mongooseOptions = {},
    requireModels = true
  } = options;

  if (!process.env.MONGODB_HOST && !process.env.MONGODB_USERNAME && !process.env.MONGODB_PASSWORT && !process.env.MONGODB_HOST && !process.env.MONGODB_DATENBANK) {
    console.error('\nThe following .env variables have to be defined in order for Mongodb to work:\nMONGODB_HOST, MONGODB_USERNAME, MONGODB_PASSWORT, MONGODB_HOST, MONGODB_DATENBANK\n');
    return;
  }

  const connectionString = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORT}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATENBANK}${(process.env.MONGODB_OPTIONS) ? process.env.MONGODB_OPTIONS : '?authSource=admin'}`;

  if (requireModels) {
    const modelsDir = path.resolve(process.env.API_PATH, './models');
  
    if (fs.existsSync(modelsDir)) {
      const models = fs.readdirSync(modelsDir);
      for (const model of models) {
        require(path.resolve(modelsDir, model));
      }
    }
  }

  connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, ...mongooseOptions });
  set('useCreateIndex', true);

  connection.on('error', console.error.bind(console, 'connection error:'));
  connection.once('open', function() {
    console.log('Connection to MongoDB successfull!');
  });
};
