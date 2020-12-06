import Command, { CommandInterface } from '../lib/commands/command';

export default class FailingCommand extends Command
  implements CommandInterface {
  name = 'fail';
  description = 'fail';

  run() {
    throw new Error('failing');
  }
}
