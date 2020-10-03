import { resolve } from 'path';
import { existsSync } from 'fs';
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
  
  async run() {
    if(this.argv.init) {
      await this.init();
      return;
    }

    register({
      project: resolve(process.env.PROJECT_PATH, '../tsconfig.server.json')
    });

    const avercli = new AverCli();
    avercli.run();
  }

  async init() {
    const tsConfigSpinner = ora('Copying tsconfig.json').start();
    if (!existsSync(resolve(process.env.PROJECT_PATH, '../tsconfig.json'))) {
      await copy(
        resolve(__dirname, '../templates/tsconfig.json'),
        resolve(process.env.PROJECT_PATH, '../tsconfig.json')
      );
      tsConfigSpinner.succeed();
    } else {
      tsConfigSpinner.info('Skipping because tsconfig.json already exists.');
    }

    const tsConfigServerSpinner = ora('Copying tsconfig.server.json').start();
    if (!existsSync(resolve(process.env.PROJECT_PATH, '../tsconfig.server.json'))) {
      await copy(
        resolve(__dirname, '../templates/tsconfig.server.json'),
        resolve(process.env.PROJECT_PATH, '../tsconfig.server.json')
      );
      tsConfigServerSpinner.succeed();
    } else {
      tsConfigServerSpinner.info('Skipping because tsconfig.server.json already exists.');
    }
  }
}