import path from 'path';
import ForkTsChecker from 'fork-ts-checker-webpack-plugin';
import Config from 'webpack-chain';
import { PluginFunction } from '@averjs/core';
import { ForkTsCheckerWebpackPluginOptions } from 'fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPluginOptions';
import { LoaderOptions } from 'ts-loader/dist/interfaces';
import IgnoreNotFoundExportPlugin from './IgnoreNotFoundExportPlugin';
import merge from 'lodash/merge';

export type TSLoaderOptions = Partial<LoaderOptions>;

export interface TypescriptPluginOptions {
  tsLoader:
    | TSLoaderOptions
    | ((
        options?: TSLoaderOptions
      ) => Promise<TSLoaderOptions> | TSLoaderOptions);
  forkTsChecker:
    | ForkTsCheckerWebpackPluginOptions
    | ((
        options?: ForkTsCheckerWebpackPluginOptions
      ) =>
        | Promise<ForkTsCheckerWebpackPluginOptions>
        | ForkTsCheckerWebpackPluginOptions);
}

export async function mergeOptions(
  options?: TypescriptPluginOptions
): Promise<{
  tsLoaderOptions: TSLoaderOptions;
  forkTsCheckerOptions: ForkTsCheckerWebpackPluginOptions;
}> {
  const { tsLoader, forkTsChecker } = options || {};

  let tsLoaderOptions: TSLoaderOptions = {
    transpileOnly: true,
    happyPackMode: true,
    appendTsSuffixTo: [/\.vue$/]
  };

  if (typeof tsLoader === 'function') {
    tsLoaderOptions = merge(tsLoaderOptions, await tsLoader(tsLoaderOptions));
  } else {
    tsLoaderOptions = merge(tsLoaderOptions, tsLoader);
  }

  let forkTsCheckerOptions: ForkTsCheckerWebpackPluginOptions = {
    typescript: {
      configFile: path.resolve(process.env.PROJECT_PATH, '../tsconfig.json'),
      extensions: {
        vue: true
      }
    },
    formatter: 'codeframe',
    async: false,
    eslint: {
      files: ['./src/**/*.vue', './src/**/*.ts']
    }
  };

  if (typeof forkTsChecker === 'function') {
    forkTsCheckerOptions = merge(
      forkTsCheckerOptions,
      await forkTsChecker(forkTsCheckerOptions)
    );
  } else {
    forkTsCheckerOptions = merge(forkTsCheckerOptions, forkTsChecker);
  }

  return {
    tsLoaderOptions,
    forkTsCheckerOptions
  };
}

const plugin: PluginFunction = async function (
  options?: TypescriptPluginOptions
) {
  const { tsLoaderOptions, forkTsCheckerOptions } = await mergeOptions(options);

  const setLoader = (chain: Config): void => {
    chain.module
      .rule('ts-loader')
      .test(/\.tsx?$/)
      .use('thread-loader')
      .loader('thread-loader')
      .options({
        poolConfig: {
          name: 'ts',
          poolTimeout: !this.config.isProd ? Infinity : 2000
        },
        loaders: ['ts-loader'],
        useThread: true
      })
      .end()
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('ts-loader')
      .loader('ts-loader')
      .options(tsLoaderOptions);
  };

  if (this.aver.config.webpack) {
    if (!this.aver.config.webpack.additionalExtensions)
      this.aver.config.webpack.additionalExtensions = [];

    this.aver.config.webpack.additionalExtensions.push('ts');
    this.aver.config.webpack.additionalExtensions.push('tsx');
  }

  this.aver.tap('renderer:client-config', (chain) => {
    setLoader(chain);
  });

  this.aver.tap('renderer:server-config', (chain) => {
    setLoader(chain);
  });

  this.aver.tap('renderer:base-config', (chain) => {
    chain.plugin('IgnoreNotFoundExportPlugin').use(IgnoreNotFoundExportPlugin);

    chain.resolve.extensions.merge(['.ts']);
  });

  this.aver.tap('renderer:client-config', (chain) => {
    chain
      .plugin('fork-ts-checker-webpack-plugin')
      .use(ForkTsChecker, [forkTsCheckerOptions]);
  });
};

export default plugin;
