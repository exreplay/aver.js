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
      const home = fs.readFileSync(
        path.resolve(currentDir, './dist/index.html'),
        'utf-8'
      );
      expect(home).toContain(
        '<div id="app" data-server-rendered="true"><div><span>home route</span><span>some async data</span></div></div>'
      );
      expect(home).toContain(
        '<script>window.__AVER_STATE__={asyncData:{},data:[{asyncData:"some async data"}]}</script>'
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
