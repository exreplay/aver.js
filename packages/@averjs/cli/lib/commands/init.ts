import Command, { CommandInterface } from './command';
import Init from '@averjs/init';

export default class InitCommand extends Command implements CommandInterface {
  name = 'init';
  description =
    'Initialize the project by creating all necessary files in the working directory.';

  async run() {
    const init = new Init();
    await init.run();
  }
}
