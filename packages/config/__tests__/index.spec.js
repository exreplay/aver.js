import path from 'path';
import { getAverjsConfig } from '../lib/index';

beforeEach(() => {
  process.env.PROJECT_PATH = path.resolve(__dirname, '../__fixtures__/src');
});

test('should change progressbar option to false', () => {
  const config = getAverjsConfig();
  expect(config.progressbar).toBe(false);
  expect(config.webpack.css.extract).toBe(true);
});

test('should match default snapshot config when no config file is present', () => {
  process.env.PROJECT_PATH = '';
  const config = getAverjsConfig();
  expect(config).toMatchSnapshot();
});
