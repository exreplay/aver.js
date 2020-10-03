import path from 'path';
import mergeWith from 'lodash/mergeWith';
import { defaultAverjsConfig, defaultFileName } from './configs';

interface InternalConfig {
  rootDir: string;
  cacheDir: string;
  distPath: string;
  distDir: string;
  _production: boolean;
}

export type AverConfig = ReturnType<typeof defaultAverjsConfig> & { [index: string]: any };
type AverInternalConfig = AverConfig & InternalConfig;
type AverConfigPartial = AverConfig & Partial<InternalConfig>;

export function getAverjsConfig(): AverInternalConfig {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const requireModule = require('esm')(module);
  const globalConfPath = path.resolve(process.env.PROJECT_PATH, `../${defaultFileName}`);
  const config: AverConfigPartial = defaultAverjsConfig();
  let userConfig = {};
  let configFile = null;

  try {
    configFile = require.resolve(globalConfPath);
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') throw err;
    else console.log('Could not find aver-config file. Proceeding with default config...');
  }

  if (configFile) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    if (process.env.NODE_ENV === 'test') userConfig = require(configFile).default;
    else userConfig = requireModule(configFile).default;
  }

  config.rootDir = process.cwd();

  config.cacheDir = path.resolve(config.rootDir, './node_modules/.cache/averjs');

  config.distDir = './dist';
  config.distPath = path.resolve(config.rootDir, config.distDir);

  return mergeWith(config as AverInternalConfig, userConfig, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
}
