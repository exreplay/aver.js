/**
 * There is a problem with core-js when different versions are installed by different packages.
 * Therefore it is necessary to construct an absolute path.
 * Basically this is the same functionality like babel provides but slightly modified with a require.resolve.
 */
const { addSideEffect } = require('@babel/helper-module-imports');
const { getModulePath: _getModulePath } = require('@babel/preset-env/lib/utils');

function getModulePath(mod, useAbsolutePath) {
  const path = _getModulePath(mod);
  return useAbsolutePath ? require.resolve(path) : path;
}

function createImport(path, mod, useAbsolutePath) {
  return addSideEffect(path, getModulePath(mod, useAbsolutePath));
}

// add polyfill imports to the first file encountered.
module.exports = ({ types }, { polyfills, useAbsolutePath }) => {
  let entryFile;
  return {
    name: 'inject-polyfills',
    visitor: {
      Program(path, state) {
        if (!entryFile) {
          entryFile = state.filename;
        } else if (state.filename !== entryFile) {
          return;
        }

        // imports are injected in reverse order
        polyfills.slice().reverse().forEach(p => {
          createImport(path, p, useAbsolutePath);
        });
      }
    }
  };
};
