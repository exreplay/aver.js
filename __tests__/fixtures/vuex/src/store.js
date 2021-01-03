export default defaultConfig => {
  return {
    modules: {
      ...defaultConfig.modules,
      entry: {
        namespaced: true,
        state() {
          return {
            test: 'entry works'
          };
        }
      }
    },
    plugins: [...defaultConfig.plugins]
  };
};
