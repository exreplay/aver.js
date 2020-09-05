import Command, { CommandInterface } from './command';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Core from '@averjs/core';

export default class ProductionCommand extends Command implements CommandInterface {
  name = 'prod';
  description = 'Start aver in production mode.';

  run() {
    if (typeof process.env.NODE_ENV === 'undefined') process.env.NODE_ENV = 'production';

    const core = new Core();
    core.config._production = true;
    core.run();
  }
}
