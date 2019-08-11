// Props to vue-cli
// TODO: Add modern mode

const path = require('path');

const defaultPolyfills = [
  // promise polyfill alone doesn't work in IE,
  // needs this as well. see: #1642
  'es6.array.iterator',
  // this is required for webpack code splitting, vuex etc.
  'es6.promise',
  // this is needed for object rest spread support in templates
  // as vue-template-es2015-compiler 1.8+ compiles it to Object.assign() calls.
  'es6.object.assign',
  // #2012 es6.promise replaces native Promise in FF and causes missing finally
  'es7.promise.finally'
];

function getPolyfills(targets, includes, { ignoreBrowserslistConfig, configPath }) {
  const { isPluginRequired } = require('@babel/preset-env');
  const builtInsList = require('@babel/preset-env/data/built-ins.json');
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
    decoratorsLegacy = true
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
    plugins.push([ require('./polyfillsPlugin'), { polyfills } ]);
  } else {
    polyfills = [];
  }

  const corejs = 2;

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
    require('@babel/plugin-transform-arrow-functions'),
    require('@babel/plugin-syntax-dynamic-import'),
    [ require('@babel/plugin-proposal-decorators'), {
      decoratorsBeforeExport,
      legacy: decoratorsLegacy !== false
    } ],
    [ require('@babel/plugin-proposal-class-properties'), { loose } ],
    [ require('@babel/plugin-transform-classes'), { loose } ],
    require('@babel/plugin-transform-parameters')
  );

  plugins.push([ require('@babel/plugin-transform-runtime'), {
    regenerator: useBuiltIns !== 'usage',
    corejs: useBuiltIns === 'usage' ? corejs : false,
    helpers: useBuiltIns === 'usage',
    useESModules: true,
    absoluteRuntime: path.dirname(require.resolve('@babel/runtime/package.json'))
  } ]);

  return {
    presets,
    plugins
  };
};
