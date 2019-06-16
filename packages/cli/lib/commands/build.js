import Command from './command';
import Renderer from '@averjs/renderer';

export default class BuildCommand extends Command {
  constructor() {
    super();
    
    this.name = 'build';
    this.description = 'Build for production usage.';
  }

  async run() {
    if (typeof process.env.NODE_ENV === 'undefined') process.env.NODE_ENV = 'production';

    const renderer = new Renderer();
    await renderer.compile();
  }
}
