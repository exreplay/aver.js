// Props to vue-cli
// TODO: Add modern mode

const path = require('path');
const { getPolyfills, getDefaultPolyfills } = require('./getPolyfills');

module.exports = (context, options = {}) => {
  const presets = [];
  const plugins = [];
  const runtimePath = path.dirname(require.resolve('@babel/runtime/package.json'));
  const {
    polyfills: userPolyfills,
    buildTarget,
    loose = true,
    debug = false,
    useBuiltIns = 'usage',
    modules = false,
    spec,
    ignoreBrowserslistConfig = false,
    configPath,
    include,
    exclude,
    shippedProposals,
    forceAllTransforms,
    decoratorsBeforeExport,
    decoratorsLegacy = true,
    absoluteRuntime = runtimePath,
    corejs = 2,
    /**
     * The useAbsolutePath option is for later, when babel-preset-app uses core-js 3 for default.
     * For now it is recommended to stick with version 2 because many plugins are still using it.
     * If we would use version 3 for default, users are forced to install core-js 3 in order for the plugin to work and that is not good experience.
     */
    useAbsolutePath = false
  } = options;

  const targets = buildTarget === 'server' ? { node: 'current' } : {
    browsers: [
      'IE >= 9'
    ]
  };

  let polyfills;

  if (useBuiltIns === 'usage' && buildTarget === 'client') {
    polyfills = getPolyfills(corejs, targets, userPolyfills || getDefaultPolyfills(corejs), {
      ignoreBrowserslistConfig,
      configPath
    });
    plugins.push([require('./polyfillsPlugin'), { polyfills, useAbsolutePath }]);
  } else {
    polyfills = [];
  }

  presets.push([ require('@babel/preset-env'), {
    spec,
    loose,
    debug,
    modules,
    targets,
    useBuiltIns,
    corejs,
    ignoreBrowserslistConfig,
    configPath,
    include,
    exclude: polyfills.concat(exclude || []),
    shippedProposals,
    forceAllTransforms
  }]);

  plugins.push(
    require('@babel/plugin-syntax-dynamic-import'),
    [require('@babel/plugin-proposal-decorators'), {
      decoratorsBeforeExport,
      legacy: decoratorsLegacy !== false
    }],
    [require('@babel/plugin-proposal-class-properties'), { loose }],
    [require('@babel/plugin-transform-classes'), { loose }]
  );

  plugins.push([require('@babel/plugin-transform-runtime'), {
    regenerator: useBuiltIns !== 'usage',
    corejs: corejs >= 3 ? false : corejs,
    helpers: useBuiltIns === 'usage',
    useESModules: buildTarget !== 'server',
    absoluteRuntime
  }]);

  return {
    presets,
    plugins
  };
};
