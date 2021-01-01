import { testFeature } from '../utils/feature';

testFeature('alias', () => {
  test('should resolve webpack aliases correctly', async () => {
    await page.goto('http://localhost:3000');
    console.log(await page.content());
    expect(await page.content()).toContain(
      '<div id="app"><div><span>vuex</span><span>src</span><span>root</span><span>components</span><span>mixins</span><span>resources</span><span>[{"path":"/","name":"home"}]</span><span>test</span></div></div>'
    );
  });
});
