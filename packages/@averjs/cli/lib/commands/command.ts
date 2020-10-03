import { ParsedArgs } from 'minimist';
import { OptionDefinition } from 'command-line-usage';

export interface CommandInterface {
  name: string;
  description: string;
  type?: BooleanConstructor;
  args?: Args[];
  alias?: string;
  aliases?: string[];
  run(...args: unknown[]): Promise<void> | void;
  generateCommandLineUsage?(...args: unknown[]): void
}

export interface Args extends OptionDefinition {
  command?: CommandInterface;
}

export interface CommandInterfaceDictionary {
  [arg: string]: CommandInterface;
}

/**
 * This class serves as an interface
 */
export default class Command {
  args: Args[] = [];

  /**
   * Returns an object which holds all passed arguments from the cli.
   * TODO: Parse numbers or strings when passed. Currently only return boolean.
   * @param {*} argv
   */
  parseArgs(argv: ParsedArgs) {
    return this.args.filter(arg => {
      return argv[arg.name];
    }).reduce((prev, cur) => {
      prev[cur.name] = true;
      return prev;
    }, {} as ParsedArgs);
  }
}
