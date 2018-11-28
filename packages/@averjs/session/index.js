import Session from './src';
export default ({ config, hooks }) => {
    new Session(config);

    if (process.env.NODE_ENV === 'production') {
        hooks.registerMiddleware(({app}) => {
            app.set('trust proxy', 1);
        })
    }
}