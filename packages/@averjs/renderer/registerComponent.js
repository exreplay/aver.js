'use strict';
exports.__esModule = true;
const hash_sum_1 = require('hash-sum');
const IS_SETUP_RE = /export function setup/;
function loader(source) {
  const resourcePath = this.resourcePath;
  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
  const _a = (source.match(/(?<=export.*)\r?\n/) || {}).index;
  const index = _a === void 0 ? 0 : _a;
  const id = hash_sum_1.default(resourcePath);
  const isSetup = IS_SETUP_RE.test(source);
  const code = isSetup
    ? 'const ctx = useSSRContext();\n        ctx._registeredComponents.push(' +
      JSON.stringify(id) +
      ');'
    : ' beforeCreate: function() {\n          const ctx = useSSRContext();\n          ctx._registeredComponents.push(' +
      JSON.stringify(id) +
      ')\n        },';
  return (
    'import { useSSRContext } from "vue";\n' +
    [source.slice(0, index + 1), code, source.slice(index + 1)].join(' ')
  );
}
exports.default = loader;
