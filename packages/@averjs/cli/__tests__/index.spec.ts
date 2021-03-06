import AverCli from '../lib';
import HelpCommand from '../lib/commands/help';
import TestCommand from '../__fixtures__/TestCommand';
import FailingCommand from '../__fixtures__/FailingCommand';
import { setProcessArgs } from './utils';

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
  setProcessArgs('help');

  let cli = new AverCli();
  expect(cli.help).toBeTruthy();

  resetArgv();

  setProcessArgs('--h');
  cli = new AverCli();
  expect(cli.help).toBeTruthy();
});

test('executedCommand should identify the given command, show help or execute dev when nothing is given', () => {
  setProcessArgs('build');

  let cli = new AverCli();
  expect(cli.executedCommand).toBe('build');

  resetArgv();
  setProcessArgs();

  cli = new AverCli();
  expect(cli.executedCommand).toBe('dev');

  resetArgv();
  setProcessArgs('--h');

  cli = new AverCli();
  expect(cli.executedCommand).toBe('help');
});

test('global command should be executed', () => {
  setProcessArgs('--v');

  const cli = new AverCli();
  expect(cli.globalCommand?.name).toBe('version');

  expect(async () => {
    await cli.run();
  }).not.toThrow();
});

test('test command should be added correctly and executed', async () => {
  setProcessArgs('test');

  const cli = new AverCli();
  cli.addCommand(new TestCommand());
  expect(cli.availableCommands.test).toBeInstanceOf(TestCommand);
  expect(cli.aliases).toEqual(expect.objectContaining({ t: 'test' }));

  await cli.run();
  expect(outputData).toBe('run executed');
});

test('help should be executed correctly', async () => {
  setProcessArgs('test', '--h');

  const cli = new AverCli();
  cli.addCommand(new TestCommand());
  await cli.run();
  await expect(outputData).toMatch('Testcommand for unit tests');
});

test('catch block should be called when comman does not exist', async () => {
  setProcessArgs('fail');

  const cli = new AverCli();
  cli.addCommand(new FailingCommand());

  try {
    await cli.run();
  } catch (error) {
    expect(error).toBe('failing');
  }
});
