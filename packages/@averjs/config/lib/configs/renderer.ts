import path from 'path';
import Config from 'webpack-chain';
import { GenerateSWOptions, InjectManifestOptions } from 'workbox-webpack-plugin';
import { StyleResourcesLoaderOptions } from 'style-resources-loader';
import postcss, { ProcessOptions } from 'postcss';
import PostCSSPresetEnv from 'postcss-preset-env';

export interface AverWebpackConfig {
  babel?: any;
  additionalExtensions?: string[];
  transpileDependencies?: (string | RegExp)[];
  postcss?: {
    preset?: PostCSSPresetEnv.pluginOptions;
    sourceMap?: boolean;
    execute?: boolean;
    postcssOptions?: { 
      plugins?: postcss.AcceptedPlugin[];
    } & ProcessOptions;
    plugins?: {
      [index: string]: any;
    }
  };
  css?: {
    extract?: boolean,
    styleResources?: {
      resources?: string[],
      options?: StyleResourcesLoaderOptions
    }
  },
  alias?: {
    [index: string]: string;
    '@': string;
    '@@': string;
    '@components': string;
    '@resources': string;
    '@mixins': string;
    '@pages': string;
    '@vuex': string;
  },
  base?: false | ((chain: Config) => void);
  client?: false | ((chain: Config) => void);
  server?: false | ((chain: Config) => void);
  sw?: false | GenerateSWOptions | InjectManifestOptions;
  process?: {
    env?: Record<string, any>
  }
}

export default (): AverWebpackConfig => ({
  babel: {},
  additionalExtensions: [ 'js' ],
  transpileDependencies: [],
  postcss: {},
  css: {
    extract: false,
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
