import fs from 'fs';
import path from 'path';
import { rollup, watch } from 'rollup';
import RollupConfig from './rollup.config';
import ora from 'ora';
import logSymbols from 'log-symbols';
import { exec } from './utils';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';

export default class Build {
  constructor(watch = false, releaseType = 'auto') {
    this.watch = watch;
    this.releaseType = releaseType;
    this.packagesToBuild = [];
  }

  async determinePackages() {
    const { stdout } = await exec('lerna', ['list', '--json']);
    const packages = JSON.parse(stdout);
    const averPackages = packages.map(p => p.name);
    for (const pkg of packages) {
      const pkgJSON = JSON.parse(
        fs.readFileSync(path.join(pkg.location, 'package.json'), 'utf-8')
      );
      if (pkgJSON.aver && pkgJSON.aver.build) {
        this.packagesToBuild.push(
          new RollupConfig(
            { ...pkgJSON, location: pkg.location },
            this.watch ? null : this.releaseType,
            averPackages
          )
        );
      }
    }
  }

  async run() {
    const spinner = ora(
      'Collection informations for all packages in monorepo.'
    ).start();
    await this.determinePackages();
    spinner.succeed();

    console.log(
      logSymbols.info,
      'Building packages with aver.build set to true in package.json'
    );
    const watchSpinner = ora();
    for (const pkg of this.packagesToBuild) {
      const config = await pkg.config();

      if (this.watch) {
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

        const extractorConfigPath = path.resolve(
          pkg.path,
          './api-extractor.json'
        );
        if (fs.existsSync(extractorConfigPath)) {
          const extractTypesSpinner = ora(
            `Rollup types for ${pkg.pkg.name}`
          ).start();
          const extractorConfig = ExtractorConfig.loadFileAndPrepare(
            extractorConfigPath
          );
          Extractor.invoke(extractorConfig, {
            localBuild: true,
            showVerboseMessages: true
          });
          extractTypesSpinner.succeed();
        }
      }
    }
  }
}
