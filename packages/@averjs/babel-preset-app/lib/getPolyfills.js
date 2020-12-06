const defaultPolyfills = {
  2: {
    builtIns: '@babel/preset-env/data/built-ins.json.js',
    polyfills: [
      'es6.array.iterator',
      'es6.promise',
      'es6.object.assign',
      'es7.promise.finally'
    ]
  },
  3: {
    builtIns: 'core-js-compat/data',
    polyfills: [
      'es.array.iterator',
      'es.promise',
      'es.object.assign',
      'es.promise.finally'
    ]
  }
};

module.exports.getDefaultPolyfills = corejs =>
  defaultPolyfills[corejs].polyfills;

module.exports.getPolyfills = (
  corejs,
  targets,
  includes,
  { ignoreBrowserslistConfig, configPath }
) => {
  const { isPluginRequired } = require('@babel/preset-env');
  const builtInsList = require(defaultPolyfills[corejs].builtIns);
  const getTargets = require('@babel/preset-env/lib/targets-parser').default;
  const builtInTargets = getTargets(targets, {
    ignoreBrowserslistConfig,
    configPath
  });

  return includes.filter(item =>
    isPluginRequired(builtInTargets, builtInsList[item])
  );
};
