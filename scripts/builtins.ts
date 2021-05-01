/**
 * Logic from https://github.com/sindresorhus/builtin-modules/blob/master/index.js
 */

import { builtinModules } from 'module';

const blacklist = ['sys'];

export default builtinModules
  .filter(
    (x) =>
      !/^_|^(internal|v8|node-inspect)\/|\//.test(x) && !blacklist.includes(x)
  )
  .sort();
