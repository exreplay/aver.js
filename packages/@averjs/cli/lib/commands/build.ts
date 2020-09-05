import Command, { CommandInterface } from './command';
import { ParsedArgs } from 'minimist';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Core from '@averjs/core';

export default class BuildCommand extends Command implements CommandInterface {
  name = 'build';
  args = [
    {
      name: 'static',
      type: Boolean,
      description: 'Generate static files.'
    }
  ];
  description = 'Build for production usage.';

  async run(argv: ParsedArgs) {
    if (typeof process.env.NODE_ENV === 'undefined') process.env.NODE_ENV = 'production';

    const core = new Core();
    await core.build(this.parseArgs(argv));
  }
}
