import { testFeature } from '../utils/feature';

testFeature(
  'dev',
  () => {
    test('should compile correctly and responde with a 200', async () => {
      await page.goto('http://localhost:3000');
      expect(await page.content()).toContain(
        '<div id="app" data-server-rendered="true"><div>dev is working</div><div class="__cov-progress" style="background-color:rgb(19, 91, 55);opacity:0;top:0px;left:0px;width:0%;height:2px;transition:opacity 0.6s;"></div></div>'
      );
    });

    test('should responde with a 404 correctly', async () => {
      const response = await page.goto('http://localhost:3000/404');
      expect(response?.status()).toBe(404);
    });
  },
  { dev: true }
);
