import { resolve } from 'path';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { copy } from 'fs-extra';
import { register } from 'ts-node';
import parseArgs, { ParsedArgs } from 'minimist';
import ora from 'ora';
import AverCli from '@averjs/cli';

interface AvailableCommands extends ParsedArgs {
  init?: boolean
}

export default class CLI {
  argv: AvailableCommands = parseArgs(process.argv.slice(2));

  get tsConfigPath() { return resolve(process.env.PROJECT_PATH, '../tsconfig.json'); }
  get tsConfigServerPath() { return resolve(process.env.PROJECT_PATH, '../tsconfig.server.json'); }
  get eslintrcPath() { return resolve(process.env.PROJECT_PATH, '../.eslintrc.js'); }
  
  async run() {
    if(this.argv.init) {
      await this.init();
      return;
    }

    register({
      project: this.tsConfigServerPath
    });

    const avercli = new AverCli();
    avercli.run();
  }

  async init() {
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

    const eslintrcSpinner = ora('Updating eslintrc').start();
    const eslintrcPath = this.eslintrcPath;
    const eslintrc = await import(eslintrcPath);
    if(!eslintrc.extends?.find((e: string) => e === '@averjs/typescript/eslint')) {
      const content = readFileSync(eslintrcPath, 'utf-8');
      const lines = content.split('\n');
      for(const i in lines) {
        const line = lines[i];
        if(line.includes('extends')) lines.splice(parseInt(i) + 1, 0, `    '@averjs/typescript/eslint',`);
      }
      writeFileSync(eslintrcPath, lines.join('\n'));
      eslintrcSpinner.succeed();
    } else {
      eslintrcSpinner.info('Skipping because plugin already exists.');
    }
  }
}