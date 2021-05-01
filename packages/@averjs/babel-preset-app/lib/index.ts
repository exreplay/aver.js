// Props to vue-cli
// TODO: Add modern mode
import { PluginObj } from '@babel/core';
import PresetEnv, { Options as BabelPresetOptions } from '@babel/preset-env';
import Polyfills from './polyfills';
import PolyfillsPlugin from './polyfillsPlugin';
import PluginSyntaxDynamicImport from '@babel/plugin-syntax-dynamic-import';
import PluginProposalDecorators from '@babel/plugin-proposal-decorators';
import PluginProposalClassProperties from '@babel/plugin-proposal-class-properties';
import PluginTransformClasses from '@babel/plugin-transform-classes';
import PluginTransformRuntime from '@babel/plugin-transform-runtime';

export type BabelPlugin =
  | [NodeRequire | string | (() => PluginObj), Record<string, unknown>]
  | (NodeRequire | string | (() => PluginObj));

export type BabelOptions = BabelPresetOptions & {
  polyfills?: string[];
  buildTarget?: 'client' | 'server';
  decoratorsBeforeExport?: boolean;
  decoratorsLegacy?: boolean;
  absoluteRuntime?: boolean | string;
};

class BabelPresetApp extends Polyfills {
  options: BabelOptions;

  get targets() {
    return this.options.buildTarget === 'server'
      ? { node: 'current' }
      : {
          ie: '9'
        };
  }

  get corejs() {
    return this.options.corejs && typeof this.options.corejs !== 'number'
      ? this.options.corejs?.version
      : this.options.corejs || 2;
  }

  get loose() {
    return this.options.loose || true;
  }

  get debug() {
    return this.options.debug || false;
  }

  get useBuiltIns() {
    return this.options.useBuiltIns || 'usage';
  }

  get modules() {
    return this.options.modules || false;
  }

  get ignoreBrowserslistConfig() {
    return this.options.ignoreBrowserslistConfig || false;
  }

  get decoratorsLegacy() {
    return this.options.decoratorsLegacy;
  }

  constructor(options: BabelOptions) {
    super();
    this.options = options;
  }

  presets(polyfills: Required<BabelOptions>['polyfills']) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presets: any[] = [];

    presets.push([
      PresetEnv,
      {
        spec: this.options.spec,
        loose: this.loose,
        debug: this.debug,
        modules: this.modules,
        targets: this.targets,
        useBuiltIns: this.useBuiltIns,
        corejs: this.corejs,
        ignoreBrowserslistConfig: this.ignoreBrowserslistConfig,
        configPath: this.options.configPath,
        include: this.options.include,
        exclude: polyfills.concat(
          this.options.exclude?.filter(
            /* istanbul ignore next */ (e): e is string => typeof e === 'string'
          ) || []
        ),
        shippedProposals: this.options.shippedProposals,
        forceAllTransforms: this.options.forceAllTransforms
      } as BabelPresetOptions
    ]);

    return presets;
  }

  plugins() {
    const plugins: BabelPlugin[] = [];

    plugins.push(PluginSyntaxDynamicImport);

    plugins.push([
      PluginProposalDecorators,
      {
        decoratorsBeforeExport: this.options.decoratorsBeforeExport,
        legacy: this.decoratorsLegacy !== false
      }
    ]);

    plugins.push([PluginProposalClassProperties, { loose: this.loose }]);
    plugins.push([PluginTransformClasses, { loose: this.loose }]);

    plugins.push([
      PluginTransformRuntime,
      {
        regenerator: this.useBuiltIns !== 'usage',
        // polyfills are injected by preset-env & polyfillsPlugin, so no need to add them again
        corejs: false,
        helpers: this.useBuiltIns === 'usage',
        useESModules: this.options.buildTarget !== 'server',
        absoluteRuntime: this.options.absoluteRuntime
      }
    ]);

    return plugins;
  }

  polyfills(plugins: BabelPlugin[]) {
    let polyfills: BabelOptions['polyfills'] = [];

    if (this.useBuiltIns === 'usage' && this.options.buildTarget === 'client') {
      polyfills = this.getPolyfills(
        this.corejs,
        this.targets,
        this.options.polyfills || this.getDefaultPolyfills(this.corejs),
        {
          ignoreBrowserslistConfig: this.ignoreBrowserslistConfig,
          configPath: this.options.configPath
        }
      );
      plugins.push([PolyfillsPlugin, { polyfills }]);
    } else {
      polyfills = [];
    }

    return polyfills;
  }

  config() {
    const plugins = this.plugins();
    const polyfills = this.polyfills(plugins);
    const presets = this.presets(polyfills);

    return {
      sourceType: 'unambiguous',
      presets,
      plugins
    };
  }
}

export default (_api: never, options: BabelOptions = {}) =>
  new BabelPresetApp(options).config();
