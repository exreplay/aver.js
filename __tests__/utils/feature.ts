
import 'expect-puppeteer';
import fs from 'fs-extra';
import path from 'path';
import Aver from '../../packages/@averjs/core/lib';

export let aver: Aver;

export function testFeature(name: string, fn: (() => void)) {
  describe(name, () => {
    beforeAll(async() => {
      process.env.PROJECT_PATH = path.resolve(__dirname, `../fixtures/${name}/src`);
      process.env.API_PATH = path.resolve(__dirname, `../fixtures/${name}/api`);
  
      aver = new Aver();
      await aver.build({});
      
      aver.config._production = true;
      await aver.run();
    });
  
    afterAll(async() => {
      await aver?.server?.close();
      fs.removeSync(aver?.config.distPath);
    });

    beforeEach(async() => {
      await jestPuppeteer.resetPage();
    });

    fn();
  });
}
