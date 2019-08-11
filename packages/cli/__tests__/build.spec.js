import AverCli from '../lib';
import Renderer, { mockCompile } from '../__mocks__/@averjs/renderer';

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
  process.argv.push('build', '--h');

  const cli = new AverCli();
  await cli.run();
  expect(outputData).toMatch('Build for production usage.');
});

test('run should execute renderer', async() => {
  process.argv.push('build');

  // eslint-disable-next-line no-unused-vars
  const renderer = new Renderer();
  const cli = new AverCli();
  await cli.run();

  expect(mockCompile).toHaveBeenCalledTimes(1);
});

test('run should set NODE_ENV to "production" when not set', async() => {
  process.argv.push('build');

  delete process.env.NODE_ENV;

  // eslint-disable-next-line no-unused-vars
  const renderer = new Renderer();
  const cli = new AverCli();
  await cli.run();

  expect(process.env.NODE_ENV).toBe('production');
});
