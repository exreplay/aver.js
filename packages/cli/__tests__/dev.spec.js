import AverCli from '../lib';
import Core, { mockRun } from '../__mocks__/@averjs/core';

const OLD_ARGV = [ ...process.argv ];
const OLD_ENV = { ...process.env };
let outputData = '';

beforeEach(function() {
  outputData = '';
  console['log'] = jest.fn(inputs => (outputData = inputs));
  console['error'] = jest.fn(inputs => (outputData = inputs));

  process.argv = [ ...OLD_ARGV ];
  process.env = { ...OLD_ENV };
});

test('help command should output command description', async() => {
  process.argv.push('dev', '--h');

  const cli = new AverCli();
  await cli.run();
  expect(outputData).toMatch('Start aver in development mode.');
});

test('run should execute core run', async() => {
  process.argv.push('dev');

  // eslint-disable-next-line no-unused-vars
  const core = new Core();
  const cli = new AverCli();
  await cli.run();

  expect(mockRun).toHaveBeenCalledTimes(1);
});

test('run should set NODE_ENV to "development" when not set', async() => {
  process.argv.push('dev');

  delete process.env.NODE_ENV;

  // eslint-disable-next-line no-unused-vars
  const core = new Core();
  const cli = new AverCli();
  await cli.run();

  expect(process.env.NODE_ENV).toBe('development');
});
