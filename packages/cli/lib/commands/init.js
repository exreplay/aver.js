import Command from './command';
import Core from '@averjs/core';

export default class InitCommand extends Command {
  constructor() {
    super();
    
    this.name = 'init';
    this.description = 'Initialize the project by creating all necessary files in the working directory.';
  }

  run() {
    const core = new Core();
    core.init();
  }
}
