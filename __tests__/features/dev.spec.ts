import { aver, testFeature } from '../utils/feature';
import fs from 'fs';
import path from 'path';
import { mocked } from 'ts-jest/utils';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import consola from 'consola';

jest.mock('@averjs/shared-utils');

let outputData = '';
let log: Console['log'];

beforeAll(() => {
  log = console.log;
  console.log = jest.fn((...inputs) => (outputData += inputs.join('')));
});

afterAll(() => {
  console.log = log;
});

testFeature(
  'dev',
  currentDir => {
    test('should compile correctly and responde with a 200', async () => {
      await page.goto('http://localhost:3000');
      expect(await page.content()).toContain(
        '<div id="app"><div>dev is working</div><div class="__cov-progress" style="background-color: rgb(0, 59, 142); opacity: 0; top: 0px; left: 0px; width: 0%; height: 2px; transition: opacity 0.6s ease 0s; position: fixed;"></div></div>'
      );
    });

    test('files changed plugin should log changed files', async () => {
      consola.restoreAll();

      const homePath = path.resolve(currentDir, './src/pages/Home.vue');
      const homeContent = fs.readFileSync(homePath, 'utf-8');
      fs.writeFileSync(
        homePath,
        `<template>
  <div>dev is updating</div>
</template>

<script>
export default {};
</script>`,
        'utf-8'
      );
      fs.writeFileSync(homePath, homeContent, 'utf-8');

      await new Promise(resolve => setTimeout(resolve, 500));

      expect(outputData).toContain(
        `${logSymbols.info}Files changed: ${chalk.bold.blue('Home.vue')}`
      );

      consola.wrapAll();
    });

    test('should responde with a 404 correctly', async () => {
      const response = await page.goto('http://localhost:3000/404');
      expect(response?.status()).toBe(404);
    });

    test('should try to open browser with the correct port', async () => {
      const sharedUtils = await import('@averjs/shared-utils');
      const mockedSharedUtils = mocked(sharedUtils, true);

      // do not try to open browser

      aver.server?.builder?.averRenderer?.openBrowser();

      expect(mockedSharedUtils.openBrowser.mock.calls.length).toBe(0);

      // open browser on port 3000

      if (aver.server?.builder?.averRenderer)
        aver.server.builder.averRenderer.config.openBrowser = true;

      aver.server?.builder?.averRenderer?.openBrowser();

      expect(mockedSharedUtils.openBrowser.mock.calls.length).toBe(1);
      expect(mockedSharedUtils.openBrowser.mock.calls[0][0]).toBe(
        'http://localhost:3000'
      );

      // should not try to open broser again

      aver.server?.builder?.averRenderer?.openBrowser();

      expect(mockedSharedUtils.openBrowser.mock.calls.length).toBe(1);

      // open browser on port 80

      if (aver.server?.builder?.averRenderer)
        aver.server.builder.averRenderer.isBrowserOpen = false;

      process.env.PORT = '80';

      aver.server?.builder?.averRenderer?.openBrowser();

      expect(mockedSharedUtils.openBrowser.mock.calls.length).toBe(2);
      expect(mockedSharedUtils.openBrowser.mock.calls[1][0]).toBe(
        'http://localhost'
      );
    });
  },
  { dev: true },
  () => {
    afterAll(() => {
      jest.clearAllMocks();
      process.env.PORT = '3000';
    });
  }
);
