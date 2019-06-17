import HelpCommand from './commands/help';
import DevCommand from './commands/dev';
import InitCommand from './commands/init';
import BuildCommand from './commands/build';
import ProductionCommand from './commands/prod';
import parseArgs from 'minimist';

export default class Usage {
  constructor() {
    this.aliases = {};
    this.availableCommands = [];

    this.addCommand(new HelpCommand(this.availableCommands));
    this.addCommand(new DevCommand());
    this.addCommand(new ProductionCommand());
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
    const executedCommand = this.argv._[0] || 'dev';
    for (const command of this.availableCommands) {
      if (executedCommand === command.name) {
        try {
          await command.run(this.argv);
        } catch (err) {
          console.error(err);
        }
        break;
      }
    }
  }
}
