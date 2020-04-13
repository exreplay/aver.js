import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

export default class Mongodb {
  constructor() {
    if (!process.env.MONGODB_HOST && !process.env.MONGODB_USERNAME && !process.env.MONGODB_PASSWORT && !process.env.MONGODB_HOST && !process.env.MONGODB_DATENBANK) {
      console.error('\nThe following .env variables have to be defined in order for Mongodb to work:\nMONGODB_HOST, MONGODB_USERNAME, MONGODB_PASSWORT, MONGODB_HOST, MONGODB_DATENBANK\n');
      return;
    }
        
    this.registerModels();

    mongoose.connect(this.getConnectionString(), { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.set('useCreateIndex', true);

    mongoose.Promise = global.Promise;

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log('Connection to MongoDB successfull!');
    });
  }

  getConnectionString() {
    return `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORT}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATENBANK}${(process.env.MONGODB_OPTIONS) ? process.env.MONGODB_OPTIONS : '?authSource=admin'}`;
  }

  registerModels() {
    const modelsDir = path.resolve(process.env.API_PATH, './models');

    if (fs.existsSync(modelsDir)) {
      const models = fs.readdirSync(modelsDir);
      for (const model of models) {
        require(path.resolve(modelsDir, model));
      }
    }
  }
}
