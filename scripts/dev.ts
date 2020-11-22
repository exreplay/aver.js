import Build from './build';

(async () => {
  try {
    await new Build(!!process.argv.find(arg => arg === '--watch')).run();
  } catch (error) {
    console.log(error);
  }
})();
