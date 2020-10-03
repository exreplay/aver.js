import Command, { CommandInterface } from './command';
import { version } from '@averjs/cli/package.json';

export default class VersionCommand extends Command implements CommandInterface {
  name = 'version';
  alias = 'v';
  description = 'Show the current installed aver.js version.';
  type = Boolean;

  run() {
    console.log('v' + version);
  }
}
