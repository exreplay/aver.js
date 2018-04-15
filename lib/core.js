import Server   from './server';
import WWW      from './www';
export default class Core {
    constructor(hooks) {
        this.server = new Server(hooks);
    }

    run() {
        const www = new WWW(this.server.app);
        www.startServer();
    }
    
    build() {
        const Builder = require('vue-ssr-renderer').default;
        const builder = new Builder();
        return builder.compile();
    }
}
