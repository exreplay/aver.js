import Command from './command';
import commandLineUsage from 'command-line-usage';

export default class HelpCommand extends Command {
  constructor(commands = []) {
    super();

    this.name = 'help';
    this.aliases = [
      'h'
    ];
    this.description = 'Shows this help or for a specific command.';
    this.commands = commands;
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

  generateCommandLineUsage() {
    return commandLineUsage([
      {
        content: this.getLogo(),
        raw: true
      },
      {
        header: 'Available Commands',
        content: this.commands.map(command => ({
          name: command.name,
          summary: command.description
        }))
      }
    ]);
  }

  run() {
    console.log(this.generateCommandLineUsage());
  }
}
