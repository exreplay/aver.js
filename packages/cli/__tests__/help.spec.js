import AverCli from '../lib';
import TestCommand from '../__fixtures__/TestCommand';

const OLD_ARGV = [ ...process.argv ];
let outputData = '';

beforeEach(function() {
  outputData = '';
  console['log'] = jest.fn(inputs => (outputData = inputs));
  console['error'] = jest.fn(inputs => (outputData = inputs));

  process.argv = [ ...OLD_ARGV ];
});

test('help should have the available commands header set', async() => {
  process.argv.push('help');

  const cli = new AverCli();
  await cli.run();
  expect(outputData).toMatch('Available Commands');
});

test('help for specific command should list the command options', async() => {
  process.argv.push('test', '-h');

  const cli = new AverCli();
  cli.addCommand(new TestCommand());
  await cli.run();
  expect(outputData).toMatch('Command Options');
  expect(outputData).toMatch('--test-arg');
});

test('help should always show global commands', async() => {
  process.argv.push('test', '-h');

  let cli = new AverCli();
  cli.addCommand(new TestCommand());
  await cli.run();
  expect(outputData).toMatch('Global Commands');
  expect(outputData).toMatch('--version');

  process.argv = [ ...OLD_ARGV ];
  process.argv.push('help');

  cli = new AverCli();
  await cli.run();

  expect(outputData).toMatch('Global Commands');
  expect(outputData).toMatch('--version');
});
