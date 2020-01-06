import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import bodyParser from 'body-parser';
import rfs from 'rotating-file-stream';
import uuid from 'uuid/v4';
import chokidar from 'chokidar';
import indexOf from 'lodash/indexOf';
import WWW from './www';
import { SsrBuilder } from '@averjs/builder';

const requireModule = require('esm')(module);

export default class Server extends WWW {
  constructor(aver) {
    super();
    this.aver = aver;
    this.config = aver.config;
    this.isProd = process.env.NODE_ENV === 'production';
    this.middlewares = [];

    fs.existsSync(path.join(process.env.PROJECT_PATH, '../storage')) || fs.mkdirSync(path.join(process.env.PROJECT_PATH, '../storage'));

    if (!this.isProd) {
      const watcher = chokidar.watch(process.env.API_PATH);
            
      watcher.on('ready', () => {
        console.log('Watching for changes on the server');
        watcher.on('all', () => {
          console.log('Clearing server cache');
          Object.keys(require.cache).forEach((id) => {
            // eslint-disable-next-line no-useless-escape
            if (/[\/\\]api[\/\\]/.test(id)) {
              delete require.cache[id];
            }
          });
        });
      });
    }
  }

  async setup() {
    this.builder = new SsrBuilder(this.aver);
    await this.builder.initRenderer();
    await this.registerMiddlewares();
    this.registerRoutes();

    this.app.use((err, req, res, next) => {
      if (!this.isProd) console.error(err.stack);
      req.error = err.stack;
      res.status(err.status || 500).json(Object.assign({
        success: false,
        errorId: req.id,
        msg: err.message
      }, (err.data) ? { data: err.data } : {}));
    });
  }
    
  async registerMiddlewares() {
    const serve = (path, cache) => express.static(path, {
      maxAge: cache && this.isProd ? 1000 * 60 * 60 * 24 * 30 : 0
    });

    await this.aver.callHook('server:before-register-middlewares', { app: this.app, middlewares: this.middlewares });
        
    this.middlewares.push(helmet());
    this.logging();
    this.middlewares.push(cookieParser());
    this.middlewares.push(compression({ threshold: 0 }));
        
    this.middlewares.push([ '/dist', serve('./dist', true) ]);
    this.middlewares.push([ '/public', serve('./public', true) ]);
    this.middlewares.push([ '/static', serve('./static', true) ]);
    this.middlewares.push([ '/storage', express.static('./storage') ]);

    this.middlewares.push(bodyParser.json());
    this.middlewares.push(bodyParser.urlencoded({ extended: false }));

    if (this.config.csrf) {
      this.middlewares.push((req, res, next) => {
        if (indexOf(this.config.csrfExclude, req.path) !== -1) return next();
        csrf({ cookie: true })(req, res, next);
      });
    }

    const middlewaresPath = path.resolve(process.env.API_PATH, './middlewares');
    if (fs.existsSync(middlewaresPath)) {
      this.middlewares.push((req, res, next) => {
        requireModule(middlewaresPath)(req, res, next);
      });
    }

    await this.aver.callHook('server:after-register-middlewares', { app: this.app, middlewares: this.middlewares });

    for (const middleware of this.middlewares) {
      if (typeof middleware === 'function') this.app.use(middleware);
      else if (middleware instanceof Array) this.app.use(...middleware);
    }
  }

  logging() {
    const logDirectory = path.join(process.env.PROJECT_PATH, '../storage/log');
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

    const accessLogStream = rfs.createStream('access.log', {
      interval: '1d',
      maxFiles: 10,
      path: logDirectory
    });

    const errorLogStream = rfs.createStream('error.log', {
      interval: '1d',
      maxFiles: 10,
      path: logDirectory
    });

    logger.token('id', req => req.id);
    logger.token('error', req => req.error);

    this.middlewares.push((req, res, next) => {
      req.id = (new Date().getTime()) + '-' + uuid();
      next();
    });

    this.middlewares.push(logger(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"\\n:error', {
      skip: function(req, res) {
        return res.statusCode < 400;
      },
      stream: errorLogStream
    }));

    this.middlewares.push(logger(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
      skip: function(req, res) {
        return res.statusCode > 400;
      },
      stream: accessLogStream
    }));
  }
    
  registerRoutes() {
    const routesPath = path.resolve(process.env.API_PATH, './routes');

    if (fs.existsSync(routesPath)) {
      this.app.use((req, res, next) => {
        requireModule(routesPath)(req, res, next);
      });
    }

    this.app.get('/favicon.ico', function(req, res) {
      res.sendStatus(204);
    });

    this.app.get('/service-worker.js', (req, res, next) => {
      try {
        const sw = fs.readFileSync(path.resolve(process.env.PROJECT_PATH, '../dist/service-worker.js'));
        res.set({ 'Content-Type': 'application/javascript; charset=UTF-8' });
        res.send(sw);
      } catch (err) {
        next(err);
      }
    });

    this.app.get('/robots.txt', (req, res, next) => {
      try {
        const sw = fs.readFileSync(path.resolve(process.env.PROJECT_PATH, '../robots.txt'));
        res.set({ 'Content-Type': 'text/plain; charset=UTF-8' });
        res.send(sw);
      } catch (err) {
        next(err);
      }
    });

    this.app.get('*', this.isProd ? this.render.bind(this) : (req, res) => {
      this.builder.readyPromise.then(async() => {
        await this.render(req, res);
      });
    });
  }
    
  async render(req, res) {
    const s = Date.now();

    try {
      const html = await this.builder.build(req);
            
      res.setHeader('Content-Type', 'text/html');
      res.send(html);

      if (!this.isProd) console.log(`whole request: ${Date.now() - s}ms`);
    } catch (err) {
      res.status(err.code || 500).send(err.message);
    }
  }
}
