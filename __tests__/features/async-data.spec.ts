import { testFeature } from '../utils/feature';

testFeature('async-data', () => {
  test('should fetch data before rendering component on page change', async () => {
    const response = await page.goto('http://localhost:3000');
    expect(await response?.text()).toContain(
      '<div id="app" data-server-rendered="true"><div><a href="/test">ssr</a></div></div>'
    );
    expect(await page.content()).toContain(
      '<div id="app"><div><a href="/test" class="">ssr</a></div></div>'
    );

    await (await page.$('a'))?.click();
    const watchDog = page.waitForFunction('window.status === "ready"');
    await watchDog;
    expect(await page.content()).toContain(
      '<div id="app"><div><div>some async data</div><!----></div></div>'
    );
  });

  test('should fetch data before ssr', async () => {
    const response = await page.goto('http://localhost:3000/test');
    expect(await response?.text()).toContain(
      '<div id="app" data-server-rendered="true"><div><div>some async data</div><!----></div></div>'
    );
  });

  test('should fetch data before ssr', async () => {
    const response = await page.goto('http://localhost:3000/test/testchild');
    const text = await response?.text();
    const content = await page.content();
    expect(text).toContain(
      '<div id="app" data-server-rendered="true"><div><div>some async data</div><div>hello from testchild</div></div></div>'
    );
    expect(text).toContain(
      '<script>window.__AVER_STATE__={asyncData:{},data:[null,{data:"hello from testchild"}]}</script>'
    );
    expect(content).toContain(
      '<div id="app"><div><div>some async data</div><div>hello from testchild</div></div></div>'
    );
    expect(content).toContain(
      '<script>window.__AVER_STATE__={asyncData:{},data:[null,{data:"hello from testchild"}]}</script>'
    );
  });

  test('should have the asyncData class hook registered', async () => {
    const response = await page.goto('http://localhost:3000/test-class');
    expect(await response?.text()).toContain(
      '<div id="app" data-server-rendered="true"><div>some async data</div></div>'
    );
  });
});
