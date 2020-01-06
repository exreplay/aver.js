import Command from '../lib/commands/command';

export default class TestCommand extends Command {
  constructor() {
    super();

    this.name = 'test';
    this.args = [
      {
        name: 'test-arg',
        type: Boolean,
        description: 'Test argument'
      }
    ];
    this.aliases = [
      't'
    ];
    this.description = 'Testcommand for unit tests.';
  }

  run() {
    console.log('run executed');
  }
}
