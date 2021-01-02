import { testFeature } from '../utils/feature';
import fs from 'fs';
import path from 'path';

testFeature('additional-extensions', currentDir => {
  test('should add the additional extensions to entries regex', async () => {
    const response = await page.goto('http://localhost:3000');
    const content = await page.content();
    expect(await response?.text()).toContain(
      '<span>server entry works</span><span>i18n entry works</span><span>app entry works</span>'
    );
    expect(content).toContain(
      '<span>client entry works</span><span>i18n entry works</span><span>app entry works</span>'
    );

    const appContent = fs.readFileSync(
      path.resolve(currentDir, './node_modules/.cache/averjs/app.js'),
      'utf-8'
    );
    const clientContent = fs.readFileSync(
      path.resolve(currentDir, './node_modules/.cache/averjs/entry-client.js'),
      'utf-8'
    );
    const entryServerContent = fs.readFileSync(
      path.resolve(currentDir, './node_modules/.cache/averjs/entry-server.js'),
      'utf-8'
    );
    const i18nContent = fs.readFileSync(
      path.resolve(currentDir, './node_modules/.cache/averjs/i18n.js'),
      'utf-8'
    );

    expect(appContent).toContain('(js|ts)');
    expect(clientContent).toContain('(js|ts)');
    expect(entryServerContent).toContain('(js|ts)');
    expect(i18nContent).toContain('(js|ts)');
  });
});
