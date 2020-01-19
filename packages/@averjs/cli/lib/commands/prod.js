import Command from './command';
import Core from '@averjs/core';

export default class ProductionCommand extends Command {
  constructor() {
    super();

    this.name = 'prod';
    this.description = 'Start aver in production mode.';
  }

  run() {
    if (typeof process.env.NODE_ENV === 'undefined') process.env.NODE_ENV = 'production';

    const core = new Core();
    core.config._production = true;
    core.run();
  }
}