import { TargetsOptions } from '@babel/preset-env';
import { BabelOptions } from '.';
import getTargets, { isRequired } from '@babel/helper-compilation-targets';

export default class Polyfills {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultPolyfills: {
    [index: number]: { builtIns: string; polyfills: string[] };
  } = {
    2: {
      builtIns: require.resolve('@babel/compat-data/corejs2-built-ins'),
      polyfills: [
        'es6.array.iterator',
        'es6.promise',
        'es6.object.assign',
        'es7.promise.finally'
      ]
    },
    3: {
      builtIns: require.resolve('core-js-compat/data'),
      polyfills: [
        'es.array.iterator',
        'es.promise',
        'es.object.assign',
        'es.promise.finally'
      ]
    }
  };

  getDefaultPolyfills(corejs: number) {
    return this.defaultPolyfills[corejs].polyfills;
  }

  getPolyfills(
    corejs: number,
    targets: TargetsOptions,
    includes: string[],
    options: BabelOptions
  ) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const builtInsList = require(this.defaultPolyfills[corejs].builtIns);
    const builtInTargets = getTargets(targets, options);

    return includes.filter((item) =>
      isRequired('aver-polyfills', builtInTargets, {
        compatData: {
          'aver-polyfills': builtInsList[item]
        }
      })
    );
  }
}
