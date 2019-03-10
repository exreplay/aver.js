export default class Hooks {
    constructor() {
        this.routes = [];
        this.middlewares = [];
    }

    registerRoutes(hook) {
        this.routes.push(hook);
    }

    registerMiddleware(hook) {
        this.middlewares.push(hook);
    }
}