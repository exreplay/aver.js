import { defaultAverjsConfig } from './configs';
import merge from 'lodash/merge';

export function getAverjsConfig(userConfig) {
  return merge(defaultAverjsConfig(), userConfig);
}

export { defaultFileName } from './configs';
