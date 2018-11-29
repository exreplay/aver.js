import express                  from 'express';
import LRU                      from 'lru-cache';
import compression              from 'compression';
import path                     from 'path';
import fs                       from 'fs';
import { createBundleRenderer } from 'vue-server-renderer';
import helmet                   from 'helmet';
import logger                   from 'morgan';
import cookieParser             from 'cookie-parser';
import csrf                     from 'csurf';
import bodyParser               from 'body-parser';
// import microcache               from 'route-cache';
import rfs                      from 'rotating-file-stream';
import uuid                     from 'uuid/v4';
import chokidar                 from 'chokidar';
import indexOf                  from 'lodash/indexOf';
import WWW                      from './www';

export default class Server {
    constructor(hooks, config) {
        this.config = config;
        this.hooks = hooks;
        this.app = express();
        this.csrfProtection = csrf({ cookie: true });
        this.renderer = null;
        this.readyPromise = null;
        this.isProd = process.env.NODE_ENV === 'production';

        fs.existsSync(path.join(process.env.PROJECT_PATH, '../storage')) || fs.mkdirSync(path.join(process.env.PROJECT_PATH, '../storage'))

        if(!this.isProd) {
            const watcher = chokidar.watch(process.env.API_PATH);
            
            watcher.on('ready', () => {
                console.log('Watching for changes on the server');
                watcher.on('all', () => {
                    console.log(`Clearing server cache`);
                    Object.keys(require.cache).forEach((id) => {
                        if (/[\/\\]api[\/\\]/.test(id)) {
                            delete require.cache[id];
                        }
                    });
                });
            });
        }

        this.initRenderer();
        this.registerMiddlewares();
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

        this.www = new WWW(this.app, config);
    }
    
    initRenderer() {
        const self = this;
        
        if (this.isProd) {
            const serverBundle = require(path.join(process.env.PROJECT_PATH, '../dist/vue-ssr-server-bundle.json'));
            const clientManifest = require(path.join(process.env.PROJECT_PATH, '../dist/vue-ssr-client-manifest.json'));
            this.renderer = this.createRenderer(serverBundle, {
                clientManifest: clientManifest
            });
        } else {
            const WebpackDevServer = require(path.resolve(require.resolve('@averjs/renderer'), '../src/setup-dev-server')).default;
            this.readyPromise = new WebpackDevServer(this.app, (bundle, options) => {
                self.renderer = self.createRenderer(bundle, Object.assign(bundle, options));
            });
        }
    }
    
    createRenderer(bundle, options) {
        const bundleOptions = {
            cache: new LRU({
                max: 1000,
                maxAge: 1000 * 60 * 15
            }),
            runInNewContext: false
        };

        if (this.isProd) {
            Object.assign(bundleOptions, {
                template: fs.readFileSync(path.resolve(process.env.PROJECT_PATH, '../dist/index.ssr.html'), 'utf-8')
            });
        }

        return createBundleRenderer(bundle, Object.assign(options, bundleOptions));
    }
    
    registerMiddlewares() {
        const serve = (path, cache) => express.static(path, {
            maxAge: cache && this.isProd ? 1000 * 60 * 60 * 24 * 30 : 0
        });

        this.middlewares = [];
        
        this.middlewares.push(helmet());
        this.logging();
        this.middlewares.push(cookieParser());
        this.middlewares.push(compression({ threshold: 0 }));
        
        this.middlewares.push(['/dist', serve('./dist', true)]);
        this.middlewares.push(['/public', serve('./public', true)]);
        this.middlewares.push(['/static', serve('./static', true)]);
        this.middlewares.push(['/storage', express.static('./storage')]);
        
        this.middlewares.push((req, res, next) => {
            req.io = this.www.io;
            next();
        });

        this.middlewares.push(bodyParser.json());
        this.middlewares.push(bodyParser.urlencoded({ extended: false }));
        this.middlewares.push((req, res, next) => {
            if(indexOf(this.config.csrfExclude, req.path) !== -1) return next();
            csrf({ cookie: true })(req, res, next);
        });
        
        for(const middleware of this.hooks.middlewares) {
            middleware({
                app: this.app,
                middlewares: this.middlewares
            });
        }

        const middlewaresPath = path.resolve(process.env.API_PATH, './middlewares');
        if (fs.existsSync(middlewaresPath)) {
            this.middlewares.push((req, res, next) => {
                require(middlewaresPath)(req, res, next);
            });
        }

        for(const middleware of this.middlewares) {
            if(typeof middleware === 'function') this.app.use(middleware);
            else if(typeof middleware === 'array') this.app.use(...middleware);
        }

        // this.app.use(microcache.cacheSeconds(1, req => {
        //     if (req.isAuthenticated()) return false;
        //     return req.originalUrl
        // }));
    }

    logging() {
        const logDirectory = path.join(process.env.PROJECT_PATH, '../storage/log');
        fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

        const accessLogStream = rfs('access.log', {
            interval: '1d',
            path: logDirectory
        });

        const errorLogStream = rfs('error.log', {
            interval: '1d',
            path: logDirectory
        });

        logger.token('id', req => req.id);
        logger.token('error', req => req.error);

        this.middlewares.push((req, res, next) => {
            req.id = (new Date().getTime()) + '-' + uuid();
            next();
        });

        this.middlewares.push(logger(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"\\n:error', {
            skip: function (req, res) {
                return res.statusCode < 400
            },
            stream: errorLogStream
        }));

        this.middlewares.push(logger(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
            skip: function (req, res) {
                return res.statusCode > 400
            },
            stream: accessLogStream
        }));
    }
    
    registerRoutes() {
        const self = this;
        const routesPath = path.resolve(process.env.API_PATH, './routes');

        if (fs.existsSync(routesPath)) {
            this.app.use((req, res, next) => {
                require(routesPath)(req, res, next);
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

        this.app.get('*', this.csrfProtection, this.isProd ? this.render.bind(this) : (req, res) => {
            self.readyPromise.then(() => self.render(req, res));
        });
    }
    
    render(req, res) {
        const self = this;
        const s = Date.now();
        const context = {
            title: process.env.APP_NAME,
            url: req.url,
            csrfToken: req.csrfToken(),
            cookies: req.cookies
        };

        if (typeof req.flash === 'function') Object.assign(context, { flash: req.flash() });
        if (typeof req.isAuthenticated === 'function') Object.assign(context, { isAuthenticated: req.isAuthenticated(), user: req.user });
        
        this.renderer.renderToString(context, (err, html) => {
            res.setHeader('Content-Type', 'text/html');
            
            if (err) {
                if (err.code === 404) {
                    return res.status(404).send('404 | Page Not Found');
                } else {
                    console.error(`error during render : ${req.url}`);
                    console.error(err.stack);
                    return res.status(500).send('500 | Internal Server Error');
                }
            }
            
            if (!self.isProd) console.log(`whole request: ${Date.now() - s}ms`);
            
            return res.send(html);
        });
    }
}
