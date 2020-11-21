import path from 'path';
import mergeWith from 'lodash/mergeWith';
import { defaultAverjsConfig, defaultFileName } from './configs';
import esm from 'esm';

interface InternalConfig {
  rootDir?: string;
  cacheDir?: string;
  distPath?: string;
  distDir?: string;
  _production?: boolean;
}

export type AverConfig = ReturnType<typeof defaultAverjsConfig> &
  InternalConfig & { [index: string]: any };

export function getAverjsConfig() {
  const requireModule = esm(module);

  const globalConfPath = path.resolve(
    process.env.PROJECT_PATH,
    `../${defaultFileName}`
  );
  const config: AverConfig = defaultAverjsConfig();
  let userConfig: AverConfig = {};
  let configFile = null;

  try {
    configFile = require.resolve(globalConfPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND')
      throw error;
    else
      console.log(
        'Could not find aver-config file. Proceeding with default config...'
      );
  }

  if (configFile) {
    if (process.env.NODE_ENV === 'test')
      ({ default: userConfig } = require(configFile));
    else userConfig = requireModule(configFile).default;
  }

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
