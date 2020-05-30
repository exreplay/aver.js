import path from 'path';
import mergeWith from 'lodash/mergeWith';
import { defaultAverjsConfig, defaultFileName } from './configs';

export function getAverjsConfig() {
  const requireModule = require('esm')(module);
  const globalConfPath = path.resolve(process.env.PROJECT_PATH, `../${defaultFileName}`);
  const config = defaultAverjsConfig();
  let userConfig = {};
  let configFile = null;

  try {
    configFile = require.resolve(globalConfPath);
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') throw err;
    else console.log('Could not find aver-config file. Proceeding with default config...');
  }

  if (configFile) {
    if (process.env.NODE_ENV === 'test') userConfig = require(configFile).default;
    else userConfig = requireModule(configFile).default;
  }

  config.rootDir = process.cwd();

  config.cacheDir = path.resolve(config.rootDir, './node_modules/.cache/averjs');

  config.distDir = './dist';
  config.distPath = path.resolve(config.rootDir, config.distDir);

  return mergeWith(config, userConfig, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
}
