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
    this.availableCommands[command.name] = command;

    for (const alias of command.aliases) {
      this.aliases[alias] = command.name;

      // Register aliases for command options
      for (const argAlias of command.args) {
        this.aliases[argAlias.alias] = argAlias.name;
      }
    }
  }
  
  async run() {
    const help = this.argv._[0] === 'help' || this.argv.help;
    const executedCommand = this.argv._[0] || (!help && 'dev');
    const commandToExecute = this.availableCommands[executedCommand];

    const globalCommand = this.availableCommands['help'].args.find(option => {
      return this.argv[option.name];
    });

    // If a global option is found, execute it and stop afterwards
    if (globalCommand) {
      globalCommand.command.run();
      return;
    }

    try {
      // No matter how help is set, do not run the actual command, instead show default help or for specified command
      if (help) await this.availableCommands['help'].run(executedCommand !== 'help' && commandToExecute);
      else await commandToExecute.run(this.argv);
    } catch (err) {
      console.error(err);
    }
  }
}
