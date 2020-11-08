import { testFeature } from '../utils/feature';

testFeature('vue-progressbar', () => {
  test('should render progressbar with custom config', async() => {
    await page.goto('http://localhost:3000');
    expect(await page.content()).toContain('<div class="__cov-progress" style="background-color: rgb(17, 34, 51); opacity: 0; top: 0px; left: 0px; width: 0%; height: 5px; transition: opacity 0.6s ease 0s; position: fixed;"></div>');
  });
});
