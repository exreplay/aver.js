import app from './app';
import core from './core';
import server from './server';
import renderer from './renderer';

export const defaultFileName = 'aver-config.js';

export function defaultAverjsConfig() {
  return {
    ...app(),
    ...core(),
    ...server(),
    webpack: renderer()
  };
};
