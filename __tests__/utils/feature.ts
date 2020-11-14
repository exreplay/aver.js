import 'expect-puppeteer';
import fs from 'fs-extra';
import path from 'path';
import consola from 'consola';
import Aver from '../../packages/@averjs/core/lib';

export let aver: Aver;

interface Options {
  /**
   * Enable dev mode
   */
  dev?: boolean;
  /**
   * Every console output is passed to consola and the printing is disabled by default.
   */
  showConsoleLogs?: boolean;
}

export function testFeature(name: string, fn: (() => void), options: Options = {}) {
  const {
    dev = false,
    showConsoleLogs = false
  } = options;

  describe(name, () => {
    beforeAll(async() => {
      consola.wrapAll();
      if (!showConsoleLogs) consola.pause();

      process.env.PROJECT_PATH = path.resolve(__dirname, `../fixtures/${name}/src`);
      process.env.API_PATH = path.resolve(__dirname, `../fixtures/${name}/api`);
  
      aver = new Aver();
      if (!dev) {
        await aver.build({});
        aver.config._production = true;
      } else {
        aver.config.isProd = false;
      }
      await aver.run();
    });
  
    afterAll(async() => {
      await aver?.close();
      fs.removeSync(aver?.config.distPath);
      if (!showConsoleLogs) {
        consola.clear();
        consola.resume();
      }
    });

    beforeEach(async() => {
      await jestPuppeteer.resetPage();
    });

    fn();
  });
}

export const defaultConfig = (dir: string) => ({
  rootDir: dir,
  cacheDir: path.resolve(dir, './node_modules/.cache/averjs'),
  distPath: path.resolve(dir, './dist')
});
