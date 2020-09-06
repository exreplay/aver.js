import { Plugin } from '@averjs/core/dist/plugins';
import { Templates } from '@averjs/vue-app';

interface CoreConfig {
  buildPlugins: Plugin[],
  plugins: Plugin[],
  aliases: {
    [key: string]: string;
  },
  templates: Templates[],
  entries: {
    [key: string]: string[];
    app: string[],
    client: string[],
    server: string[]
  }
}

export default (): CoreConfig => ({
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
