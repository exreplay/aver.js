/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import merge from 'lodash/merge';

export default class Init {
  appDir = path.resolve(__dirname, '../app');

  run() {
    this.createSrcDir();

    console.log('Copying necessary files...');

    this.copyFile('.eslintignore');
    this.copyFile('.eslintrc.js');
    this.copyFile('aver-config.js');
    this.copyFile('_.gitignore', true);
    this.copyFile('jsconfig.json');
    this.copyFile('.env.example');

    console.log('Creating api directories...');

    this.createApiDir();
    this.createApiDir('database');
    this.createApiDir('database/seeds');
    this.createApiDir('errors');
    this.createApiDir('mail');
    this.createApiDir('mail/templates');
    this.createApiDir('middlewares');
    this.createApiDir('models');
    this.createApiDir('queues');
    this.createApiDir('routes');

    this.writeFile(
      './api/routes/index.js',
      this.trimLines(`
        import app from 'express';

        const router = app.Router();

        module.exports = router;
    `)
    );

    this.writeFile(
      './api/middlewares/index.js',
      this.trimLines(`
        import app from 'express';

        const router = app.Router();

        module.exports = router;
    `)
    );

    this.modifyPackageJson();

    console.log('Project setup successfull!');
  }

  modifyPackageJson() {
    const spinner = ora('Modifying package.json').start();
    const corePackageJSON = require(path.resolve(
      this.appDir,
      './package.json'
    ));
    const packageJSONPath = path.resolve(
      process.env.PROJECT_PATH,
      '../package.json'
    );
    const packageJSON = require(packageJSONPath);

    fs.writeFileSync(
      packageJSONPath,
      JSON.stringify(merge(corePackageJSON, packageJSON), null, 2)
    );
    spinner.succeed('Successfully modified package.json!');
  }

  writeFile(file: string, data: string) {
    const spinner = ora(`Writing file "${file}"`).start();
    const destination = path.resolve(process.env.PROJECT_PATH, '../', file);

    if (!fs.existsSync(destination)) {
      fs.writeFileSync(
        path.resolve(process.env.PROJECT_PATH, '../', file),
        data
      );
      spinner.succeed(`File "${file}" successfully written!`);
    } else {
      spinner.info(`File "${file}" already exists`);
    }
  }

  copyFile(file: string, removeUnderscore = false) {
    const spinner = ora(`Copying "${file}"`).start();
    const destinationFile = removeUnderscore ? file.replace(/^_/g, '') : file;
    const destination = path.resolve(
      process.env.PROJECT_PATH,
      `../${destinationFile}`
    );

    if (!fs.existsSync(destination)) {
      fs.copyFileSync(path.resolve(this.appDir, `./${file}`), destination);
      spinner.succeed(`File "${file}" successfully copied!`);
    } else {
      spinner.info(`File "${file}" already exists`);
    }
  }

  createSrcDir() {
    const srcSpinner = ora('Creating "src" directory').start();

    if (fs.existsSync(process.env.PROJECT_PATH)) {
      srcSpinner.info('Root directory "src" already exists');
    } else {
      fs.copySync(
        path.resolve(this.appDir, './src'),
        process.env.PROJECT_PATH,
        { recursive: true }
      );
      srcSpinner.succeed('Root directory successfully copied!');
    }
  }

  createApiDir(dir?: string) {
    const spinner = ora(`Creating "${dir || ''}" directory`).start();
    const dirPath = path.resolve(process.env.API_PATH, dir ? `./${dir}` : '');

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
      spinner.succeed(`Directory "${dir || 'api'}" successfully created!`);
    } else {
      spinner.info(`Directory "${dir || 'api'}" already exists`);
    }
  }

  trimLines(s: string) {
    const lines = s.split('\n');
    const trimmedLines = [];

    for (const line of lines) {
      const newLine = line.trim();
      trimmedLines.push(newLine);
    }

    return trimmedLines.join('\n').trimLeft();
  }
}
