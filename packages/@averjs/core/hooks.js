export default class Hooks {
    constructor() {
        this.routes = [];
        this.middlewares = [];
        this.serverMiddleware = [];
    }

    registerRoutes(hook) {
        this.routes.push(hook);
    }

    registerMiddleware(hook) {
        this.middlewares.push(hook);
    }

    registerServerMiddleware(hook) {
        this.serverMiddleware.push(hook);
    }
}