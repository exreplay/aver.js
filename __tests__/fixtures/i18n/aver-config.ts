import path from 'path';

export default {
  rootDir: __dirname,
  cacheDir: path.resolve(__dirname, './node_modules/.cache/averjs'),
  distPath: path.resolve(__dirname, './dist'),
  i18n: {
    locale: 'en'
  }
};
