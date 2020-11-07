#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import ora from 'ora';
import Build from './build';
import { getNextVersion, exec } from './utils';

export default class Release {
  constructor(test = false) {
    this.test = test;
    this.newVersion = null;
    this.releaseTypes = [{
      name: 'Let lerna automatically determine a new release version',
      value: 'auto',
      short: 'Automatic release type'
    }, 'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'];
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
      if (await this.gitBranch() !== 'development' && !this.test) {
        console.log(
          logSymbols.warning,
          chalk.bold.red(
            'You are not in the \'development\' branch! Please switch.'
          )
        );
        process.exit(0);
      } else {
        try {
          const build = new Build(false, type);
          await build.run();
          if (!this.test) {
            // await this.createReleaseBranch();
            await this.preReleaseSync();
          }
          await this.createNewRelease();
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
      await exec('git', ['checkout', '-b', `release/${this.newVersion}`, branch]);
      spinner.succeed();
    } catch (err) {
      spinner.fail(err.stderr);
      throw new Error('Script failed');
    }
  }

  async preReleaseSync() {
    const spinner = ora('Pre release sync').start();
    
    try {
      await exec('git', ['add', '-A']);
      await exec('git', ['commit', '-m', 'chore: pre release sync']);
    } catch {} finally {
      spinner.succeed();
    }
  }

  async createNewRelease() {
    const spinner = ora(`Creating new release '${this.newVersion}' without pushing.`).start();
    let lernaArgs = [
      'publish',
      this.newVersion,
      '--yes',
      '--force-publish'
    ];

    if (this.test) {
      lernaArgs = lernaArgs.concat([
        '--registry',
        'http://localhost:4873',
        '--no-git-tag-version',
        '--no-push'
      ]);
    }

    try {
      await exec('yarn', ['lerna', ...lernaArgs]);
      spinner.succeed();
    } catch (err) {
      spinner.fail(err.stderr);
      throw new Error('Script failed');
    }
  }

  async gitBranch() {
    const { stdout } = await exec('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
    return stdout;
  }
}
