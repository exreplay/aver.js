import AverCli from '../lib';
import TestCommand from '../__fixtures__/TestCommand';
import { setProcessArgs } from './utils';

const OLD_ARGV = [...process.argv];
let outputData = '';

beforeEach(function() {
  outputData = '';
  console.log = jest.fn(inputs => (outputData = inputs));
  console.error = jest.fn(inputs => (outputData = inputs));

  process.argv = [...OLD_ARGV];
});

test('help should have the available commands header set', async () => {
  setProcessArgs('help');

  const cli = new AverCli();
  await cli.run();
  await expect(outputData).toMatch('Available Commands');
});

test('help for specific command should list the command options', async () => {
  setProcessArgs('test', '-h');

  const cli = new AverCli();
  cli.addCommand(new TestCommand());
  await cli.run();
  await expect(outputData).toMatch('Command Options');
  await expect(outputData).toMatch('--test-arg');
});

test('help should always show global commands', async () => {
  setProcessArgs('test', '-h');

  let cli = new AverCli();
  cli.addCommand(new TestCommand());
  await cli.run();
  await expect(outputData).toMatch('Global Commands');
  await expect(outputData).toMatch('--version');

  process.argv = [...OLD_ARGV];
  setProcessArgs('help');

  cli = new AverCli();
  await cli.run();

  await expect(outputData).toMatch('Global Commands');
  await expect(outputData).toMatch('--version');
});
