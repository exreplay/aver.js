import path from 'path';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import license from 'rollup-plugin-license';
import copy from 'rollup-plugin-copy';
import typescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import builtins from './builtins';
import { getNextVersion, ReleaseType } from './utils';
import { OutputOptions, RollupOptions } from 'rollup';
import { FullVersion } from 'package-json';

interface PackageJSON extends FullVersion {
  location: string;
  aver?: {
    build?: boolean;
    copy: string[];
    exports: OutputOptions['exports'];
  };
}

export default class RollupConfig {
  pkg: PackageJSON;
  path: string;
  name: string;
  version: string;
  releaseType: ReleaseType | null;
  averPackages: string[];
  options: RollupOptions;

  constructor(
    pkg: PackageJSON,
    releaseType: ReleaseType | null,
    averPackages: string[]
  ) {
    this.pkg = pkg;
    this.path = pkg.location;
    this.releaseType = releaseType;
    this.averPackages = averPackages;
    this.name = pkg.name.replace('@averjs/', '');
    this.version = pkg.version;

    this.options = {
      input: path.join(this.path, 'lib/index.ts'),
      external: ['lodash']
    };
  }

  external() {
    const external = [
      ...builtins,
      ...Object.keys(this.pkg.dependencies || []),
      ...this.options.external,
      ...this.averPackages
    ];

    return (id: string) => {
      const pattern = new RegExp(`^(${external.join('|')})($|/)`);
      return pattern.test(id);
    };
  }

  output(): OutputOptions {
    return {
      format: 'cjs',
      preferConst: true,
      file: path.join(this.path, `dist/${this.name}.js`),
      exports: this.pkg.aver?.exports || 'auto'
    };
  }

  async plugins() {
    const plugins = [];

    if (this.pkg.aver?.copy) {
      plugins.push(
        copy({
          targets: this.pkg.aver.copy.map(file => ({
            src: path.join(this.path, file),
            dest: path.join(this.path, 'dist')
          }))
        })
      );
    }

    plugins.push(json());

    plugins.push(
      resolve({
        only: [/lodash/]
      })
    );

    plugins.push(
      typescript({
        tsconfig: path.resolve(__dirname, '../tsconfig.build.json'),
        cacheRoot: path.resolve(__dirname, '../node_modules/.rts2_cache'),
        abortOnError: true,
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: true,
            declaration: true,
            declarationMap: true
          },
          include: [
            path.resolve(this.path, './lib'),
            path.resolve(__dirname, '../packages/@averjs/*.d.ts')
          ]
        }
      })
    );

    if (this.releaseType) plugins.push(terser());

    plugins.push(
      license({
        banner: [
          '/*!',
          ` * ${this.pkg.name} v${
            this.releaseType
              ? (await getNextVersion(this.releaseType)) || ''
              : '-development'
          }`,
          " * Copyright <%= moment().format('YYYY') %> Florian Weber",
          ' * Released under the MIT License.',
          '*/'
        ].join('\n')
      })
    );

    return plugins;
  }

  async config(): Promise<RollupOptions> {
    return {
      input: this.options.input,
      output: this.output(),
      external: this.external(),
      plugins: await this.plugins(),
      watch: {
        clearScreen: false
      },
      onwarn: message => {
        if (/external dependency/.test(message.message)) return;
        console.error(message);
      }
    };
  }
}
