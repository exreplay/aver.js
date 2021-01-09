import { testFeature } from '../utils/feature';
import fs from 'fs-extra';
import path from 'path';

testFeature('copy-webpack', (currentDir) => {
  const logoPath = path.resolve(currentDir, './public/images/logo.png');

  afterAll(() => {
    fs.removeSync(path.resolve(currentDir, './public'));
  });

  test('should copy images in resources folder to public folder', () => {
    expect(fs.existsSync(logoPath)).toBeTruthy();
  });
});
