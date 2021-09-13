import { Templates } from '@averjs/vue-app';
import { Plugin } from '@averjs/core';

export interface AverCoreConfig {
  buildPlugins?: Plugin[];
  plugins?: Plugin[];
  aliases?: {
    [key: string]: string;
  };
  templates?: Templates[];
  additionalTemplatesConfig?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
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
  additionalTemplatesConfig: {},
  entries: {
    app: [],
    client: [],
    server: []
  }
});
