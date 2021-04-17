import { NodePath, PluginObj } from '@babel/core';
import { Program } from '@babel/types';
import { BabelOptions } from '.';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { addSideEffect } = require('@babel/helper-module-imports');

function getModulePath(mod: string) {
  const modPath =
    mod === 'regenerator-runtime'
      ? 'regenerator-runtime/runtime'
      : `core-js/modules/${mod}`;
  return modPath;
}

function createImport(path: NodePath<Program>, mod: string) {
  return addSideEffect(path, getModulePath(mod));
}

// add polyfill imports to the first file encountered.
export default function (): PluginObj {
  let entryFile: string | undefined;

  return {
    name: 'inject-polyfills',
    visitor: {
      Program(path, state) {
        if (!entryFile) {
          entryFile = state.filename;
        } else if (state.filename !== entryFile) {
          return;
        }

        const { polyfills } = state.opts as BabelOptions;
        // imports are injected in reverse order
        polyfills
          ?.slice()
          .reverse()
          .forEach((p) => {
            createImport(path, p);
          });
      }
    }
  };
}
