import parseArgs, { ParsedArgs } from 'minimist';
import AverCli from '@averjs/cli';
import TypescriptInitCommand from './ts-init';

interface AvailableCommands extends ParsedArgs {
  init?: boolean;
}

export default class CLI {
  argv: AvailableCommands = parseArgs(process.argv.slice(2));
  avercli: AverCli;

  constructor() {
    this.avercli = new AverCli();
    this.avercli.addCommand(new TypescriptInitCommand());
  }
}
