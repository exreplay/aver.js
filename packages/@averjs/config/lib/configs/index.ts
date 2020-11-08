import app from './app';
import core from './core';
import server from './server';
import renderer from './renderer';
import vueApp from './vue-app';

export const defaultFileName = 'aver-config';

type AverConfig = ReturnType<typeof app> & ReturnType<typeof core> & ReturnType<typeof server> & ReturnType<typeof vueApp> & {
  webpack: ReturnType<typeof renderer>
}

export function defaultAverjsConfig(isProd: boolean): AverConfig {
  return {
    ...app(),
    ...core(),
    ...server(),
    webpack: renderer(isProd),
    ...vueApp()
  };
}
