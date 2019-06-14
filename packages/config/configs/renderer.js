export default () => ({
  css: {
    extract: false,
    styleResources: {
      resources: [],
      options: {}
    }
  },
  purgeCss: false,
  base: false,
  client: false,
  server: false,
  sw: false,
  process: {
    env: {}
  }
});
