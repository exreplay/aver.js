import { mockeCoreRun } from './mocks';
import AverCli from '../lib';
import { setProcessArgs } from './utils';

const OLD_ARGV = [...process.argv];
const OLD_ENV = { ...process.env };
let outputData = '';

beforeEach(function () {
  outputData = '';
  console.log = jest.fn((inputs) => (outputData = inputs));
  console.error = jest.fn((inputs) => (outputData = inputs));

  process.argv = [...OLD_ARGV];
  process.env = { ...OLD_ENV };
});

afterEach(() => {
  jest.clearAllMocks();
});

test('help command should output command description', async () => {
  setProcessArgs('dev', '--h');

  const cli = new AverCli();
  await cli.run();
  await expect(outputData).toMatch('Start aver in development mode.');
});

test('run should execute core run', async () => {
  setProcessArgs('dev');

  const cli = new AverCli();
  await cli.run();

  expect(mockeCoreRun.mock.calls.length).toBe(1);
});

test('run should set NODE_ENV to "development" when not set', async () => {
  setProcessArgs('dev');

  delete process.env.NODE_ENV;

  const cli = new AverCli();
  await cli.run();

  expect(process.env.NODE_ENV).toBe('development');
});

test('run should log error when fails', async () => {
  setProcessArgs('dev');

  delete process.env.NODE_ENV;

  const cli = new AverCli();
  await cli.run();

  expect(process.env.NODE_ENV).toBe('development');
});
