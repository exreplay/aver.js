import Cli from '../lib';
import TypescriptInitCommand from '../lib/ts-init';

describe('typescript runtime plugin', () => {
  it('should register the typescript init command', () => {
    const cli = new Cli();
    expect(cli.avercli.availableCommands['ts-init']).toBeInstanceOf(
      TypescriptInitCommand
    );
  });
});
