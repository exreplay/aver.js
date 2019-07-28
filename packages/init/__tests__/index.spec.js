import Init from '../lib';
import path from 'path';
import fs from 'fs-extra';
import { infoMsg, succeedMsg } from 'ora';

const pathToDir = path.resolve(__dirname, './tmp');

function setupTestProjectDirectory() {
  if (!fs.existsSync(pathToDir)) fs.mkdirSync(pathToDir);

  fs.writeFileSync(path.resolve(pathToDir, './package.json'), '{ "name": "test", "scripts": { "live": "testcommand" } }');

  process.env.PROJECT_PATH = path.resolve(pathToDir, './src');
  process.env.API_PATH = path.resolve(pathToDir, './api');
}

let outputData = '';

beforeEach(() => {
  fs.removeSync(pathToDir);
  setupTestProjectDirectory();

  outputData = '';
  console['log'] = jest.fn(inputs => (outputData = inputs));
});

afterEach(() => {
  // fs.removeSync(pathToDir);
});

test('run command should finish', () => {
  const init = new Init();
  init.run();
  expect(outputData).toMatch('Project setup successfull!');
});

test('createSrcDir should copy src directory recursively', () => {
  const init = new Init();
  init.createSrcDir();
  expect(succeedMsg).toBe('Root directory successfully copied!');
});

test('createSrcDir should not copy when dir already exists', () => {
  const init = new Init();
  init.createSrcDir();
  init.createSrcDir();
  expect(infoMsg).toBe('Root directory "src" already exists');
});

test('writeFile should correctly write file to tmp folder', () => {
  const init = new Init();
  init.writeFile('test.js', 'this is a test');
  expect(fs.readFileSync(path.resolve(pathToDir, 'test.js')).toString()).toBe('this is a test');
  expect(succeedMsg).toBe('File "test.js" successfully written!');
});

test('writeFile should no overwrite already existing file', () => {
  const init = new Init();
  init.writeFile('test.js', 'this is a test');
  init.writeFile('test.js', 'this is a new test');
  expect(fs.readFileSync(path.resolve(pathToDir, 'test.js')).toString()).toBe('this is a test');
  expect(infoMsg).toBe('File "test.js" already exists');
});

test('copyFile should correctly copy file to tmp folder', () => {
  const init = new Init();
  init.copyFile('aver-config.js');
  expect(fs.existsSync(path.resolve(pathToDir, './aver-config.js'))).toBeTruthy();
  expect(succeedMsg).toBe('File "aver-config.js" successfully copied!');
});

test('copyFile should not copy when file already exists', () => {
  const init = new Init();
  init.copyFile('aver-config.js');
  init.copyFile('aver-config.js');
  expect(infoMsg).toBe('File "aver-config.js" already exists');
});

test('passing removeUnderscore should remove it but only the leading', () => {
  const init = new Init();
  init.appDir = path.resolve(__dirname, '../__fixtures__');
  init.copyFile('_test_with_underscore.js', true);
  expect(fs.existsSync(path.resolve(pathToDir, './test_with_underscore.js'))).toBeTruthy();
  expect(succeedMsg).toBe('File "_test_with_underscore.js" successfully copied!');
});

test('passing removeUnderscore should remove it but only the leading', () => {
  const init = new Init();
  init.appDir = path.resolve(__dirname, '../__fixtures__');
  init.copyFile('_test_with_underscore.js', true);
  expect(fs.existsSync(path.resolve(pathToDir, './test_with_underscore.js'))).toBeTruthy();
  expect(succeedMsg).toBe('File "_test_with_underscore.js" successfully copied!');
});

test('createApiDir with no args should create the root api directory', () => {
  const init = new Init();
  init.createApiDir();
  expect(fs.existsSync(path.resolve(pathToDir, './api'))).toBeTruthy();
  expect(succeedMsg).toBe('Directory "api" successfully created!');
});

test('createApiDir should create the given dir inside api dir', () => {
  const init = new Init();
  init.createApiDir();
  init.createApiDir('test');
  expect(fs.existsSync(path.resolve(pathToDir, './api/test'))).toBeTruthy();
  expect(succeedMsg).toBe('Directory "test" successfully created!');
});

test('createApiDir should not create the dir if it exists', () => {
  const init = new Init();
  init.createApiDir();
  init.createApiDir();
  expect(infoMsg).toBe('Directory "api" already exists');
});

test('trimLines should remove all whitespaces at the beginning of every line', () => {
  const init = new Init();
  expect(init.trimLines(`
    import a from 'module';

    const b = { ...a };
  `)).toEqual(`import a from 'module';\n\nconst b = { ...a };\n`);
});

test('modifying package.json should not overwrite default values', () => {
  const init = new Init();
  init.modifyPackageJson();
  const pkg = JSON.parse(fs.readFileSync(path.resolve(pathToDir, './package.json').toString()));
  expect(pkg.name).toBe('test');
  expect(pkg.scripts.live).toBe('testcommand');
  expect(succeedMsg).toBe('Successfully modified package.json!');
});
