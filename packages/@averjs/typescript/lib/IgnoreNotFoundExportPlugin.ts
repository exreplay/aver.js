/* istanbul ignore file */

'use strict';

import webpack from 'webpack';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ModuleDependencyWarning = require('webpack/lib/ModuleDependencyWarning');

const ANY_PATH = /./;
const EXPORT_NOT_FOUND_REG_EXP = /export.*was not found in/;

export default class IgnoreNotFoundExportPlugin {
  include: RegExp[] = [];

  /**
   *
   * @param {Object} options
   * @param {RegExp | RegExp[]} [options.include=/./] A list of regular expressions
   */
  constructor({ include = ANY_PATH } = {}) {
    this.include = Array.isArray(include) ? include : [include];
    this.include.forEach((matcher, i) => {
      if (!(matcher instanceof RegExp)) {
        throw new TypeError(
          `IgnoreNotFoundExportPlugin: argument[${i}] must be an instance of RegExp.`
        );
      }
    });
  }

  isModuleDependencyWarning(warning: any) {
    return (
      warning instanceof ModuleDependencyWarning ||
      warning.constructor.name === 'ModuleDependencyWarning'
    );
  }

  isResourcePathAllowed(resourcePath: string) {
    return this.include.some(regExp => regExp.test(resourcePath));
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.done.tap('IgnoreNotFoundExportPlugin', stats => {
      // mutates `compilation.warnings` to remove ignored warnings
      stats.compilation.warnings = stats.compilation.warnings.filter(
        warning =>
          !(
            this.isModuleDependencyWarning(warning) &&
            EXPORT_NOT_FOUND_REG_EXP.test(warning.message) &&
            this.isResourcePathAllowed(warning.module.context)
          )
      );
    });
  }
}
