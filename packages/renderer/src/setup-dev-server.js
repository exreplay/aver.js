import webpack from 'webpack';
import path from 'path';
import MFS from 'memory-fs';
import Builder from './builder';
import { openBrowser } from '@averjs/shared-utils';

export default class WebpackDevServer {
  constructor(app, cb) {
    this.app = app;
    const builder = new Builder();

    this.clientConfig = builder.clientConfig;
    this.serverConfig = builder.serverConfig;

    this.isBrowserOpen = false;
    this.bundle = null;
    this.clientManifest = null;
    this.template = null;
    this.resolve = null;
    this.readyPromise = new Promise(resolve => { this.resolve = resolve; });
    this.update = () => {
      if (this.bundle && this.clientManifest && this.template) {
        this.resolve();
        cb(this.bundle, {
          clientManifest: this.clientManifest,
          template: this.template
        });
      }
    };

    this.setupClientCompiler();
    this.setupServerCompiler();

    return this.readyPromise;
  }

  setupClientCompiler() {
    this.clientConfig.entry.app = ['webpack-hot-middleware/client?name=client&reload=true&timeout=30000/__webpack_hmr', this.clientConfig.entry.app];
    this.clientConfig.output.filename = '[name].js';
    this.clientConfig.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    );
    
    const clientCompiler = webpack(this.clientConfig);
    const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
      publicPath: this.clientConfig.output.publicPath,
      stats: false,
      logLevel: 'silent'
    });
    this.app.use(devMiddleware);
    clientCompiler.plugin('done', stats => {
      stats = stats.toJson();
      stats.errors.forEach(err => console.error(err));
      stats.warnings.forEach(err => console.warn(err));
      if (stats.errors.length) return;
    
      this.clientManifest = JSON.parse(this.readFile(devMiddleware.fileSystem, 'vue-ssr-client-manifest.json'));
      this.template = this.readFile(devMiddleware.fileSystem, 'index.ssr.html');
      this.update();

      if (!this.isBrowserOpen) {
        this.isBrowserOpen = true;
        
        let port = process.env.PORT || 3000;
        port = port !== 80 ? `:${port}` : '';
        
        openBrowser(`http://localhost${port}`);
      }
    });
    
    this.app.use(require('webpack-hot-middleware')(clientCompiler, {
      log: false,
      heartbeat: 10000
    }));
  }

  setupServerCompiler() {
    const serverCompiler = webpack(this.serverConfig);
    const mfs = new MFS();
    serverCompiler.outputFileSystem = mfs;
    serverCompiler.watch({}, (err, stats) => {
      if (err) throw err;
      stats = stats.toJson();
      if (stats.errors.length) return;
            
      this.bundle = JSON.parse(this.readFile(mfs, 'vue-ssr-server-bundle.json'));
      this.update();
    });
  }

  readFile(fs, file) {
    try {
      return fs.readFileSync(path.join(this.clientConfig.output.path, file), 'utf-8');
    } catch (e) { console.log(e); }
  }
}
