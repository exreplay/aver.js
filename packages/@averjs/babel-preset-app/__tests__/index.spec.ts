import * as babel from '@babel/core';
import preset from '../lib/index';
import merge from 'lodash/merge';

function transformFactory(
  codeToTransform: string,
  options?: babel.TransformOptions
) {
  const defaultOptions = {
    babelrc: false,
    presets: [[preset, { buildTarget: 'client', corejs: 2 }]],
    filename: 'test-entry-file.js'
  };

  return (
    babel.transformSync(codeToTransform, merge(defaultOptions, options)) || {}
  );
}

test('polyfill detection for core-js', async () => {
  let { code } = transformFactory('const a = new Map()', {
    presets: [[preset, { buildTarget: 'server' }]]
  });

  await expect(code).toMatch('runtime-corejs2/core-js/map');

  ({ code } = transformFactory('const a = new Map()'.trim()));

  await expect(code).toMatch('runtime-corejs2/core-js/map');
  await expect(code).toMatch('es6.promise');
  await expect(code).toMatch('es6.array.iterator');
});

test('dynamic import', () => {
  expect(() => {
    transformFactory("const test = () => import('test.vue');");
  }).not.toThrow();
});

test('rest spread should use assign polyfill', async () => {
  const { code } = transformFactory('const a = { ...b };');
  await expect(code).toMatch('@babel/runtime-corejs2/core-js/object/assign');
});

test('regenerator runtime should be included on client', async () => {
  const { code } = transformFactory(
    `
    async function test() {
      await Promise.resolve();
    }
    test();
  `.trim()
  );

  await expect(code).toMatch('es6.promise');
  await expect(code).toMatch('regenerator-runtime/runtime');
});

test('decorators should create a _class var', async () => {
  const { code } = transformFactory(`
    function test() {}
    @test class decoratedClass {}
  `);

  await expect(code).toMatch('var _class;');
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
