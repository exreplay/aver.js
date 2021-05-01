import Command from '../lib/commands/command';

export default class TestCommand extends Command {
  name = 'test';
  args = [
    {
      name: 'test-arg',
      type: Boolean,
      description: 'Test argument'
    }
  ];

  aliases = ['t'];

  description = 'Testcommand for unit tests.';

  run() {
    console.log('run executed');
  }
}
