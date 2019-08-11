import AverCli from '../lib';
import Renderer from '@averjs/renderer';
jest.mock('@averjs/renderer');

const OLD_ARGV = [ ...process.argv ];
const OLD_ENV = { ...process.env };
let outputData = '';

beforeEach(() => {
  Renderer.mockClear();

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

  const cli = new AverCli();
  await cli.run();

  expect(Renderer.mock.instances[0].compile.mock.calls.length).toBe(1);
});

test('run should set NODE_ENV to "production" when not set', async() => {
  process.argv.push('build');

  delete process.env.NODE_ENV;

  const cli = new AverCli();
  await cli.run();

  expect(process.env.NODE_ENV).toBe('production');
});

test('static arg should be passed to renderer options', async() => {
  process.argv.push('build', '--static');

  const cli = new AverCli();
  await cli.run();

  expect(Renderer.mock.calls[0][0].static).toBeTruthy();
});
