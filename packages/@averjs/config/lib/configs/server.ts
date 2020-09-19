export interface AverServerConfig {
  csrfExclude?: string[];
  csrf?: boolean;
  createRenderer?: any;
}

export default (): AverServerConfig => ({
  csrfExclude: [],
  csrf: true,
  createRenderer: {}
});
