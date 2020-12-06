import { testFeature } from '../utils/feature';

testFeature('i18n', () => {
  beforeEach(async () => {
    await page.deleteCookie({ name: 'language', url: 'http://localhost:3000' });
  });

  test('should pick up i18n config from aver-config file, display english translation and display correct current lang', async () => {
    await page.goto('http://localhost:3000');
    expect(await page.content()).toContain('<div>test en</div><div>en</div>');
  });

  test('should keep de as fallback and display german translation', async () => {
    await page.goto('http://localhost:3000/fallback');
    expect(await page.content()).toContain('<div>test de</div>');
  });

  test('should pick up cookie and display german translation', async () => {
    await page.setCookie({
      name: 'language',
      value: 'de',
      url: 'http://localhost:3000'
    });
    await page.goto('http://localhost:3000');
    expect(await page.content()).toContain('<div>test de</div>');
  });

  test('click on button should change language and set cookie', async () => {
    await page.goto('http://localhost:3000');
    await page.click('button');
    expect(await page.content()).toContain('<div>test de</div><div>de</div>');
    expect(await page.cookies()).toContainEqual(
      expect.objectContaining({ name: 'language', value: 'de' })
    );
  });

  test('mixin should add global messages', async () => {
    await page.goto('http://localhost:3000/global');
    expect(await page.content()).toContain('<div>global en</div>');
    await page.click('button');
    expect(await page.content()).toContain('<div>global de</div>');
  });
});
