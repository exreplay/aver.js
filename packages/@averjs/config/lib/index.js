import fs from 'fs';
import path from 'path';
import merge from 'lodash/merge';
import { defaultAverjsConfig, defaultFileName } from './configs';

export function getAverjsConfig() {
  const requireModule = require('esm')(module);
  const globalConfPath = path.resolve(process.env.PROJECT_PATH, `../${defaultFileName}`);
  const config = defaultAverjsConfig();
  let userConfig = {};

  if (fs.existsSync(globalConfPath)) userConfig = requireModule(globalConfPath).default;

  config.rootDir = process.cwd();

  config.cacheDir = path.resolve(config.rootDir, './node_modules/.cache/averjs');

  return merge(config, userConfig);
}
