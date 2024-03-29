/* eslint-disable @typescript-eslint/await-thenable */
import typescript, { mergeOptions } from '../lib';
import Chain from 'webpack-chain';
import { RuleSetUse, RuleSetRule } from 'webpack';
import IgnoreNotFoundExportPlugin from '../lib/IgnoreNotFoundExportPlugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

let hooks: [string, (chain: Chain) => void][];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let averThis: any;

describe('typescript plugin', () => {
  beforeEach(() => {
    process.env.PROJECT_PATH = __dirname;

    hooks = [];
    averThis = {
      config: {
        isProd: true
      },
      aver: {
        config: {},
        tap: (hook: string, fn: (chain: Chain) => void) => {
          hooks.push([hook, fn]);
        }
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should merge options correctly', async () => {
    let { forkTsCheckerOptions, tsLoaderOptions } = await mergeOptions({
      tsLoader: {
        transpileOnly: false
      },
      forkTsChecker: {
        typescript: {
          enabled: false
        }
      }
    });

    expect(tsLoaderOptions.transpileOnly).toBeFalsy();
    if (typeof forkTsCheckerOptions.typescript !== 'boolean') {
      expect(forkTsCheckerOptions.typescript?.enabled).toBeFalsy();
      expect(forkTsCheckerOptions.typescript?.extensions?.vue).toBeTruthy();
    }

    ({ forkTsCheckerOptions, tsLoaderOptions } = await mergeOptions({
      tsLoader: () => {
        return new Promise((resolve) => {
          resolve({
            colors: true
          });
        });
      },
      forkTsChecker: () => {
        return new Promise((resolve) => {
          resolve({
            async: true
          });
        });
      }
    }));

    expect(tsLoaderOptions.colors).toBeTruthy();
    expect(forkTsCheckerOptions.async).toBeTruthy();
  });

  it('should set thread-loader config correctly', async () => {
    await typescript.call(averThis);
    expect(
      averThis.aver.config.webpack.threadLoader.pools.ts.loaders
    ).toContain('ts-loader');
  });

  it('should set additional extensions correctly', async () => {
    await typescript.call(averThis);
    expect(averThis.aver.config.webpack.additionalExtensions).toEqual([
      'ts',
      'tsx'
    ]);

    averThis.aver.config = { webpack: { additionalExtensions: ['jsx'] } };
    await typescript.call(averThis);
    expect(averThis.aver.config.webpack.additionalExtensions).toEqual([
      'jsx',
      'ts',
      'tsx'
    ]);
  });

  it('should register loaders correctly', async () => {
    await typescript.call(averThis);

    let clientChain = new Chain().name('client');
    let baseChain = new Chain().name('base');

    for (const [name, hook] of hooks) {
      if (name.includes('client')) hook(clientChain);
      else if (name.includes('base')) hook(baseChain);
    }

    for (const chain of [baseChain, clientChain]) {
      const config = chain.toConfig();
      const ruleSet = (config.module?.rules?.[0] as RuleSetRule)?.use;
      const loaders = Array.isArray(ruleSet)
        ? ruleSet?.map((loader) => (loader as RuleSetRule).loader)
        : undefined;

      if (config.name === 'client') {
        expect(config.plugins?.[0]).toBeInstanceOf(ForkTsCheckerWebpackPlugin);
      } else if (config.name === 'base') {
        expect(loaders).toEqual(['thread-loader', 'babel-loader', 'ts-loader']);
        expect(
          (
            ((ruleSet as RuleSetUse[])[0] as RuleSetRule).options as {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              [k: string]: any;
            }
          )?.poolTimeout
        ).toBe(2000);
      }
    }

    const baseConfig = baseChain.toConfig();
    expect(baseConfig.plugins?.[0]).toBeInstanceOf(IgnoreNotFoundExportPlugin);
    expect(baseConfig.resolve?.extensions).toContain('.ts');

    averThis.config.isProd = false;
    await typescript.call(averThis);
    clientChain = new Chain().name('client');
    baseChain = new Chain().name('base');

    for (const [name, hook] of hooks) {
      if (name.includes('client')) hook(clientChain);
      else if (name.includes('base')) hook(baseChain);
    }

    for (const chain of [clientChain, baseChain]) {
      const config = chain.toConfig();
      const ruleSet = (config.module?.rules?.[0] as RuleSetRule)?.use;

      if (config.name === 'client') {
        expect(config.plugins?.[0]).toBeInstanceOf(ForkTsCheckerWebpackPlugin);
      } else if (config.name === 'base') {
        expect(
          (
            ((ruleSet as RuleSetUse[])[0] as RuleSetRule).options as {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              [k: string]: any;
            }
          )?.poolTimeout
        ).toBe(Infinity);
      }
    }
  });
});
