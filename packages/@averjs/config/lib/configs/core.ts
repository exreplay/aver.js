import { Templates } from '@averjs/vue-app';
import { Plugin } from '@averjs/core/lib/plugins';

export interface AverCoreConfig {
  buildPlugins?: Plugin[];
  plugins?: Plugin[];
  aliases?: {
    [key: string]: string;
  };
  templates?: Templates[];
  entries?: {
    [key: string]: string[] | undefined;
    app?: string[];
    client?: string[];
    server?: string[];
  };
}

export default (): AverCoreConfig => ({
  buildPlugins: [],
  plugins: [],
  aliases: {},
  templates: [],
  entries: {
    app: [],
    client: [],
    server: []
  }
});
