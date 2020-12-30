import { rebuild, testFeature } from '../utils/feature';
import fs from 'fs-extra';
import path from 'path';

testFeature(
  'transpile-deps',
  () => {
    test('should transpile given deps correctly', async () => {
      await page.goto('http://localhost:3000');
      const content = await page.content();

      expect(content).toContain(
        '<div id="app"><span>test</span><span>another test</span></div>'
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
        '<div id="app"><span>test</span><span>another test</span></div>'
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
        '<div id="app"><span>test</span><span>another test</span></div>'
      );
    });
  },
  { showConsoleLogs: true, keepDist: true },
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
