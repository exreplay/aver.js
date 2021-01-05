import { rebuild, testFeature } from '../utils/feature';
import fs from 'fs';
import path from 'path';

testFeature('css-extract', currentDir => {
  test('should have compiled css inlined', async () => {
    await page.goto('http://localhost:3000');
    const content = await page.content();
    expect(content).toContain('<style type="text/css">h1{color:#00f}</style>');
    expect(content).toContain(
      '<style type="text/css">.test{color:red}</style>'
    );
  });

  test('should have extracted css file', async () => {
    await rebuild({
      webpack: {
        css: {
          extract: true
        }
      }
    });

    const cssFiles = fs.readdirSync(
      path.resolve(currentDir, './dist/_averjs/css')
    );

    await page.goto('http://localhost:3000');
    const content = await page.content();

    for (const css of cssFiles) {
      const response = await page.goto(
        `http://localhost:3000/dist/_averjs/css/${css}`
      );
      expect(response?.status()).toBe(200);
      expect(content).toContain(
        `<link rel="preload" href="/dist/_averjs/css/${css}" as="style">`
      );
    }
  });
});
