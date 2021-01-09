import Command, { CommandInterface } from './command';
import Core from '@averjs/core';

export default class ProductionCommand extends Command
  implements CommandInterface {
  name = 'prod';
  description = 'Start aver in production mode.';

  async run() {
    if (typeof process.env.NODE_ENV === 'undefined')
      process.env.NODE_ENV = 'production';

    const core = new Core();
    core.config._production = true;
    await core.run();
  }
}
