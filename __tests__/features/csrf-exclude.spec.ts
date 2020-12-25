import { testFeature } from '../utils/feature';

testFeature('csrf-exclude', () => {
  test('should exclude route from csrf protection', async () => {
    await page.goto('http://localhost:3000');
    const watchDog = page.waitForFunction('window.status === "ready"');
    await watchDog;
    const content = await page.content();
    expect(content).toContain(`<span>403</span><span>200</span>`);
  });
});
