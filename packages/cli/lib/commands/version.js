import path from 'path';
import Command from './command';

export default class VersionCommand extends Command {
  constructor() {
    super();

    this.name = 'version';
    this.alias = 'v';
    this.type = Boolean;
    this.description = 'Show the current installed aver.js version.';
  }

  run() {
    const pkg = require(path.resolve(require.resolve('@averjs/cli'), '../../package.json'));
    console.log('v' + pkg.version);
  }
}
