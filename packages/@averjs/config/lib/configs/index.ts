import app, { AverAppConfig } from './app';
import core, { AverCoreConfig } from './core';
import server, { AverServerConfig } from './server';
import renderer, { AverWebpackConfig } from './renderer';
import vueApp from './vue-app';

export const defaultFileName = 'aver-config';

export function defaultAverjsConfig() {
  return {
    ...app() as AverAppConfig,
    ...core() as AverCoreConfig,
    ...server() as AverServerConfig,
    webpack: renderer() as AverWebpackConfig,
    ...vueApp(),
  };
}
