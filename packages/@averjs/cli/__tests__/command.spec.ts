import TestCommand from '../__fixtures__/TestCommand';

const argv = { 'test-arg': true, 'test-arg-which-should-not-show-up': true, _: [] };

test('parseArgs should only inlude args which are defined in command', async() => {
  const test = new TestCommand();
  expect(test.parseArgs(argv)).toEqual({ 'test-arg': true });
});
