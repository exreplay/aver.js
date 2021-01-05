import 'expect-puppeteer';
import fs from 'fs-extra';
import path from 'path';
import consola from 'consola';
import Aver from '@averjs/core/lib';
import { AverConfig } from '@averjs/config/lib';
import mergeWith from 'lodash/mergeWith';
import { RendererOptions } from '@averjs/renderer/lib';

export let aver: Aver;
let currentDir: string;

interface Options {
  /**
   * Enable dev mode
   */
  dev?: boolean;
  /**
   * Enable static build
   */
  static?: boolean;
  /**
   * Every console output is passed to consola and the printing is disabled by default.
   */
  showConsoleLogs?: boolean;
  /**
   * Prevent the dist folder to be removed after every test run
   */
  keepDist?: boolean;
  /**
   * Prevent the log folder to be removed after every test run
   */
  keepLogs?: boolean;
  /**
   * Pass an initial aver config
   */
  config?: AverConfig;
}

export async function rebuild(
  config?: AverConfig,
  renderOptions?: RendererOptions
) {
  await aver.close();
  if (config)
    aver.config = mergeWith(aver.config, config, (obj, src) => {
      if (Array.isArray(obj)) return src;
    });
  fs.removeSync(path.resolve(aver.config.rootDir, './node_modules/.cache'));
  fs.removeSync(path.resolve(process.cwd(), './node_modules/.cache'));
  await aver.build(renderOptions || {});
  if (!renderOptions?.static) await aver.run();
}

export function testFeature(
  name: string,
  fn: (currentDir: string) => void,
  options?: Options,
  beforeFn?: (currentDir: string) => void
) {
  const {
    dev = false,
    static: staticMode = false,
    showConsoleLogs = false,
    keepLogs = false,
    keepDist = false,
    config = {}
  } = options || {};

  describe(name, () => {
    currentDir = path.resolve(__dirname, `../fixtures/${name}`);

    beforeFn?.(currentDir);

    beforeAll(async () => {
      consola.wrapAll();
      if (!showConsoleLogs) consola.pause();
      process.env.PROJECT_PATH = path.resolve(currentDir, `./src`);
      process.env.API_PATH = path.resolve(currentDir, `./api`);

      try {
        aver = new Aver();

        aver.config.openBrowser = false;
        aver.config.rootDir = currentDir;
        aver.config.cacheDir = path.resolve(
          currentDir,
          './node_modules/.cache/averjs'
        );
        aver.config.distPath = path.resolve(currentDir, aver.config.distDir);

        aver.config = mergeWith(aver.config, config, (obj, src) => {
          if (Array.isArray(obj)) return src;
        });

        if (!dev) {
          await aver.build({ static: staticMode });
          aver.config._production = true;
        } else {
          aver.config.isProd = false;
        }

        if (!staticMode) await aver.run();
      } catch (error) {
        consola.resume();
        console.log(error);
      }
    });

    afterAll(async () => {
      await aver.close();
      // remove dist folder
      if (!keepDist) fs.removeSync(aver.config.distPath);
      // remove storage folder
      if (!keepLogs)
        fs.removeSync(path.resolve(process.env.PROJECT_PATH, '../storage'));

      const client = await page.target().createCDPSession();
      await client.send('Network.clearBrowserCookies');

      if (!showConsoleLogs) {
        consola.clear();
        consola.resume();
      }
      consola.restoreAll();
    });

    afterEach(async () => {
      await jestPuppeteer.resetPage();
      await jestPuppeteer.resetBrowser();
    });

    fn(currentDir);
  });
}
