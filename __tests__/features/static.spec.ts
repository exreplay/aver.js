import { testFeature } from '../utils/feature';
import fs from 'fs';
import path from 'path';

testFeature(
  'static',
  (currentDir) => {
    test('should generate static files for every route', () => {
      expect(
        fs.existsSync(path.resolve(currentDir, './dist/index.html'))
      ).toBeTruthy();
      expect(
        fs.readFileSync(path.resolve(currentDir, './dist/index.html'), 'utf-8')
      ).toContain(
        '<div id="app" data-server-rendered="true"><div><span>home route</span></div></div>'
      );

      expect(
        fs.existsSync(path.resolve(currentDir, './dist/test/index.html'))
      ).toBeTruthy();
      expect(
        fs.readFileSync(
          path.resolve(currentDir, './dist/test/index.html'),
          'utf-8'
        )
      ).toContain(
        '<div id="app" data-server-rendered="true"><div><span>test route</span></div></div>'
      );

      expect(
        fs.existsSync(path.resolve(currentDir, './dist/meta/index.html'))
      ).toBeTruthy();
      expect(
        fs.readFileSync(
          path.resolve(currentDir, './dist/meta/index.html'),
          'utf-8'
        )
      ).toContain('<title>meta route</title>');
    });
  },
  { static: true }
);
