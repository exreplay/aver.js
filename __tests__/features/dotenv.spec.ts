import { aver, testFeature } from '../utils/feature';
import Aver from '@averjs/core/lib';
import fs from 'fs';
import path from 'path';

testFeature('dotenv', currentDir => {
  const dotenvPath = path.resolve(currentDir, './.env');

  afterAll(() => {
    fs.writeFileSync(dotenvPath, "DOTENV_TEST='hello world'");
  });

  test('should load and update env variables', async () => {
    await page.goto('http://localhost:3000/');
    expect(process.env.DOTENV_TEST).toBe('hello world');

    await aver.close();

    fs.writeFileSync(dotenvPath, "DOTENV_TEST='hello new world'");

    let newAver: Aver | null = new Aver();

    expect(process.env.DOTENV_TEST).toBe('hello new world');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    newAver = null;
  });
});
