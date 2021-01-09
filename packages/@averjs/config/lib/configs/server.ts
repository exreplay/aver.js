import helmet from 'helmet';
import { BundleRendererOptions } from '@averjs/builder';

export interface AverServerConfig {
  csrfExclude?: string[];
  csrf?: boolean;
  createRenderer?: Partial<BundleRendererOptions>;
  helmet?: Parameters<typeof helmet>[0];
}

export default (): AverServerConfig => ({
  csrfExclude: [],
  csrf: true,
  createRenderer: {},
  helmet: {}
});
