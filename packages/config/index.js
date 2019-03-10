import { defaultAverjsConfig } from './configs';

export function getAverjsConfig(userConfig) {
  return Object.assign(defaultAverjsConfig(), userConfig);
}

export { defaultFileName } from './configs'; 
