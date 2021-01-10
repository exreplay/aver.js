import { PluginObj } from '@babel/core';
import { BabelOptions } from '.';

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
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { createImport } = require('@babel/preset-env/lib/utils');
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
