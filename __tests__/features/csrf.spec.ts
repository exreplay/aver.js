import { testFeature } from '../utils/feature';

testFeature('csrf', () => {
  afterEach(async () => {
    await page.deleteCookie({ name: '_csrf', url: 'http://localhost:3000' });
  });

  test('should have csrf meta tag and cookie', async () => {
    await page.goto('http://localhost:3000');
    const content = await page.content();
    const cookies = await page.cookies();
    const token = await page.$eval(
      'meta[name="csrf-token"]',
      element => (element as HTMLMetaElement).content
    );
    expect(content).toContain('<meta name="csrf-token"');
    expect(content).toContain(
      `<span>Instance variable: ${token}</span><span>Axios default: ${token}</span>`
    );
    expect(cookies).toContainEqual(expect.objectContaining({ name: '_csrf' }));
  });
});
