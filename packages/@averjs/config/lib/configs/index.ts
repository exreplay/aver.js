import app from './app';
import core from './core';
import server from './server';
import renderer from './renderer';
import vueApp from './vue-app';

export const defaultFileName = 'aver-config';

export function defaultAverjsConfig() {
  return {
    ...app(),
    ...core(),
    ...server(),
    webpack: renderer(),
    ...vueApp()
  };
}
