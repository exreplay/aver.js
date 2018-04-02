import Server   from './server';
import Builder  from '../webpack/builder';

export default class Core {
    run() {
        this.server = new Server();
    }
    
    build() {
        const builder = new Builder();
        return builder.compile();
    }
}
