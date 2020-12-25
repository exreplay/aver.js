import { testFeature } from '../utils/feature';

testFeature('helmet', () => {
  test('helmet should work correctly and headers should not contain referrer policy', async () => {
    const response = await page.goto('http://localhost:3000');
    expect(response?.headers()).not.toContain({
      'referrer-policy': 'no-referrer'
    });
  });
});
