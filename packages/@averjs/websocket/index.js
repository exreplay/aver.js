import Websocket from './src';
export default ({ config, hooks }) => {
  hooks.registerMiddleware(({ middlewares, server }) => {
    const ws = new Websocket(server);

    middlewares.push((req, res, next) => {
      req.io = ws.io;
      next();
    });
  });
};
