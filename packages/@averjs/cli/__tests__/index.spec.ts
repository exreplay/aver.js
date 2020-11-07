import AverCli from '../lib';
import HelpCommand from '../lib/commands/help';
import TestCommand from '../__fixtures__/TestCommand';
import FailingCommand from '../__fixtures__/FailingCommand';

let outputData = '';
const tmpProcessArgv = [...process.argv];

function resetArgv() {
  process.argv = [...tmpProcessArgv];
}

beforeEach(() => {
  outputData = '';
  const storeLog = (inputs: string) => (outputData = inputs);
  console.log = jest.fn(storeLog);
  console.error = jest.fn(storeLog);
});

afterEach(() => {
  resetArgv();
});

test('cli should at least have the help command', () => {
  const cli = new AverCli();
  expect(cli.availableCommands.help).toBeInstanceOf(HelpCommand);
});

test('help getter should identify help arg', () => {
  process.argv.push('help');

  let cli = new AverCli();
  expect(cli.help).toBeTruthy();

  resetArgv();

  process.argv.push('--h');
  cli = new AverCli();
  expect(cli.help).toBeTruthy();
});

test('executedCommand should identify the given command, show help or execute dev when nothing is given', () => {
  process.argv.push('build');

  let cli = new AverCli();
  expect(cli.executedCommand).toBe('build');

  resetArgv();

  cli = new AverCli();
  expect(cli.executedCommand).toBe('dev');

  process.argv.push('--h');
  cli = new AverCli();
  expect(cli.executedCommand).toBe('help');
});

test('global command should be executed', () => {
  process.argv.push('--v');

  const cli = new AverCli();
  expect(cli.globalCommand?.name).toBe('version');

  expect(() => {
    cli.run();
  }).not.toThrow();
});

test('test command should be added correctly and executed', () => {
  process.argv.push('test');

  const cli = new AverCli();
  cli.addCommand(new TestCommand());
  expect(cli.availableCommands.test).toBeInstanceOf(TestCommand);
  expect(cli.aliases).toEqual(expect.objectContaining({ t: 'test' }));

  cli.run();
  expect(outputData).toBe('run executed');
});

test('help should be executed correctly', () => {
  process.argv.push('test', '--h');

  const cli = new AverCli();
  cli.addCommand(new TestCommand());
  cli.run();
  expect(outputData).toMatch('Testcommand for unit tests');
});

test('catch block should be called when comman does not exist', () => {
  process.argv.push('fail');

  const cli = new AverCli();
  cli.addCommand(new FailingCommand());

  try {
    cli.run();
  } catch (err) {
    expect(err).toBe('failing');
  }
});
