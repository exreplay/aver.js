import Build from './build';
import parseArgs from 'minimist';

(async () => {
  try {
    const args = parseArgs(process.argv.slice(2), { boolean: true });
    await new Build(args.watch, undefined, args._).run();
  } catch (error) {
    console.log(error);
  }
})();
