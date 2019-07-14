// Props to vue-cli
// TODO: Add modern mode

const path = require('path');

const defaultPolyfills = [
  'es.array.iterator',
  'es.promise',
  'es.object.assign',
  'es.promise.finally'
];

function getPolyfills(targets, includes, { ignoreBrowserslistConfig, configPath }) {
  const { isPluginRequired } = require('@babel/preset-env');
  const builtInsList = require('core-js-compat/data');
  const getTargets = require('@babel/preset-env/lib/targets-parser').default;
  const builtInTargets = getTargets(targets, {
    ignoreBrowserslistConfig,
    configPath
  });

  return includes.filter(item => isPluginRequired(builtInTargets, builtInsList[item]));
}

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
    absoluteRuntime = runtimePath
  } = options;

  const targets = buildTarget === 'server' ? { node: 'current' } : {
    browsers: [
      'IE >= 9'
    ]
  };

  let polyfills;

  if (useBuiltIns === 'usage' && buildTarget === 'client') {
    polyfills = getPolyfills(targets, userPolyfills || defaultPolyfills, {
      ignoreBrowserslistConfig,
      configPath
    });
    plugins.push([require('./polyfillsPlugin'), { polyfills, useAbsolutePath: !!absoluteRuntime }]);
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
    corejs: 3,
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
    corejs: false,
    helpers: useBuiltIns === 'usage',
    useESModules: buildTarget !== 'server',
    absoluteRuntime
  }]);

  return {
    presets,
    plugins
  };
};
