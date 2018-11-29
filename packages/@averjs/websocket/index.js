import Websocket from './src';
export default ({ config, hooks }) => {
    hooks.registerServerMiddleware((server) => {
        new Websocket(server);
    });
}