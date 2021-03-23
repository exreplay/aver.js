import * as babel from '@babel/core';
import preset from '../lib/index';
import merge from 'lodash/merge';

function transformFactory(
  codeToTransform: string,
  options?: babel.TransformOptions,
  noCorejs = false
) {
  const defaultOptions = {
    babelrc: false,
    presets: [
      [preset, { buildTarget: 'client', ...(noCorejs ? {} : { corejs: 2 }) }]
    ],
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

  await expect(code).toMatch('var a = new Map();');

  ({ code } = transformFactory('const a = new Map()'.trim()));

  await expect(code).toMatch('core-js/modules/es6.map.js');
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
  await expect(code).toMatch('core-js/modules/es6.object.assign.js');
});

test('regenerator runtime should be included on client', async () => {
  const { code } = transformFactory(
    `
    async function test() {
      await Promise.resolve();
    }
    test();
  `.trim(),
    {
      presets: [[preset, { buildTarget: 'client', corejs: { version: 2 } }]]
    }
  );

  await expect(code).toMatch('es6.promise');
  await expect(code).toMatch('@babel/runtime/regenerator');
});

test('decorators should create a _class var', async () => {
  const { code } = transformFactory(
    `
    function test() {}
    @test class decoratedClass {}
  `,
    {},
    true
  );

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
