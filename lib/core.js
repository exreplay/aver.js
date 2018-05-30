import Server   from './server';

export default class Core {
    run(hooks) {
        this.loadGlobalConfig();
        const server = new Server(hooks, this.globalConfig);
    }
    
    build() {
        const Builder = require('vue-ssr-renderer').default;
        const builder = new Builder();
        return builder.compile();
    }

    loadGlobalConfig() {
        const globalConfPath = path.resolve(process.env.PROJECT_PATH, 'vue-ssr-config.js');
        if (fs.existsSync(globalConfPath)) {
            this.globalConfig = require(globalConfPath).default.webpack;
        }
    }
}
