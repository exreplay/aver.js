import Server   from './server';

export default class Core {
    run() {
        this.server = new Server();
    }
    
    build() {
        const Builder = require('../webpack/builder').default;
        const builder = new Builder();
        return builder.compile();
    }
}
