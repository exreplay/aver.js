import Server   from './server';

export default class Core {
    run(hooks) {
        const server = new Server(hooks);
    }
    
    build() {
        const Builder = require('vue-ssr-renderer').default;
        const builder = new Builder();
        return builder.compile();
    }
}
