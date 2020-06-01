import * as babel from '@babel/core';
import preset from '../lib/index';
import merge from 'lodash/merge';

function transformFactory(codeToTransform, options) {
  const defaultOptions = {
    babelrc: false,
    presets: [
      [ preset, { buildTarget: 'client', corejs: 2 } ]
    ],
    filename: 'test-entry-file.js'
  };

  return babel.transformSync(codeToTransform, merge(defaultOptions, options));
}

test('polyfill detection for core-js', () => {
  let { code } = transformFactory('const a = new Map()', {
    presets: [
      [ preset, { buildTarget: 'server' } ]
    ]
  });

  expect(code).toMatch('runtime-corejs2/core-js/map');

  ;({ code } = transformFactory('const a = new Map()'.trim()));

  expect(code).toMatch('runtime-corejs2/core-js/map');
  expect(code).toMatch('es6.promise');
  expect(code).toMatch('es6.array.iterator');
});

test('dynamic import', () => {
  expect(() => {
    transformFactory('const test = () => import(\'test.vue\');');
  }).not.toThrow();
});

test('rest spread should use assign polyfill', () => {
  const { code } = transformFactory('const a = { ...b };');
  expect(code).toMatch('@babel/runtime-corejs2/core-js/object/assign');
});

test('regenerator runtime should be included on client', () => {
  const { code } = transformFactory(`
    async function test() {
      await Promise.resolve();
    }
    test();
  `.trim());

  expect(code).toMatch('es6.promise');
  expect(code).toMatch('regenerator-runtime/runtime');
});

test('decorators should create a _class var', () => {
  const { code } = transformFactory(`
    function test() {}
    @test class decoratedClass {}
  `);

  expect(code).toMatch('var _class;');
});

test('class properties should not throw', () => {
  expect(() => {
    transformFactory(`
      class decoratedClass {
        test = '';
      }
    `);
  }).not.toThrow();
});
