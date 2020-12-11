// testSequencer.js
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    const copyTests = Array.from(tests);
    return copyTests.sort(test =>
      test.path.includes('features/dev.spec.ts') ? -1 : 1
    );
  }
}

module.exports = CustomSequencer;
