import Command, { CommandInterfaceDictionary, CommandInterface } from './command';
import commandLineUsage, { Section } from 'command-line-usage';
import VersionCommand from './version';

export default class HelpCommand extends Command implements CommandInterface {
  name = 'help';
  aliases = [
    'h'
  ];

  description = 'Shows this help or for a specific command.';
  commands: CommandInterfaceDictionary = {};

  constructor(commands: CommandInterfaceDictionary) {
    super();
    this.commands = commands;
    this.addArg(new VersionCommand());
  }

  addArg(command: CommandInterface) {
    this.args.push(
      {
        name: command.name,
        alias: command.alias || '',
        type: command.type,
        description: command.description,
        command
      }
    );
  }

  getLogo() {
    return `
.........\\\\~~~~~\\\\....../~~~~\\\\....../~~~~~/.........
..........\\\\     \\\\..../      \\\\..../     /..........
...........\\\\     \\\\~~/        \\\\~~/     /........... 
............\\\\     \\\\/          \\\\/     /............
.............\\\\    /     /\\\\     \\\\    /.............
..............\\\\  /     /  \\\\     \\\\  /..............  {bold.underline aver.js-CLI}
...............\\\\/     /    \\\\     \\\\/...............
.............../     /      \\\\     \\\\...............  The cli tool for aver.js
............../     / \\\\    / \\\\     \\\\..............
............./     /   \\\\~~/   \\\\     \\\\.............  Usage: \`aver <command> [options ...]\`
............/     /\\\\         /.\\\\     \\\\............
.........../     /..\\\\       /...\\\\     \\\\...........
........../     /....\\\\     /.....\\\\     \\\\..........
........./     /......\\\\   /.......\\\\     \\\\.........
......../~~~~~/........\\\\ /.........\\\\~~~~~\\\\........
    `.trim();
  }

  generateCommandLineUsage(command?: CommandInterface) {
    const cmd: Section[] = [];
    const head = command
      ? {
        header: `aver ${command.name}`,
        content: command.description
      }
      : {
        content: this.getLogo(),
        raw: true
      };

    cmd.push(head);

    if (!command) {
      cmd.push({
        header: 'Available Commands',
        content: Object.keys(this.commands).map(key => ({
          name: this.commands[key].name,
          summary: this.commands[key].description
        }))
      });
    } else {
      cmd.push({
        header: 'Command Options',
        optionList: command.args
      });
    }

    cmd.push({
      header: 'Global Commands',
      optionList: [
        {
          name: this.name,
          alias: this.aliases[0],
          description: this.description
        },
        ...this.args
      ]
    });

    return commandLineUsage(cmd);
  }

  run(command?: CommandInterface) {
    console.log(this.generateCommandLineUsage(command));
  }
}
