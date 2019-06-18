import fs from 'fs';
import path from 'path';
import { rollup } from 'rollup';
import RollupConfig from './rollup.config';
import execa from 'execa';

class Build {
  constructor() {
    this.packagesToBuild = [];
  }

  async determinePackages() {
    const { stdout } = await this.exec('lerna', 'list', '--json');
    const packages = JSON.parse(stdout);
    for (const pkg of packages) {
      const pkgJSON = JSON.parse(fs.readFileSync(path.join(pkg.location, 'package.json'), 'utf-8'));
      if (pkgJSON.aver && pkgJSON.aver.build) {
        this.packagesToBuild.push(
          new RollupConfig(pkgJSON, pkg.location).config()
        );
      }
    }
  }

  async run() {
    await this.determinePackages();
    for (const config of this.packagesToBuild) {
      const bundle = await rollup(config);
      await bundle.write(config.output);
    }
  }

  async exec(command, ...args) {
    try {
      const {
        stdout: _stdout,
        stderr: _stderr,
        cmd: composedCommand
      } = await execa(command, args);
  
      return {
        stdout: String(_stdout).trim(),
        stderr: String(_stderr).trim(),
        composedCommand
      };
    } catch (err) {
      console.error(err);
    }
  }
}

new Build().run();
