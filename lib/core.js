import Server   from './server';
import WWW      from './www';

export default class Core {
    run(hooks) {
        const server = new Server(hooks);
        const www = new WWW(server.app);
        www.startServer();
    }
    
    build() {
        const Builder = require('vue-ssr-renderer').default;
        const builder = new Builder();
        return builder.compile();
    }
}
