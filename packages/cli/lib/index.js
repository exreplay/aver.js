import HelpCommand from './commands/help';
import DevCommand from './commands/dev';
import InitCommand from './commands/init';
import BuildCommand from './commands/build';
import parseArgs from 'minimist';

export default class Usage {
  constructor() {
    this.aliases = {};
    this.availableCommands = [];

    this.addCommand(new HelpCommand(this.availableCommands));
    this.addCommand(new DevCommand());
    this.addCommand(new InitCommand());
    this.addCommand(new BuildCommand());

    this.argv = parseArgs(process.argv.slice(2), {
      alias: this.aliases
    });
  }

  addCommand(command) {
    this.availableCommands.push(command);

    for (const alias of command.aliases) {
      this.aliases[alias] = command.name;
    }
  }
  
  async run() {
    for (const command of this.availableCommands) {
      if (this.argv._.indexOf(command.name) !== -1) {
        try {
          await command.run();
        } catch (err) {
          console.error(err);
        }
        break;
      }
    }
  }
}