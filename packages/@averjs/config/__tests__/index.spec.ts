import path from 'path';
import { getAverjsConfig } from '../lib/index';

beforeEach(() => {
  console.log = jest.fn();
});

beforeEach(() => {
  process.env.PROJECT_PATH = path.resolve(__dirname, '../__fixtures__/src');
});

test('should change progressbar option to false', () => {
  const config = getAverjsConfig();
  expect(config.progressbar).toBe(false);
  expect(config.webpack.css?.extract).toBe(true);
});

test('should concat array with default values', () => {
  const config = getAverjsConfig();
  expect(config.progressbar).toBe(false);
  expect(config.webpack.additionalExtensions).toEqual(['js', 'ts']);
});

test('should match default snapshot config when no config file is present', () => {
  const processSpy = jest.spyOn(process, 'cwd').mockReturnValue('/');
  
  process.env.PROJECT_PATH = '/aver';
  const config = getAverjsConfig();
  expect(config).toMatchSnapshot();

  processSpy.mockRestore();
});
