import path from 'path';
import Aver from '../../packages/@averjs/core/lib';

jest.setTimeout(60000);

let aver: Aver | null = null;

describe('i18n', () => {
  beforeAll(async() => {
    process.env.PROJECT_PATH = path.resolve(__dirname, '../fixtures/i18n/src');
    process.env.API_PATH = path.resolve(__dirname, '../fixtures/i18n/api');

    aver = new Aver();
    aver.config.rootDir = path.resolve(__dirname, '../fixtures/i18n');
    aver.config.cacheDir = path.resolve(aver.config.rootDir, './node_modules/.cache/averjs');
    aver.config.distPath = path.resolve(aver.config.rootDir, aver.config.distDir);

    await aver.build({});
  });

  test('bla', () => {
    expect(true).toBe(true);
  });
});
