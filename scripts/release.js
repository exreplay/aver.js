#!/usr/bin/env node

import lernaJson from '../lerna.json';
import conventionalRecommendedBump from 'conventional-recommended-bump';
import pify from 'pify';
import Listr from 'listr';
import spawn from 'cross-spawn';
import inquirer from 'inquirer';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import semver from 'semver';

export default class Release {
  constructor() {
    this.currentVersion = lernaJson.version;
    this.newVersion = null;

    this.tasks = new Listr([
      {
        title: `Bump version with lerna`,
        task: this.lernaVersion.bind(this)
      }
    ]);
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
        await this.tasks.run();
  
        console.log(
          logSymbols.success,
          chalk.bold(
            `Finished preparing for new release. If you are happy with everything, merge the 'release/${this.newVersion}' branch into master.`
          )
        );
      
        const { revert } = await inquirer.prompt([
          {
            type: 'confirm',
            message: `Or do you want to revert this release?`,
            name: 'revert',
            default: false
          }
        ]);
  
        if (revert) {
          this.exec('git', 'checkout', 'master');
          this.exec('git', 'branch', '-D', `release/${this.newVersion}`);
          this.exec('git', 'tag', '-d', `v${this.newVersion}`);
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

  lernaVersion() {
    const { stdout, stderr } = this.exec('yarn', 'lerna', 'publish', '--force-publish');
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
