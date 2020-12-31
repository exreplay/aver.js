import Command, { CommandInterface } from './command';
import Core from '@averjs/core';

export default class DevCommand extends Command implements CommandInterface {
  name = 'dev';
  description = 'Start aver in development mode.';

  async run() {
    if (typeof process.env.NODE_ENV === 'undefined')
      process.env.NODE_ENV = 'development';

    const core = new Core();
    await core.run();
  }
}
