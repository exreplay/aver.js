import PolyfillsClass from '../lib/polyfills';
const polyfillsClass = new PolyfillsClass();

test('getDefaultPolyfills should return the correct polyfills by core-js version', () => {
  let polyfills = polyfillsClass.getDefaultPolyfills(2);

  expect(polyfills).toEqual([
    'es6.array.iterator',
    'es6.promise',
    'es6.object.assign',
    'es7.promise.finally'
  ]);

  polyfills = polyfillsClass.getDefaultPolyfills(3);

  expect(polyfills).toEqual([
    'es.array.iterator',
    'es.promise',
    'es.object.assign',
    'es.promise.finally'
  ]);
});

test('getPolyfills should return the correct polyfills by core-js version', () => {
  let polyfills = polyfillsClass.getPolyfills(
    2,
    {
      browsers: ['IE >= 9']
    },
    polyfillsClass.getDefaultPolyfills(2),
    {
      ignoreBrowserslistConfig: false,
      configPath: ''
    }
  );

  expect(polyfills).toEqual([
    'es6.array.iterator',
    'es6.promise',
    'es6.object.assign',
    'es7.promise.finally'
  ]);

  polyfills = polyfillsClass.getPolyfills(
    3,
    {
      browsers: ['IE >= 9']
    },
    polyfillsClass.getDefaultPolyfills(3),
    {
      ignoreBrowserslistConfig: false,
      configPath: ''
    }
  );

  expect(polyfills).toEqual([
    'es.array.iterator',
    'es.promise',
    'es.object.assign',
    'es.promise.finally'
  ]);
});
