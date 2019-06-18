import path from 'path';
import chalk from 'chalk';
import logSymbols from 'log-symbols';

export default class FilesChanged {
  apply(compiler) {
    compiler.hooks.watchRun.tap('averjs', compiler => {
      const { watchFileSystem } = compiler;
      const watcher = watchFileSystem.watcher || watchFileSystem.wfs.watcher;

      let changedFiles = '';
      for (const file of Object.keys(watcher.mtimes)) {
        changedFiles += ` ${chalk.bold.blue(path.basename(file))},`;
      }
        
      console.log(
        logSymbols.info,
        `Files changed:${changedFiles.slice(0, -1)}`
      );
    });
  }
}
