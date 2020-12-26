import TypescriptInitCommand from '../lib/ts-init';
import path from 'path';
import fs from 'fs';

describe('ts-init command', () => {
  it('should create files when not exist', async () => {
    process.env.PROJECT_PATH = path.resolve(
      __dirname,
      '../__fixtures__/empty/src/'
    );
    const init = new TypescriptInitCommand();
    await init.run();

    expect(fs.existsSync(init.tsConfigPath)).toBeTruthy();
    expect(fs.existsSync(init.tsConfigServerPath)).toBeTruthy();

    fs.unlinkSync(init.tsConfigPath);
    fs.unlinkSync(init.tsConfigServerPath);
  });

  it('should not touch tsconfig files if already exist', async () => {
    process.env.PROJECT_PATH = path.resolve(
      __dirname,
      '../__fixtures__/non-empty/src/'
    );
    const init = new TypescriptInitCommand();
    await init.run();

    const tsConfig = fs.readFileSync(init.tsConfigPath, 'utf-8');
    const tsConfigServer = fs.readFileSync(init.tsConfigServerPath, 'utf-8');

    expect(tsConfig).toBe('// empty');
    expect(tsConfigServer).toBe('// empty');
  });
});
