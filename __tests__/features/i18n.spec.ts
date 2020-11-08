import 'expect-puppeteer';
import fs from 'fs-extra';
import path from 'path';
import Aver from '../../packages/@averjs/core/lib';

let aver: Aver | null = null;

describe('i18n', () => {
  beforeEach(async() => {
    await jestPuppeteer.resetPage();
  });

  beforeAll(async() => {
    console.log(process.env.NODE_ENV);
    process.env.PROJECT_PATH = path.resolve(__dirname, '../fixtures/i18n/src');
    process.env.API_PATH = path.resolve(__dirname, '../fixtures/i18n/api');

    aver = new Aver();
    aver.config.rootDir = path.resolve(__dirname, '../fixtures/i18n');
    aver.config.cacheDir = path.resolve(aver.config.rootDir, './node_modules/.cache/averjs');
    aver.config.distPath = path.resolve(aver.config.rootDir, aver.config.distDir);

    await aver.build({});
    
    aver.config._production = true;
    await aver.run();
  });

  afterAll(async() => {
    await aver?.server?.close();

    fs.removeSync(path.resolve(__dirname, '../fixtures/i18n/dist'));
  });

  test('should pick up i18n config from aver-config file, display english translation and display correct current lang', async() => {
    await page.goto('http://localhost:3000');
    expect(await page.content()).toContain('<div>test en</div><div>en</div>');
  });

  test('should keep de as fallback and display german translation', async() => {
    await page.goto('http://localhost:3000/fallback');
    expect(await page.content()).toContain('<div>test de</div>');
  });

  test('should pick up cookie and display german translation', async() => {
    await page.setCookie({ name: 'language', value: 'de', url: 'http://localhost:3000' });
    await page.goto('http://localhost:3000');
    expect(await page.content()).toContain('<div>test de</div>');
  });

  test('click on button should change language and set cookie', async() => {
    await page.goto('http://localhost:3000');
    await page.click('button');
    expect(await page.content()).toContain('<div>test de</div><div>de</div>');
    expect(await page.cookies()).toContainEqual(
      expect.objectContaining({ name: 'language', value: 'de' })
    );
  });
});
