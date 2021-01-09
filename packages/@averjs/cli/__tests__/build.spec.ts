import { mockeCoreBuild } from './mocks';
import AverCli from '../lib';
import { setProcessArgs } from './utils';

const OLD_ARGV = [...process.argv];
const OLD_ENV = { ...process.env };
let outputData = '';

beforeEach(() => {
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
  setProcessArgs('build', '--h');

  const cli = new AverCli();
  await cli.run();

  await expect(outputData).toMatch('Build for production usage.');
});

test('run should execute renderer', async () => {
  setProcessArgs('build');

  const cli = new AverCli();
  await cli.run();

  expect(mockeCoreBuild.mock.calls.length).toBe(1);
});

test('run should set NODE_ENV to "production" when not set', async () => {
  setProcessArgs('build');

  delete process.env.NODE_ENV;

  const cli = new AverCli();
  await cli.run();

  expect(process.env.NODE_ENV).toBe('production');
});

test('static should be passed to renderer constructor', async () => {
  setProcessArgs('build', '--static');

  const cli = new AverCli();
  await cli.run();

  expect(mockeCoreBuild.mock.calls[0][0].static).toBeTruthy();
});
