import fs from 'fs';
import path from 'path';
import { rollup, watch } from 'rollup';
import RollupConfig from './rollup.config';
import ora from 'ora';
import logSymbols from 'log-symbols';
import { exec, ReleaseType } from './utils';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';

export interface LernaPackage {
  name: string;
  version: string;
  private: boolean;
  location: string;
}

export default class Build {
  watch: boolean;
  releaseType: ReleaseType;
  packagesToBuild: RollupConfig[] = [];
  onlyBuild: string[];

  constructor(
    watch = false,
    releaseType: ReleaseType = 'auto',
    onlyBuild: string[] = []
  ) {
    this.watch = watch;
    this.releaseType = releaseType;
    this.onlyBuild = onlyBuild;
  }

  async determinePackages() {
    const { stdout } = await exec('lerna', ['list', '--json']);
    const packages = (JSON.parse(stdout) as LernaPackage[]).filter(p =>
      this.onlyBuild.length > 0
        ? this.onlyBuild.includes(p.name.replace('@averjs/', ''))
        : true
    );
    const averPackages = packages.map(p => p.name);

    console.log(averPackages);

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

            default:
              return console.log(JSON.stringify(event));
          }
        });
      } else {
        const buildSpinner = ora(`Building package ${pkg.pkg.name}`).start();
        const bundle = await rollup(config);
        if (config.output && !Array.isArray(config.output))
          await bundle.write(config.output);

        const extractorConfigPath = path.resolve(
          pkg.path,
          './api-extractor.json'
        );
        if (fs.existsSync(extractorConfigPath)) {
          buildSpinner.text = `Rollup types for ${pkg.pkg.name}`;
          const extractorConfig = ExtractorConfig.loadFileAndPrepare(
            extractorConfigPath
          );
          Extractor.invoke(extractorConfig, {
            localBuild: true,
            showVerboseMessages: true
          });
          fs.rmdirSync(path.resolve(pkg.path, './dist/packages'), {
            recursive: true
          });
        }

        buildSpinner.succeed(`Built package ${pkg.pkg.name} successfully`);
      }
    }
  }
}
