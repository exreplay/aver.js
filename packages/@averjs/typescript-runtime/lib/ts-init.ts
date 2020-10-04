import { resolve } from 'path';
import { existsSync } from 'fs';
import { copy } from 'fs-extra';
import { CommandInterface } from '@averjs/cli/dist/commands/command';
import ora from 'ora';

export default class TypescriptInitCommand implements CommandInterface {
  name = 'ts';
  description = 'Initialize typescript project with necessary files.';

  get tsConfigPath() { return resolve(process.env.PROJECT_PATH, '../tsconfig.json'); }
  get tsConfigServerPath() { return resolve(process.env.PROJECT_PATH, '../tsconfig.server.json'); }
  get eslintrcPath() { return resolve(process.env.PROJECT_PATH, '../.eslintrc.js'); }

  async run() {
    const tsConfigSpinner = ora('Copying tsconfig.json').start();
    if (!existsSync(this.tsConfigPath)) {
      await copy(
        resolve(__dirname, '../templates/tsconfig.json'),
        this.tsConfigPath
      );
      tsConfigSpinner.succeed();
    } else {
      tsConfigSpinner.info('Skipping because tsconfig.json already exists.');
    }

    const tsConfigServerSpinner = ora('Copying tsconfig.server.json').start();
    if (!existsSync(this.tsConfigServerPath)) {
      await copy(
        resolve(__dirname, '../templates/tsconfig.server.json'),
        this.tsConfigServerPath
      );
      tsConfigServerSpinner.succeed();
    } else {
      tsConfigServerSpinner.info('Skipping because tsconfig.server.json already exists.');
    }
  }
}