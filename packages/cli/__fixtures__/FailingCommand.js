import Command from '../lib/commands/command';

export default class FailingCommand extends Command {
  constructor() {
    super();

    this.name = 'fail';
  }

  run() {
    throw new Error('failing');
  }
}
