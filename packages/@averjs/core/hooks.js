export default class Hooks {
    constructor() {
        this.middlewares = [];
    }

    registerMiddleware(hook) {
        this.middlewares.push(hook);
    }
}