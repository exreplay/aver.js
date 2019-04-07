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
          chalk.bold().red(
            `You are not in the 'development' branch! Please switch.`
          )
        );
      } else {
        const releaseSpinner = ora(`Releasing version '${this.newVersion}'.`).start();
        try {
          this.release();
          releaseSpinner.succeed(`Finished releasing new version '${this.newVersion}'`);
        } catch (e) {
          releaseSpinner.fail(e.message);
        }
      }
    }
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

  release() {
    const { stdout, stderr } = this.exec('yarn', 'lerna', 'publish', '--force-publish', '-y');
    if (stderr) throw new Error(stderr);
  }

  exec(command, ...args) {
    const r = spawn.sync(command, args);
    const composedCommand = command + ' ' + [ ...args ].join(' ');

    return {
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
