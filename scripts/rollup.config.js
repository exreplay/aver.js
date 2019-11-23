import path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import license from 'rollup-plugin-license';
import copy from 'rollup-plugin-copy';
import builtins from './builtins';
import { getNextVersion } from './utils';

export default class RollupConfig {
  constructor(pkg, releaseType) {
    this.pkg = pkg;
    this.path = pkg.location;
    this.releaseType = releaseType;

    this.options = {
      input: path.join(this.path, 'lib/index.js'),
      name: this.pkg.name.replace('@averjs/', ''),
      version: this.pkg.version,
      external: []
    };
  }

  external() {
    const external = [
      ...builtins,
      ...Object.keys(this.pkg.dependencies || []),
      ...this.options.external
    ];

    return id => {
      const pattern = new RegExp(`^(${external.join('|')})($|/)`);
      return pattern.test(id);
    };
  }

  output() {
    return {
      format: 'cjs',
      preferConst: true,
      file: path.join(this.path, `dist/${this.options.name}.js`)
    };
  }

  async plugins() {
    const plugins = [];

    if (this.pkg.aver.copy) {
      plugins.push(
        copy({
          targets: this.pkg.aver.copy.map(file => ({
            src: path.join(this.path, file),
            dest: path.join(this.path, 'dist')
          }))
        })
      );
    }

    plugins.push(
      resolve({
        only: [
          /lodash/
        ]
      })
    );

    plugins.push(commonjs());

    plugins.push(
      babel({
        runtimeHelpers: true,
        extensions: [ '.js' ],
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          [ '@babel/preset-env', { modules: false } ]
        ],
        plugins: [ '@babel/plugin-transform-runtime' ]
      })
    );

    if (this.releaseType) plugins.push(terser());

    plugins.push(
      license({
        banner: [
          '/*!',
          ` * ${this.pkg.name} v${this.releaseType ? await getNextVersion(this.releaseType) : '-development'}`,
          ' * Copyright <%= moment().format(\'YYYY\') %> Florian Weber',
          ' * Released under the MIT License.',
          '*/'
        ].join('\n')
      })
    );

    return plugins;
  }

  async config() {
    return {
      input: this.options.input,
      output: this.output(),
      external: this.external(),
      plugins: await this.plugins(),
      watch: {
        clearScreen: false
      },
      onwarn: (message) => {
        if (/external dependency/.test(message)) return;
        console.error(message);
      }
    };
  }
}
