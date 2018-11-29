export default class Hooks {
    constructor() {
        this.middlewares = [];
        this.serverMiddleware = [];
    }

    registerMiddleware(hook) {
        this.middlewares.push(hook);
    }

    registerServerMiddleware(hook) {
        this.serverMiddleware.push(hook);
    }
}