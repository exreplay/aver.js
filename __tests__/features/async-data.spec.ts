import { testFeature } from '../utils/feature';

testFeature('async-data', () => {
  test('should fetch data before rendering component on page change', async () => {
    await page.goto('http://localhost:3000');
    await (await page.$('a'))?.click();
    const watchDog = page.waitForFunction('window.status === "ready"');
    await watchDog;
    expect(await page.content()).toContain(
      '<div id="app"><div>some async data</div></div>'
    );
  });

  test('should fetch data before ssr', async () => {
    const response = await page.goto('http://localhost:3000/test');
    expect(await response?.text()).toContain(
      '<div id="app" data-server-rendered="true"><div>some async data</div></div>'
    );
  });

  test('should have the asyncData class hook registered', async () => {
    const response = await page.goto('http://localhost:3000/test-class');
    expect(await response?.text()).toContain(
      '<div id="app" data-server-rendered="true"><div>some async data</div></div>'
    );
  });
});
