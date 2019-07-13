import * as babel from '@babel/core';
import preset from '../lib/index';

const defaultOptions = {
  babelrc: false,
  presets: [
    [ preset, { buildTarget: 'client' } ]
  ],
  filename: 'test-entry-file.js'
};

test('polyfill detection', () => {
  let { code } = babel.transformSync(`const a = new Map()`.trim(), {
    ...defaultOptions,
    ...{
      presets: [
        [ preset, { buildTarget: 'server' } ]
      ]
    }
  });

  expect(code).not.toMatch('es.map');

  ;({ code } = babel.transformSync(`const a = new Map()`.trim(), defaultOptions));

  expect(code).toMatch('es.map');
  expect(code).toMatch('es.promise');
  expect(code).toMatch('es.array.iterator');
});

test('dynamic import', () => {
  expect(() => {
    babel.transformSync(`const test = () => import('test.vue');`.trim(), defaultOptions);
  }).not.toThrow();
});

test('regenerator runtime should be included on client', () => {
  let { code } = babel.transformSync(`
    async function test() {
      await Promise.resolve();
    }
    test();
  `.trim(), defaultOptions);

  expect(code).toMatch('es.promise');
  expect(code).toMatch('regenerator-runtime/runtime');
});

test('decorators should create a _class var', () => {
  let { code } = babel.transformSync(`
    function test() {}
    @test class decoratedClass {}
  `, defaultOptions);

  expect(code).toMatch('var _class;');
});

test('class properties should not throw', () => {
  expect(() => {
    babel.transformSync(`
      class decoratedClass {
        test = '';
      }
    `, defaultOptions);
  }).not.toThrow();
});
