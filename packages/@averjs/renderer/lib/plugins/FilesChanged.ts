import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import { Compiler } from 'webpack';

export default class FilesChanged {
  apply(compiler: Compiler) {
    compiler.hooks.watchRun.tap('averjs', compiler => {
      let changedFiles = '';
      
      for (const file of compiler?.modifiedFiles?.values() || []) {
        if(fs.lstatSync(file).isFile()) changedFiles += ` ${chalk.bold.blue(path.basename(file))},`;
      }
        
      console.log(
        logSymbols.info,
        `Files changed:${changedFiles.slice(0, -1)}`
      );
    });
  }
}
