import AverCli from '../lib';
import Core, { mockInit } from '../__mocks__/@averjs/core';

const OLD_ARGV = [ ...process.argv ];
let outputData = '';

beforeEach(function() {
  outputData = '';
  console['log'] = jest.fn(inputs => (outputData = inputs));
  console['error'] = jest.fn(inputs => (outputData = inputs));

  process.argv = [ ...OLD_ARGV ];
});

test('help command should output command description', async() => {
  process.argv.push('init', '--h');

  const cli = new AverCli();
  await cli.run();
  expect(outputData).toMatch('Initialize the project by creating all necessary files in the working');
});

test('run should execute core init', async() => {
  process.argv.push('init');

  // eslint-disable-next-line no-unused-vars
  const core = new Core();
  const cli = new AverCli();
  await cli.run();

  expect(mockInit).toHaveBeenCalledTimes(1);
});