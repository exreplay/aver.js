/**
 * This class serves as an interface
 */
export default class Command {
  constructor() {
    this.name = '';
    this.description = '';
    this.aliases = [];
    this.args = [];
  }

  run() {}

  generateCommandLineUsage() {}

  /**
   * Returns an object which holds all passed arguments from the cli.
   * TODO: Parse numbers or strings when passed. Currently only return boolean.
   * @param {*} argv
   */
  parseArgs(argv) {
    return this.args.filter(arg => {
      return argv[arg.name];
    }).reduce((prev, cur) => {
      prev[cur.name] = true;
      return prev;
    }, {});
  }
}
