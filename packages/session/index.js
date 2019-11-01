import Session from './src';
export default function() {
  this.aver.tap('server:after-register-middlewares', ({ app, middlewares }) => {
    if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
    middlewares.push(new Session(this.aver.config));
  });
};
