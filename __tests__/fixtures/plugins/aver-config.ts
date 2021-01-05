import { AverConfig } from '@averjs/config';
import { buildPlugin, plugin } from './mockedPlugins';

const config: AverConfig = {
  plugins: [
    'plugins/plugin/index.js',
    'aver-test-plugin',
    function() {
      if (process.argv.includes('build')) return;

      this.aver.tap('builder:before-compile-ssr', ({ BODY }) => {
        BODY.splice(3, 0, '<div>inline</div>');
      });
    },
    plugin,
    function() {
      this.aver.tap('after-close', () => {
        expect(plugin.mock.calls.length).toBe(2);
        // Build plugins should only be executed once
        expect(buildPlugin.mock.calls.length).toBe(1);
      });
    }
  ],
  buildPlugins: [
    ['plugins/build-plugin', { msg: 'build plugin options working' }],
    buildPlugin
  ]
};

export default config;
