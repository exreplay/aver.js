/* eslint-disable @typescript-eslint/no-var-requires */
import express, {
  Handler,
  Request,
  Response,
  ErrorRequestHandler
} from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs-extra';
import helmet from 'helmet';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import bodyParser from 'body-parser';
import * as rfs from 'rotating-file-stream';
import { v4 as uuidv4 } from 'uuid';
import chokidar from 'chokidar';
import indexOf from 'lodash/indexOf';
import WWW from './www';
import { SsrBuilder } from '@averjs/builder';
import Core from './core';
import { InternalAverConfig } from '@averjs/config';

const requireModule = require('esm')(module);

export type ExpressMiddlewares = (Handler | [string, Handler])[];

export default class Server extends WWW {
  config: InternalAverConfig;
  isProd: boolean;
  distPath: string;
  middlewares: ExpressMiddlewares = [];
  builder: SsrBuilder | null = null;

  constructor(aver: Core) {
    super(aver);
    this.config = aver.config;
    this.distPath = aver.config.distPath;
    this.isProd = aver.config.isProd;

    fs.existsSync(path.join(process.env.PROJECT_PATH, '../storage')) ||
      fs.mkdirSync(path.join(process.env.PROJECT_PATH, '../storage'));

    if (!this.isProd) {
      const watcher = chokidar.watch(process.env.API_PATH);
      this.aver.watchers.push(async () => {
        await watcher.close();
      });

      watcher.on('ready', () => {
        console.log('Watching for changes on the server');
        watcher.on('all', () => {
          console.log('Clearing server cache');
          Object.keys(require.cache).forEach(id => {
            // eslint-disable-next-line no-useless-escape
            if (/[/\\]api[/\\]/.test(id)) {
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
    await this.registerRoutes();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
      /* istanbul ignore next */
      if (!this.isProd) console.error(err.stack);

      req.error = err.stack;
      res.status(err.status || 500).json({
        success: false,
        errorId: req.id,
        msg: err.message,
        ...(err.data ? { data: err.data } : {})
      });
    };

    this.app.use(errorHandler);
  }

  async registerMiddlewares() {
    const serve = (path: string, cache: boolean) =>
      express.static(path, {
        maxAge: cache && this.isProd ? '1y' : 0
      });

    await this.aver.callHook('server:before-register-middlewares', {
      app: this.app,
      middlewares: this.middlewares,
      server: this.server
    });

    this.middlewares.push(
      helmet({
        contentSecurityPolicy: false,
        ...this.config.helmet
      })
    );
    this.logging();
    this.middlewares.push(cookieParser());
    this.middlewares.push(compression({ threshold: 0 }));

    this.middlewares.push(['/dist', serve(this.distPath, true)]);
    this.middlewares.push(['/public', serve('./public', true)]);
    this.middlewares.push(['/static', serve('./static', true)]);
    this.middlewares.push(['/storage', express.static('./storage')]);

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
        if (process.env.NODE_ENV === 'test')
          require(middlewaresPath)(req, res, next);
        /* istanbul ignore next */ else
          requireModule(middlewaresPath)(req, res, next);
      });
    }

    await this.aver.callHook('server:after-register-middlewares', {
      app: this.app,
      middlewares: this.middlewares,
      server: this.server
    });

    for (const middleware of this.middlewares) {
      if (typeof middleware === 'function') this.app.use(middleware);
      else if (Array.isArray(middleware)) this.app.use(...middleware);
    }
  }

  logging() {
    const logDirectory = path.join(process.env.PROJECT_PATH, '../storage/log');
    fs.existsSync(logDirectory) || fs.mkdirpSync(logDirectory);

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

    logger.token('id', (req: Request) => req.id);
    logger.token('error', (req: Request) => req.error);

    this.middlewares.push((req, _res, next) => {
      req.id = `${new Date().getTime()}-${uuidv4()}`;
      next();
    });

    this.middlewares.push(
      logger(
        ':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"\\n:error',
        {
          skip: function(_req, res) {
            return res.statusCode < 400;
          },
          stream: errorLogStream
        }
      )
    );

    this.middlewares.push(
      logger(
        ':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
        {
          skip: function(_req, res) {
            return res.statusCode > 400;
          },
          stream: accessLogStream
        }
      )
    );
  }

  async registerRoutes() {
    const routesPath = path.resolve(process.env.API_PATH, './routes');

    if (fs.existsSync(routesPath)) {
      this.app.use((req, res, next) => {
        if (process.env.NODE_ENV === 'test')
          require(routesPath)(req, res, next);
        /* istanbul ignore next */ else
          requireModule(routesPath)(req, res, next);
      });
    }

    await this.aver.callHook('server:before-register-routes', {
      app: this.app,
      middlewares: this.middlewares,
      server: this.server
    });

    this.app.get('/favicon.ico', function(_req, res) {
      res.sendStatus(204);
    });

    this.app.get('/service-worker.js', (_req, res, next) => {
      try {
        const sw = fs.readFileSync(
          path.resolve(this.distPath, './service-worker.js')
        );
        res.set({ 'Content-Type': 'application/javascript; charset=UTF-8' });
        res.send(sw);
      } catch (error) {
        next(error);
      }
    });

    this.app.get('/robots.txt', (_req, res, next) => {
      try {
        const sw = fs.readFileSync(
          path.resolve(process.env.PROJECT_PATH, '../robots.txt')
        );
        res.set({ 'Content-Type': 'text/plain; charset=UTF-8' });
        res.send(sw);
      } catch (error) {
        next(error);
      }
    });

    this.app.get(
      '*',
      this.isProd
        ? this.render.bind(this)
        : (req, res) => {
            this.builder?.readyPromise
              ?.then(async () => {
                await this.render(req, res);
              })
              .catch(error => console.log(error));
          }
    );

    await this.aver.callHook('server:after-register-routes', {
      app: this.app,
      middlewares: this.middlewares,
      server: this.server
    });
  }

  async render(req: Request, res: Response) {
    const s = Date.now();

    try {
      const html = await this.builder?.build(req);

      res.setHeader('Content-Type', 'text/html');
      res.send(html);

      if (!this.isProd) console.log(`whole request: ${Date.now() - s}ms`);
    } catch (error) {
      res.status(error.code || 500).send(error.message);
    }
  }
}
