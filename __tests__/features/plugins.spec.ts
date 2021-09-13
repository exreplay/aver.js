import { testFeature } from '../utils/feature';
import fs from 'fs-extra';
import path from 'path';
import PluginContainer from '@averjs/core/lib/plugins';

testFeature('plugins', (currentDir) => {
  beforeAll(() => {
    fs.copySync(
      path.resolve(currentDir, './plugins/aver-test-plugin'),
      path.resolve(process.cwd(), './node_modules/aver-test-plugin')
    );
  });

  afterAll(() => {
    fs.removeSync(path.resolve(currentDir, './src/build.js'));
    fs.removeSync(
      path.resolve(process.cwd(), './node_modules/aver-test-plugin')
    );
  });

  test('should be executed correctly', async () => {
    const response = await page.goto('http://localhost:3000');
    const serverContent = await response?.text();
    const content = await page.content();

    expect(serverContent).toContain(
      '<div>inline</div><div>node_modules</div><div>project</div><div id="app" data-server-rendered="true"><span>server entry works</span><span>build plugin options working</span></div>'
    );
    expect(content).toContain(
      '<div>inline</div><div>node_modules</div><div>project</div><div id="app"><span>client entry works</span><span>build plugin options working</span></div>'
    );
  });

  test('should throw errors when plugins cannot be resolved or are configured wrong', async () => {
    const container = new PluginContainer({
      config: { cacheDir: '' }
    } as never);

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await container.addModule('plugin-not-exists');
    } catch (error) {
      expect(error.message).toBe(
        "Could not resolve plugin 'plugin-not-exists'. Please make sure either the package is installed or the file exists."
      );
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await container.addModule(true);
    } catch (error) {
      expect(error.message).toBe(
        'Plugins have to be defined as functions. Please check your aver config file.'
      );
    }

    const pluginPath = path.resolve(
      process.env.PROJECT_PATH,
      '../plugins/wrong-export'
    );
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await container.addModule(pluginPath);
    } catch (error) {
      expect(error.message).toBe(
        `Plugin '${pluginPath}' should export a function. Got 'string'.`
      );
    }
  });
});
