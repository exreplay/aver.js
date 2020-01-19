import fs from 'fs';
import path from 'path';
import merge from 'lodash/merge';
import { defaultAverjsConfig, defaultFileName } from './configs';

export function getAverjsConfig() {
  const requireModule = require('esm')(module);
  const globalConfPath = path.resolve(process.env.PROJECT_PATH, `../${defaultFileName}`);
  const defaultConfig = defaultAverjsConfig();
  let userConfig = {};

  if (fs.existsSync(globalConfPath)) userConfig = requireModule(globalConfPath).default;

  defaultConfig.cacheDir = path.resolve('node_modules/.cache/averjs');

  return merge(defaultConfig, userConfig);
}
