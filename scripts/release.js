#!/usr/bin/env node

import lernaJson from '../lerna.json';
import conventionalRecommendedBump from 'conventional-recommended-bump';
import pify from 'pify';
import spawn from 'cross-spawn';
import inquirer from 'inquirer';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import semver from 'semver';
import ora from 'ora';

export default class Release {
  constructor() {
    this.currentVersion = lernaJson.version;
    this.newVersion = null;
  }

  async run() {
    this.newVersion = await this.getNextVersion();

    const { release } = await inquirer.prompt([
      {
        type: 'confirm',
        message: `You are about to release the new version '${this.newVersion}'.`,
        name: 'release'
      }
    ]);

    if (release) {
      if (this.gitBranch() !== 'development') {
        console.log(
          logSymbols.warning,
          chalk.bold.red(
            `You are not in the 'development' branch! Please switch.`
          )
        );
      } else {
        try {
          this.createReleaseBranch();
          this.preReleaseSync();
          this.createNewRelease();
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

  createReleaseBranch() {
    const branch = this.gitBranch();
    const spinner = ora(`Creating new release branch 'release/${this.newVersion}'.`).start();
    this.exec('git', 'checkout', '-b', `release/${this.newVersion}`, branch);
    spinner.succeed();
  }

  preReleaseSync() {
    const spinner = ora(`Pre release sync`).start();
    this.exec('git', 'add', '-A');
    this.exec('git', 'commit', '-m', `chore: pre release sync`);
    spinner.succeed();
  }

  createNewRelease() {
    const spinner = ora(`Creating new release '${this.newVersion}' without pushing.`).start();
    const { error } = this.exec('yarn', 'lerna', 'version', '--no-push', '-y');
    if (error) {
      spinner.fail();
      throw new Error(error);
    }
    spinner.succeed();
  }
  
  async getNextVersion() {
    try {
      const { releaseType } = await pify(conventionalRecommendedBump)({
        preset: 'angular'
      });
  
      return semver.valid(releaseType) || semver.inc(this.currentVersion, releaseType);
    } catch (err) {
      throw err;
    }
  }

  exec(command, ...args) {
    const r = spawn.sync(command, args);
    const composedCommand = command + ' ' + [ ...args ].join(' ');

    return {
      error: r.error,
      stdout: String(r.stdout).trim(),
      stderr: String(r.stderr).trim(),
      composedCommand
    };
  }

  gitBranch() {
    const { stdout } = this.exec('git', 'rev-parse', '--abbrev-ref', 'HEAD');
    return stdout;
  }
}
