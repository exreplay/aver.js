import fs from 'fs';
import path from 'path';
import merge from 'lodash/merge';
import { defaultAverjsConfig, defaultFileName } from './configs';

export function getAverjsConfig() {
  const globalConfPath = path.resolve(process.env.PROJECT_PATH, `../${defaultFileName}`);
  let userConfig = {};

  if (fs.existsSync(globalConfPath)) userConfig = require(globalConfPath).default;

  return merge(defaultAverjsConfig(), userConfig);
}
