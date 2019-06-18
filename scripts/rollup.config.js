import path from 'path';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import license from 'rollup-plugin-license';
import builtins from './builtins';

export default class RollupConfig {
  constructor(pkg, pkgPath) {
    this.pkg = pkg;
    this.path = pkgPath;

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

  plugins() {
    const plugins = [];

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
        extensions: ['.js'],
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          ['@babel/preset-env', { modules: false }]
        ],
        plugins: [ '@babel/plugin-transform-runtime' ]
      })
    );

    plugins.push(terser());

    plugins.push(
      license({
        banner: [
          '/*!',
          ` * ${this.pkg.name} v${this.options.version}`,
          ` * Copyright <%= moment().format('YYYY') %> Florian Weber`,
          ` * Released under the MIT License.`,
          '*/'
        ].join('\n')
      })
    );

    return plugins;
  }

  config() {
    return {
      input: this.options.input,
      output: this.output(),
      external: this.external(),
      plugins: this.plugins()
    };
  }
}
