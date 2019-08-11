import Command from './command';
import Init from '@averjs/init';

export default class InitCommand extends Command {
  constructor() {
    super();
    
    this.name = 'init';
    this.description = 'Initialize the project by creating all necessary files in the working directory.';
  }

  run() {
    const init = new Init();
    init.run();
  }
}
