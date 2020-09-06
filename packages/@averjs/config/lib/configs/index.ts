import app from './app';
import core from './core';
import server from './server';
import renderer from './renderer';
import vueApp from './vue-app';

export const defaultFileName = 'aver-config';

export function defaultAverjsConfig() {
  return {
    ...app() as ReturnType<typeof app>,
    ...core() as ReturnType<typeof core>,
    ...server() as ReturnType<typeof server>,
    webpack: renderer() as ReturnType<typeof renderer>,
    ...vueApp() as ReturnType<typeof vueApp>
  };
}
