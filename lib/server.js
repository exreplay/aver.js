import express from 'express';
import LRU from 'lru-cache';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { createBundleRenderer } from 'vue-server-renderer';
import helmet from 'helmet';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import bodyParser from 'body-parser';
import WWW from './www';

export default class Server {
    constructor() {
        this.app = express();
        this.csrfProtection = csrf({ cookie: true });
        this.renderer = null;
        this.readyPromise = null;
        this.isProd = process.env.NODE_ENV === 'production';
        
        if(fs.existsSync(path.resolve(process.env.PROJECT_PATH, '../.env'))) {
            dotenv.config();
            if (dotenv.error) {
                throw dotenv.error;
            }
        } else {
            console.warn("In order to use dotenv, please create a '.env' file in your project root.")
        }
        
        this.initRenderer();
        this.registerMiddlewares();
        this.registerRoutes();
        
        const www = new WWW(this.app);
        www.startServer();
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
            this.readyPromise = require('../webpack/setup-dev-server')(this.app, (bundle, options) => {
                self.renderer = self.createRenderer(bundle, Object.assign(bundle, options));
            });
        }
    }
    
    createRenderer(bundle, options) {
        return createBundleRenderer(bundle, Object.assign(options, {
            cache: LRU({
                max: 1000,
                maxAge: 1000 * 60 * 15
            }),
            runInNewContext: false,
            template: fs.readFileSync(path.join(__dirname, './vue/index.template.html'), 'utf-8')
        }));
    }
    
    registerMiddlewares() {
        this.app.use(helmet());
        this.app.use(this.isProd ? logger('combined') : logger('dev'));
        this.app.use(cookieParser());
        this.app.use(compression({ threshold: 0 }));
        this.app.use('/dist', express.static('./dist'));
        this.app.use('/public', express.static('./public'));
        this.app.use('/storage', express.static('./storage'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(csrf({ cookie: true }));
    }
    
    registerRoutes() {
        const self = this;
        
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
