module.exports = function(api) {
  api.cache(false);
  return {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/transform-runtime']
  };
};
