import { testFeature } from '../utils/feature';
import fs from 'fs';
import path from 'path';

testFeature('csrf-disabled', () => {
  test('should not have csrf meta tag and cookie', async () => {
    await page.goto('http://localhost:3000');
    const content = await page.content();
    const cookies = await page.cookies();
    console.log(
      fs.readFileSync(
        path.resolve(process.env.PROJECT_PATH, '../storage/log/error.log'),
        'utf-8'
      )
    );
    expect(content).not.toContain('<meta name="csrf-token"');
    expect(content).toContain(
      `<span>Instance variable: </span><span>Axios default: </span>`
    );
    expect(cookies).not.toContainEqual(
      expect.objectContaining({ name: '_csrf' })
    );
  });
});
