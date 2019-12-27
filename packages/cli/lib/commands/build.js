import Command from './command';
import Core from '@averjs/core';

export default class BuildCommand extends Command {
  constructor() {
    super();
    
    this.name = 'build';
    this.args = [
      {
        name: 'static',
        type: Boolean,
        description: 'Generate static files.'
      }
    ];
    this.description = 'Build for production usage.';
  }

  async run(argv) {
    if (typeof process.env.NODE_ENV === 'undefined') process.env.NODE_ENV = 'production';

    const core = new Core();
    await core.build(this.parseArgs(argv));
  }
}
