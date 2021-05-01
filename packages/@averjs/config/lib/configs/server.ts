import helmet from 'helmet';
import { BundleRendererOptions } from 'vue-server-renderer';

export interface AverServerConfig {
  csrfExclude?: string[];
  csrf?: boolean;
  createRenderer?: BundleRendererOptions;
  helmet?: Parameters<typeof helmet>[0];
}

export default (): AverServerConfig => ({
  csrfExclude: [],
  csrf: true,
  createRenderer: {},
  helmet: {}
});
