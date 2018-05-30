import express                  from 'express';
import WWW                      from './www';
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
import dotenv                   from 'dotenv';
import microcache               from 'route-cache';
import rfs                      from 'rotating-file-stream';
import uuid                     from 'uuid/v4';
import _                        from 'lodash';

export default class Server {
    constructor(hooks) {
        this.hooks = hooks;
        this.app = express();
        this.csrfProtection = csrf({ cookie: true });
        this.renderer = null;
        this.readyPromise = null;
        this.isProd = process.env.NODE_ENV === 'production';
        
        if (fs.existsSync(path.resolve(process.env.PROJECT_PATH, '../.env'))) {
            dotenv.config();
            if (dotenv.error) {
                throw dotenv.error;
            }
        } else {
            console.warn("In order to use dotenv, please create a '.env' file in your project root.");
        }
        
        this.www = new WWW(this.app);

        fs.existsSync(path.join(process.env.PROJECT_PATH, '../storage')) || fs.mkdirSync(path.join(process.env.PROJECT_PATH, '../storage'))
        
        this.initRenderer();
        this.registerMiddlewares();
        this.registerRoutes();

        this.app.use((err, req, res, next) => {
            if (!this.isProd) console.error(err.stack);
            req.error = err.stack;
            res.status(err.status || 500).json({
                success: false,
                errorId: req.id
            });
        });
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
            const WebpackDevServer = require(path.resolve(require.resolve('vue-ssr-renderer'), '../webpack/setup-dev-server')).default;
            this.readyPromise = new WebpackDevServer(this.app, (bundle, options) => {
                self.renderer = self.createRenderer(bundle, Object.assign(bundle, options));
            });
        }
    }
    
    createRenderer(bundle, options) {
        const bundleOptions = {
            cache: LRU({
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
        
        this.app.use(helmet());
        this.logging();
        this.app.use(cookieParser());
        this.app.use(compression({ threshold: 0 }));
        
        this.app.use('/dist', serve('./dist', true));
        this.app.use('/public', serve('./public', true));
        this.app.use('/static', serve('./static', true));
        this.app.use('/storage', express.static('./storage'));
        
        this.app.get('/favicon.ico', function(req, res) {
            res.sendStatus(204);
        });
        
        this.app.use((req, res, next) => {
            req.io = this.www.io;
            next();
        });

        if (typeof this.hooks.registerRoutes === 'function') this.hooks.registerRoutes(this.app);

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(csrf({ cookie: true }));
        
        this.app.use(microcache.cacheSeconds(1, req => req.originalUrl))
        
        if (typeof this.hooks.registerMiddlewares === 'function') this.hooks.registerMiddlewares(this.app);
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

        this.app.use((req, res, next) => {
            req.id = (new Date().getTime()) + '-' + uuid();
            next();
        });

        this.app.use(logger(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"\\n:error', {
            skip: function (req, res) {
                return res.statusCode < 400
            },
            stream: errorLogStream
        }));

        this.app.use(logger(':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
            skip: function (req, res) {
                return res.statusCode > 400
            },
            stream: accessLogStream
        }));
    }
    
    registerRoutes() {
        const self = this;

        this.app.get('/service-worker.js', (req, res, next) => {
            try {
                const sw = fs.readFileSync(path.resolve(process.env.PROJECT_PATH, '../dist/service-worker.js'));
                res.set({ 'Content-Type': 'application/javascript; charset=UTF-8' });
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
            csrfToken: req.csrfToken()
        };

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
