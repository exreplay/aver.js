import { testFeature } from '../utils/feature';

testFeature('css', () => {
  test('should be compiled correctly', async () => {
    await page.goto('http://localhost:3000/');
    const content = await page.content();
    const scope =
      (await page.$$eval('#home', (el) =>
        el
          .map((e) => e.getAttributeNames())?.[0]
          .find((a) => a.includes('data'))
      )) || '';
    const cssModule =
      (
        await page.$$eval('#module', (el) => el.map((m) => m.textContent))
      )?.[0] || '';
    expect(content).toContain('<style type="text/css">h1{color:red}</style>');
    expect(content).toContain(`.${cssModule}{color:green}`);
    expect(content).toContain(
      `<style type="text/css">.test2[${scope}]{color:blue}</style>`
    );
  });

  test('should compiled postcss correctly', async () => {
    await page.goto('http://localhost:3000/postcss');
    const content = await page.content();
    expect(content).toContain(
      'h1,h2,h3,h4,h5,h6{margin-bottom:0;margin-top:0}:root{--mainColor:rgba(18,52,86,0.47059)}body{word-wrap:break-word;color:rgba(18,52,86,.47059);color:var(--mainColor);font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif}.menu_link{background:#056ef0;width:200px}h1:before{margin:10px 20px}'
    );
  });

  test('should compile css in js correctly', async () => {
    await page.goto('http://localhost:3000/cssinjs');
    const content = await page.content();
    expect(content).toContain(
      '<style type="text/css">h1,h2,h3,h4,h5,h6{margin-bottom:0;margin-top:0}</style>'
    );
  });

  test('should compiled scss/sass correctly', async () => {
    await page.goto('http://localhost:3000/scss');
    const content = await page.content();
    console.log(content);
    expect(content).toContain(
      `<style type="text/css">.scss{color:blue}</style>`
    );
  });
});
