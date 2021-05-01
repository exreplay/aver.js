import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import logSymbols from 'log-symbols';
import execa from 'execa';
import Release from './release';
import inquirer from 'inquirer';

const OUT_FILE = './verdaccio.out';
const VERDACCIO_FOLDER = './verdaccio';

class ReleaseScript {
  test: boolean;

  constructor(test: boolean) {
    this.test = test;

    if (this.test) {
      this.registerProcessEvents();
    }
  }

  async run() {
    try {
      if (this.test) await this.setupVerdaccio();
      const release = new Release(this.test);
      await release.run();
    } catch (error) {
      console.log(error);
    } finally {
      if (this.test) this.cleanUpVerdaccio();
    }
  }

  setupVerdaccio() {
    const waitingSpinner = ora('Waiting for verdaccio to start. ');
    console.log(logSymbols.info, 'You are running release script in test mode');
    waitingSpinner.start();

    this.cleanUpVerdaccio();
    execa.sync(
      'nohup yarn verdaccio -c ./scripts/verdaccio.yaml &> verdaccio.out &',
      { shell: true }
    );

    return new Promise((resolve) => {
      let verdaccioRunning = false;

      const interval = setInterval(() => {
        if (fs.existsSync(OUT_FILE)) {
          const file = fs.readFileSync(OUT_FILE, 'utf-8');
          verdaccioRunning = file.includes('http address');
        }

        if (verdaccioRunning) {
          clearInterval(interval);
          waitingSpinner.succeed(
            'Verdaccio is running. Continue with release.'
          );
          setTimeout(resolve, 1000);
        }
      }, 250);
    });
  }

  registerProcessEvents() {
    process.on('SIGINT', this.exitHandler.bind(this));
    process.on('exit', this.exitHandler.bind(this));
    process.on('uncaughtException', this.exitHandler.bind(this));
  }

  exitHandler() {
    this.cleanUpVerdaccio();
    // Grep all verdaccio processes and kill them. Exclude the grep process
    console.log(logSymbols.info, 'Cleanup verdaccio processes before exit');
    execa.sync(
      "ps -ef | grep -i 'verdaccio' | grep -v grep | awk '{print $2}' | xargs kill -9",
      { shell: true }
    );
    fs.removeSync(path.resolve(__dirname, './verdaccio'));
    process.exit();
  }

  cleanUpVerdaccio() {
    if (fs.existsSync(OUT_FILE)) fs.removeSync(OUT_FILE);
    if (fs.existsSync(VERDACCIO_FOLDER)) fs.removeSync(VERDACCIO_FOLDER);
  }
}

(async () => {
  if (!process.env.GITHUB_AUTH) {
    console.error(
      'Please provie a GITHUB_AUTH token, otherwise the changelog can not be created. Use export GITHUB_AUTH="token".'
    );
    process.exit(1);
  }

  let test = false;

  for (const arg of process.argv) {
    if (arg === '--test') test = true;
  }

  const script = new ReleaseScript(test);
  await script.run();

  if (test) {
    await inquirer.prompt([
      {
        name: 'exit',
        message:
          'We keep this process up and running so you can have a look at verdaccio to see if everything worked out correctly. Hit enter to exit.',
        type: 'confirm'
      }
    ]);
  }
})();
