import Command, { CommandInterface } from './command';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Core from '@averjs/core';

export default class DevCommand extends Command implements CommandInterface {
  name = 'dev';
  description = 'Start aver in development mode.';

  run() {
    if (typeof process.env.NODE_ENV === 'undefined') process.env.NODE_ENV = 'development';

    const core = new Core();
    core.run();
  }
}
