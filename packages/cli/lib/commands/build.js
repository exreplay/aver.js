import Command from './command';
import Renderer from '@averjs/renderer';

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

    const renderer = new Renderer(this.parseArgs(argv));
    await renderer.compile();
  }
}
