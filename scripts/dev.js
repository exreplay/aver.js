import Build from './build';

new Build(process.argv.find(arg => arg === '--watch')).run();
