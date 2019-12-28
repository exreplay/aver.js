// Props to vue-cli
// TODO: Add modern mode

const { getPolyfills, getDefaultPolyfills } = require('./getPolyfills');

module.exports = (_context, options = {}) => {
  const presets = [];
  const plugins = [];
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
    absoluteRuntime,
    corejs = 2
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
    plugins.push([ require('./polyfillsPlugin'), { polyfills } ]);
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
  } ]);

  plugins.push(
    require('@babel/plugin-syntax-dynamic-import'),
    [ require('@babel/plugin-proposal-decorators'), {
      decoratorsBeforeExport,
      legacy: decoratorsLegacy !== false
    } ],
    [ require('@babel/plugin-proposal-class-properties'), { loose } ],
    [ require('@babel/plugin-transform-classes'), { loose } ]
  );

  plugins.push([ require('@babel/plugin-transform-runtime'), {
    regenerator: useBuiltIns !== 'usage',
    corejs: corejs >= 3 ? false : corejs,
    helpers: useBuiltIns === 'usage',
    useESModules: buildTarget !== 'server',
    absoluteRuntime
  } ]);

  return {
    presets,
    plugins
  };
};
