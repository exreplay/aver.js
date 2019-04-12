import path from 'path';
import { getAverjsConfig } from '../index';

beforeEach(() => {
  process.env.PROJECT_PATH = path.resolve(__dirname, '../__fixtures__/aver-config.js');
});

test('should change progressbar option to false', () => {
  const config = getAverjsConfig();
  expect(config.progressbar).toBe(false);
});

test('should change nested attribute extract to true', () => {
  const config = getAverjsConfig();
  expect(config.webpack.css.extract).toBe(true);
});

test('should return a default config when no config file is present', () => {
  process.env.PROJECT_PATH = '';
  const config = getAverjsConfig();
  expect(config.progressbar).toBe(true);
});
