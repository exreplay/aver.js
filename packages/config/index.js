import { defaultFileName, defaultAverjsConfig } from './configs';

export default function getAverjsConfig(useFs = true) {
  let config = defaultAverjsConfig();
  let userConf = {};

  if(useFs) {
    const fs = require('fs');
    const path = require('path');

    const globalConfPath = path.resolve(process.env.PROJECT_PATH, `../${defaultFileName}`);
    if (fs.existsSync(globalConfPath))  userConf = require(globalConfPath).default;
  } else {
    userConf = require(`@/../${defaultFileName}`);
  }

  config = Object.assign(config, userConf);

  return config;
}
