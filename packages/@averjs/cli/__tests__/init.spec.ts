import { mockInitRun } from './mocks';
import AverCli from '../lib';
import { setProcessArgs } from './utils';

const OLD_ARGV = [...process.argv];
let outputData = '';

beforeEach(function() {
  outputData = '';
  console.log = jest.fn(inputs => (outputData = inputs));
  console.error = jest.fn(inputs => (outputData = inputs));

  process.argv = [...OLD_ARGV];
});

afterEach(() => {
  jest.clearAllMocks();
});

test('help command should output command description', async() => {
  setProcessArgs('init', '--h');

  const cli = new AverCli();
  await cli.run();
  expect(outputData).toMatch('Initialize the project by creating all necessary files in the working');
});

test('run should execute core init', async() => {
  setProcessArgs('init');

  const cli = new AverCli();
  await cli.run();

  expect(mockInitRun.mock.calls.length).toBe(1);
});
