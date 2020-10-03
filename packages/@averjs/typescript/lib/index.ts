import path from 'path';
import ForkTsChecker from 'fork-ts-checker-webpack-plugin';
import Config from 'webpack-chain';
import { PluginFunction } from '@averjs/core/dist/plugins';
import { ForkTsCheckerWebpackPluginOptions } from 'fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPluginOptions';
import { LoaderOptions } from 'ts-loader/dist/interfaces';
import IgnoreNotFoundExportPlugin from './IgnoreNotFoundExportPlugin';

export type TSLoaderOptions = Partial<LoaderOptions>;

interface TypescriptPluginOptions {
  tsLoader: TSLoaderOptions | ((options?: TSLoaderOptions) => Promise<TSLoaderOptions> | TSLoaderOptions);
  forkTsChecker: ForkTsCheckerWebpackPluginOptions | ((options?: ForkTsCheckerWebpackPluginOptions) => Promise<ForkTsCheckerWebpackPluginOptions> | ForkTsCheckerWebpackPluginOptions);
}

const plugin: PluginFunction = async function(options: TypescriptPluginOptions) {
  const isProd = process.env.NODE_ENV === 'production';

  const {
    tsLoader,
    forkTsChecker
  } = options;
  
  let tsLoaderOptions: TSLoaderOptions = {
    transpileOnly: true,
    happyPackMode: true,
    appendTsSuffixTo: [/\.vue$/]
  }

  if(typeof tsLoader === 'function') {
    tsLoaderOptions = {
      ...tsLoaderOptions,
      ...(await tsLoader(tsLoaderOptions))
    }
  } else {
    tsLoaderOptions = {
      ...tsLoaderOptions,
      ...tsLoader
    }
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
      files: [
        './src/**/*.vue',
        './src/**/*.ts'
      ]
    }
  }

  if(typeof forkTsChecker === 'function') {
    forkTsCheckerOptions = {
      ...forkTsCheckerOptions,
      ...(await forkTsChecker(forkTsCheckerOptions))
    }
  } else {
    forkTsCheckerOptions = {
      ...forkTsCheckerOptions,
      ...forkTsChecker
    }
  }

  const setLoader = (chain: Config, isServer: boolean): void => {
    const name = 'ts';
      
    chain.module
      .rule('ts-loader')
        .test(/\.tsx?$/)
        .use('cache-loader')
          .loader('cache-loader')
          .options({
            cacheDirectory: path.resolve(process.env.PROJECT_PATH, `../node_modules/.cache/cache-loader/${isServer ? 'server' : 'client'}/${name}`),
            cacheIdentifier: name
          })
          .end()
        .use('thread-loader')
          .loader('thread-loader')
          .options({
            poolConfig: { name: 'ts', poolTimeout: !isProd ? Infinity : 2000 },
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

  if(!this.aver.config.webpack.additionalExtensions) this.aver.config.webpack.additionalExtensions = [];
  this.aver.config.webpack.additionalExtensions.push('ts');
  this.aver.config.webpack.additionalExtensions.push('tsx');

  this.aver.tap('renderer:client-config', chain => {
    setLoader(chain, false);
  });

  this.aver.tap('renderer:server-config', chain => {
    setLoader(chain, true);
  });

  this.aver.tap('renderer:base-config', chain => {
    chain
      .plugin('IgnoreNotFoundExportPlugin')
      .use(IgnoreNotFoundExportPlugin);
      
    chain
      .resolve
        .extensions
          .merge(['.ts']);
  });

  this.aver.tap('renderer:client-config', chain => {
    chain
      .plugin('fork-ts-checker-webpack-plugin')
        .use(ForkTsChecker, [forkTsCheckerOptions]);
  });
};

export default plugin;
