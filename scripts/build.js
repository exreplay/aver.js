import fs from 'fs';
import path from 'path';
import { rollup, watch } from 'rollup';
import RollupConfig from './rollup.config';
import ora from 'ora';
import logSymbols from 'log-symbols';
import { exec } from './utils';

export default class Build {
  constructor(watch = false) {
    this.watch = watch;
    this.packagesToBuild = [];
  }

  async determinePackages() {
    const { stdout } = await exec('lerna', 'list', '--json');
    const packages = JSON.parse(stdout);
    for (const pkg of packages) {
      const pkgJSON = JSON.parse(fs.readFileSync(path.join(pkg.location, 'package.json'), 'utf-8'));
      if (pkgJSON.aver && pkgJSON.aver.build) {
        this.packagesToBuild.push(
          new RollupConfig(pkgJSON, pkg.location)
        );
      }
    }
  }

  async run() {
    const spinner = ora('Collection informations for all packages in mono repo.').start();
    await this.determinePackages();
    spinner.succeed();

    console.log(logSymbols.info, 'Building packages with aver.build set to true in package.json');
    for (const pkg of this.packagesToBuild) {
      const config = await pkg.config();

      if (this.watch) {
        const watchSpinner = ora();
        const bundle = watch(config);
        bundle.on('event', event => {
          switch (event.code) {
          case 'START':
            watchSpinner.start();
            watchSpinner.text = `${pkg.pkg.name}: watching for changes`;
            break;

          case 'BUNDLE_START':
            watchSpinner.text = `${pkg.pkg.name}: building`;
            break;

          case 'BUNDLE_END':
            watchSpinner.succeed(`${pkg.pkg.name}: built`);
            break;

          case 'END':
            break;

          case 'ERROR':
            return console.log(event.error);

          case 'FATAL':
            return console.log(event.error);

          default:
            return console.log(JSON.stringify(event));
          }
        });
      } else {
        const buildSpinner = ora(`Building package ${pkg.pkg.name}`).start();
        const bundle = await rollup(config);
        bundle.write(config.output);
        buildSpinner.succeed();
      }
    }
  }
}
