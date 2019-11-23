import AverCli from '../lib';
import Core, { mockRun } from '@averjs/core';
jest.mock('@averjs/core');

const OLD_ARGV = [ ...process.argv ];
const OLD_ENV = { ...process.env };
let outputData = '';

beforeEach(function() {
  Core.mockClear();
  mockRun.mockClear();

  outputData = '';
  console['log'] = jest.fn(inputs => (outputData = inputs));
  console['error'] = jest.fn(inputs => (outputData = inputs));

  process.argv = [ ...OLD_ARGV ];
  process.env = { ...OLD_ENV };
});

test('help command should output command description', async() => {
  process.argv.push('prod', '--h');

  const cli = new AverCli();
  await cli.run();
  expect(outputData).toMatch('Start aver in production mode.');
});

test('run should execute core run', async() => {
  process.argv.push('prod');

  const cli = new AverCli();
  await cli.run();

  expect(mockRun.mock.calls.length).toBe(1);
});

test('run should set NODE_ENV to "production" when not set', async() => {
  process.argv.push('prod');

  delete process.env.NODE_ENV;

  const cli = new AverCli();
  await cli.run();

  expect(process.env.NODE_ENV).toBe('production');
});
