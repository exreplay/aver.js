import Command from './command';
import Core from '@averjs/core';

export default class DevCommand extends Command {
  constructor() {
    super();

    this.name = 'dev';
    this.description = 'Start averjs in development mode.';
  }

  run() {
    if (typeof process.env.NODE_ENV === 'undefined') process.env.NODE_ENV = 'development';

    const core = new Core();
    core.run();
  }
}
