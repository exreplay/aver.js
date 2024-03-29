/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import mergeWith from 'lodash/mergeWith';
import { defaultAverjsConfig, defaultFileName } from './configs';
export { AverAppConfig } from './configs/app';
export { AverCoreConfig } from './configs/core';
export { AverWebpackConfig } from './configs/renderer';
export { AverServerConfig } from './configs/server';
export { AverVueAppConfig } from './configs/vue-app';

interface InternalConfig {
  rootDir: string;
  cacheDir: string;
  distPath: string;
  distDir: string;
  isProd: boolean;
  _production: boolean;
}

type Config = ReturnType<typeof defaultAverjsConfig> &
  InternalConfig & { [index: string]: any };

export type InternalAverConfig = Config;

export type AverConfig = Partial<Config>;

export function getAverjsConfig(): InternalAverConfig {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const requireModule = require('esm')(module);
  const globalConfPath = path.resolve(
    process.env.PROJECT_PATH,
    `../${defaultFileName}`
  );
  const isProd =
    process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test';
  const config = defaultAverjsConfig(isProd) as InternalAverConfig;
  let userConfig = {};
  let configFile = null;

  try {
    configFile = require.resolve(globalConfPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND')
      /* istanbul ignore next */ throw error;
    else
      console.log(
        'Could not find aver-config file. Proceeding with default config...'
      );
  }

  if (configFile) {
    if (process.env.NODE_ENV === 'test')
      userConfig = require(configFile).default;
    /* istanbul ignore next */ else
      userConfig = requireModule(configFile).default;
  }

  config.isProd = isProd;

  config.rootDir = process.cwd();

  config.cacheDir = path.resolve(
    config.rootDir,
    './node_modules/.cache/averjs'
  );

  config.distDir = './dist';
  config.distPath = path.resolve(config.rootDir, config.distDir);

  return mergeWith(config, userConfig, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
}
