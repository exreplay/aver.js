import { aver, testFeature } from '../utils/feature';
import fs from 'fs';
import path from 'path';

testFeature(
  'plugins-entries-hmr',
  currentDir => {
    const newContent =
      "import Vue from 'vue';\nVue.prototype.$test = 'hmr works';\n";
    const entryPath = path.resolve(currentDir, './plugin/entries');
    const clientEntryPath = path.resolve(entryPath, './entry-client.js');
    const clientEntry = fs.readFileSync(clientEntryPath, 'utf-8');
    const appEntry = path.resolve(entryPath, './app.js');
    const appEntryCache = path.resolve(
      currentDir,
      './node_modules/.cache/averjs/plugin/app.js'
    );

    afterAll(() => {
      fs.unlinkSync(appEntry);
      fs.unlinkSync(appEntryCache);
      fs.writeFileSync(clientEntryPath, clientEntry, 'utf-8');
    });

    test('should update template files correctly', async () => {
      await page.goto('http://localhost:3000');

      /**
       * should watch all the plugin entry paths
       */

      expect(
        aver.server?.builder?.averRenderer?.templatePathsToWatch()
      ).toEqual([entryPath]);

      /**
       * should change the entry inside cache
       */
      fs.writeFileSync(
        clientEntryPath,
        "import Vue from 'vue';\nVue.prototype.$test = 'hmr works';\n",
        'utf-8'
      );

      aver.server?.builder?.averRenderer?.updateTemplateFile(
        aver.config.templates || [],
        'change',
        clientEntryPath
      );

      expect(
        fs.readFileSync(
          path.resolve(
            currentDir,
            './node_modules/.cache/averjs/plugin/entry-client.js'
          ),
          'utf-8'
        )
      ).toBe(newContent);

      /**
       * should remove the entry inside cache
       */

      aver.server?.builder?.averRenderer?.updateTemplateFile(
        aver.config.templates || [],
        'unlink',
        clientEntryPath
      );

      expect(
        fs.existsSync(
          path.resolve(
            currentDir,
            './node_modules/.cache/averjs/plugin/entry-client.js'
          )
        )
      ).toBeFalsy();

      /**
       * should add the new entry inside cache and update templates array
       */
      fs.writeFileSync(appEntry, '');

      aver.server?.builder?.averRenderer?.updateTemplateFile(
        aver.config.templates || [],
        'add',
        appEntry
      );

      expect(fs.existsSync(appEntryCache)).toBeTruthy();

      expect(aver.config.templates).toEqual(
        expect.arrayContaining([
          {
            src: appEntry,
            dst: 'plugin/app.js'
          }
        ])
      );
    });
  },
  { dev: true }
);
