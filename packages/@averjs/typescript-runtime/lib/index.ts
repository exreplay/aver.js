import parseArgs, { ParsedArgs } from 'minimist';
import AverCli from '@averjs/cli';
import TypescriptInitCommand from './ts-init';

interface AvailableCommands extends ParsedArgs {
  init?: boolean
}

export default class CLI {
  argv: AvailableCommands = parseArgs(process.argv.slice(2));
  
  async run() {
    const avercli = new AverCli();
    avercli.addCommand(new TypescriptInitCommand());
    avercli.run();
  }
}