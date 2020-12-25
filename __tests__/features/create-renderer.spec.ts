import { testFeature } from '../utils/feature';

testFeature('create-renderer', () => {
  test('element with `v-hidden` should have opacity 0 set by default', async () => {
    await page.goto('http://localhost:3000');
    const content = await page.content();
    // eslint-disable-next-line no-useless-escape
    expect(content).toContain(`<span style=\"opacity:0\"></span>`);
  });
});
