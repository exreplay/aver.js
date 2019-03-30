import Session from './src';
export default ({ config, hooks }) => {
  hooks.registerMiddleware(({ app, middlewares }) => {
    if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

    middlewares.push(new Session(config));
  });
};
