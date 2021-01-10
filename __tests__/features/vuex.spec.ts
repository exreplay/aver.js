import { testFeature } from '../utils/feature';

testFeature('vuex', () => {
  test('should find all vuex folders and register stores', async () => {
    const warnings: string[] = [];

    page.on('console', (message) => {
      warnings.push(message.text().trim());
    });

    const response = await page.goto('http://localhost:3000');
    const content = await page.content();
    const ssr = await response?.text();

    expect(warnings).toContain(
      "We found multiple files which try to set the global store. Be aware that there can only be 1 global store file.\nThe file './vuex/index.js' was used.\nThe following files have been ignored: './vuex/should-be-ignored.js'."
    );

    expect(ssr).toContain(
      '<div id="app" data-server-rendered="true"><div><span>hello from class based vuex module</span><span>global vuex test</span><span>entry works</span><span>basic module test</span></div></div>'
    );
    expect(ssr).toContain(
      'window.__INITIAL_STATE__={globalTest:"global vuex test",testModule:{persist:"",test:"hello from class based vuex module",host:"http://localhost:3000"}'
    );
    expect(content).toContain(
      '<div id="app"><div><span>hello from class based vuex module</span><span>global vuex test</span><span>entry works</span><span>basic module test</span></div></div>'
    );
    expect(content).toContain(
      'window.__INITIAL_STATE__={globalTest:"global vuex test",testModule:{persist:"",test:"hello from class based vuex module",host:"http://localhost:3000"}'
    );
  });

  test('should persist values in cookie', async () => {
    await page.goto('http://localhost:3000/persist');

    expect(await page.cookies()).toContainEqual(
      expect.objectContaining({
        name: 'vuex',
        value: '{%22testModule%22:{%22persist%22:%22%22}}'
      })
    );

    await page.click('button');

    expect(await page.cookies()).toContainEqual(
      expect.objectContaining({
        name: 'vuex',
        value: '{%22testModule%22:{%22persist%22:%22changed%22}}'
      })
    );

    const response = await page.reload();
    const content = await page.content();
    const ssr = await response?.text();

    expect(ssr).toContain(
      '<div id="app" data-server-rendered="true"><div>changed<button></button></div></div>'
    );
    expect(ssr).toContain(
      'window.__INITIAL_STATE__={globalTest:"global vuex test",testModule:{persist:"changed",test:"hello from class based vuex module",host:"http://localhost:3000"}'
    );
    expect(content).toContain(
      '<div id="app"><div>changed<button></button></div></div>'
    );
    expect(content).toContain(
      'window.__INITIAL_STATE__={globalTest:"global vuex test",testModule:{persist:"changed",test:"hello from class based vuex module",host:"http://localhost:3000"}'
    );
  });
});
