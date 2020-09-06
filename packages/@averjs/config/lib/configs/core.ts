import { Templates, Plugin } from '@averjs/core/dist/plugins';

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
