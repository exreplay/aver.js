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
}
