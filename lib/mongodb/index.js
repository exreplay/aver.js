import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

export default class MongodbAdaptder {
    constructor() {
        if (!process.env.MONGODB_HOST) return;
        this.registerModels();

        mongoose.connect(this.getConnectionString(), { useNewUrlParser: true });
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