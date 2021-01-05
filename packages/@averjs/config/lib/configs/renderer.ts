import path from 'path';
import Config from 'webpack-chain';
import {
  GenerateSWOptions,
  InjectManifestOptions
} from 'workbox-webpack-plugin';
import { StyleResourcesLoaderOptions } from 'style-resources-loader';
import { ProcessOptions, AcceptedPlugin } from 'postcss';
import PostCSSPresetEnv from 'postcss-preset-env';
import { Options as BabelPresetOptions } from '@babel/preset-env';
import { Options as NodeExternalsOptions } from 'webpack-node-externals';

export type BabelOptions = Partial<
  BabelPresetOptions & {
    polyfills: string[];
    buildTarget: 'client' | 'server';
    decoratorsBeforeExport: boolean;
    decoratorsLegacy: boolean;
    absoluteRuntime: boolean | string;
  }
>;

export interface AverWebpackConfig {
  babel?:
    | BabelOptions
    | ((payload: { isServer: boolean }, config: BabelOptions) => void);
  additionalExtensions?: string[];
  transpileDependencies?: (string | RegExp)[];
  nodeExternals?: NodeExternalsOptions;
  postcss?: {
    preset?: PostCSSPresetEnv.pluginOptions;
    sourceMap?: boolean;
    execute?: boolean;
    postcssOptions?: {
      plugins?: AcceptedPlugin[];
    } & ProcessOptions;
    plugins?: {
      [index: string]: any;
    };
  };
  runtimeChunk?: boolean | 'single' | 'multiple' | Config.RuntimeChunk;
  css?: {
    extract?: boolean;
    styleResources?: {
      resources?: string[];
      options?: StyleResourcesLoaderOptions;
    };
  };
  alias?:
    | {
        [index: string]: string;
      }
    | {
        [index: string]: string;
        '@': string;
        '@@': string;
        '@components': string;
        '@resources': string;
        '@mixins': string;
        '@pages': string;
        '@vuex': string;
      };
  base?: false | ((chain: Config) => void);
  client?: false | ((chain: Config) => void);
  server?: false | ((chain: Config) => void);
  sw?: false | GenerateSWOptions | InjectManifestOptions;
  process?: {
    env?: Record<string, any>;
  };
}

export default (isProd: boolean): AverWebpackConfig => ({
  babel: {},
  additionalExtensions: ['js'],
  transpileDependencies: [],
  nodeExternals: {},
  postcss: {},
  runtimeChunk: 'single',
  css: {
    extract: isProd,
    styleResources: {
      resources: [],
      options: {
        patterns: []
      }
    }
  },
  alias: {
    '@': path.join(process.env.PROJECT_PATH),
    '@@': path.resolve(process.env.PROJECT_PATH, '../'),
    '@components': path.resolve(process.env.PROJECT_PATH, './components'),
    '@resources': path.resolve(process.env.PROJECT_PATH, './resources'),
    '@mixins': path.resolve(process.env.PROJECT_PATH, './mixins'),
    '@pages': path.resolve(process.env.PROJECT_PATH, './pages'),
    '@vuex': path.resolve(process.env.PROJECT_PATH, './vuex')
  },
  base: false,
  client: false,
  server: false,
  sw: false,
  process: {
    env: {}
  }
});
