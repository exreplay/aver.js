import { rebuild, testFeature } from '../utils/feature';
import fs from 'fs-extra';
import path from 'path';

testFeature(
  'babel-loader',
  () => {
    test('should transpile given deps correctly', async () => {
      await page.goto('http://localhost:3000');
      const content = await page.content();

      expect(content).toContain(
        '<div id="app"><span>test</span><span>another test</span><div>should be compiled</div></div>'
      );
    });

    test('should transpile deps with regex correctly', async () => {
      await rebuild({
        webpack: {
          transpileDependencies: [/package-to-transpile/]
        }
      });

      await page.goto('http://localhost:3000');
      const content = await page.content();

      expect(content).toContain(
        '<div id="app"><span>test</span><span>another test</span><div>should be compiled</div></div>'
      );
    });

    test('should ignore non string and non regex', async () => {
      await rebuild({
        webpack: {
          transpileDependencies: [
            /package-to-transpile/,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            () => {}
          ]
        }
      });

      await page.goto('http://localhost:3000');
      const content = await page.content();

      expect(content).toContain(
        '<div id="app"><span>test</span><span>another test</span><div>should be compiled</div></div>'
      );
    });

    test('should throw error when the package is missing in the transpileDependencies array', async () => {
      try {
        await rebuild({
          webpack: {
            transpileDependencies: []
          }
        });
      } catch (error) {
        expect(error).toContain("SyntaxError: Unexpected token 'export'");
      }
    });

    test('should fallback to empty array', async () => {
      try {
        await rebuild({
          webpack: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            transpileDependencies: null
          }
        });
      } catch (error) {
        expect(error).toContain("SyntaxError: Unexpected token 'export'");
      }
    });

    test('should call the babel function correctly', async () => {
      const babel = jest.fn();
      await rebuild({
        webpack: {
          babel
        }
      });
      expect(babel.mock.calls.length).toBe(2);
      expect(babel.mock.calls[0]).toEqual(
        expect.arrayContaining([{ isServer: false }, { buildTarget: 'client' }])
      );
      expect(babel.mock.calls[1]).toEqual(
        expect.arrayContaining([{ isServer: true }, { buildTarget: 'server' }])
      );
    });
  },
  {},
  currentDir => {
    beforeAll(() => {
      fs.copySync(
        path.resolve(currentDir, './package-to-transpile'),
        path.resolve(process.cwd(), './node_modules/package-to-transpile')
      );
    });
    afterAll(() => {
      fs.removeSync(
        path.resolve(process.cwd(), './node_modules/package-to-transpile')
      );
    });
  }
);
