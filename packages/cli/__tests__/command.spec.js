import TestCommand from '../__fixtures__/TestCommand';
import EmptyCommand from '../__fixtures__/EmptyCommand';

const argv = { 'test-arg': true, 'test-arg-which-should-not-show-up': true };

test('parseArgs should only inlude args which are defined in command', async() => {
  const test = new TestCommand();
  expect(test.parseArgs(argv)).toEqual({ 'test-arg': true });
});

test('empty command should not throw on executing interface methods', async() => {
  const empty = new EmptyCommand();
  expect(() => {
    empty.run();
  }).not.toThrow();

  expect(() => {
    empty.generateCommandLineUsage();
  }).not.toThrow();
});
