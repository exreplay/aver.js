#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import ora from 'ora';
import Build from './build';
import { getNextVersion, exec } from './utils';

export default class Release {
  constructor() {
    this.newVersion = null;
    this.releaseTypes = [ {
      name: 'Let lerna automatically determine a new release version',
      value: 'auto',
      short: 'Automatic release type'
    }, 'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease' ];
  }

  async run() {
    const { type } = await inquirer.prompt([
      {
        name: 'type',
        message: 'Select release Type',
        type: 'list',
        choices: this.releaseTypes
      }
    ]);

    this.newVersion = await getNextVersion(type);

    const { release } = await inquirer.prompt([
      {
        name: 'release',
        message: `You are about to release the new version '${this.newVersion}'.`,
        type: 'confirm'
      }
    ]);

    if (release) {
      if (await this.gitBranch() !== 'feat/rollup') {
        console.log(
          logSymbols.warning,
          chalk.bold.red(
            `You are not in the 'development' branch! Please switch.`
          )
        );
      } else {
        try {
          const build = new Build(false, type);
          await build.run();
          // this.createReleaseBranch();
          // this.preReleaseSync();
          // this.createNewRelease();
          console.log(
            logSymbols.success,
            chalk.bold.green(
              `Successfully created new release in branch 'release/${this.newVersion}'.`
            )
          );
        } catch (err) {
          console.error(err);
        }
      }
    }
  }

  async createReleaseBranch() {
    const branch = await this.gitBranch();
    const spinner = ora(`Creating new release branch 'release/${this.newVersion}'.`).start();

    try {
      await exec('git', 'checkout', '-b', `release/${this.newVersion}`, branch);
    } catch (err) {
      return spinner.fail(err.stderr);
    }

    spinner.succeed();
  }

  async preReleaseSync() {
    const spinner = ora(`Pre release sync`).start();
    
    try {
      await exec('git', 'add', '-A');
      await exec('git', 'commit', '-m', `chore: pre release sync`);
    } catch (err) {
      return spinner.fail(err.stderr);
    }

    spinner.succeed();
  }

  async createNewRelease() {
    const spinner = ora(`Creating new release '${this.newVersion}' without pushing.`).start();

    try {
      await exec('yarn', 'lerna', 'version', '--no-push', '-y');
    } catch (err) {
      return spinner.fail(err.stderr);
    }
    spinner.succeed();
  }

  async gitBranch() {
    const { stdout } = await exec('git', 'rev-parse', '--abbrev-ref', 'HEAD');
    return stdout;
  }
}
