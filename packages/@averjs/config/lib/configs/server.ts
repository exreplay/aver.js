import helmet from 'helmet';

export interface AverServerConfig {
  csrfExclude?: string[];
  csrf?: boolean;
  createRenderer?: any;
  helmet?: Parameters<typeof helmet>[0];
}

export default (): AverServerConfig => ({
  csrfExclude: [],
  csrf: true,
  createRenderer: {},
  helmet: {}
});
