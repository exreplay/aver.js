import { defaultConfig } from '../../utils/feature';
import { AverConfig } from '@averjs/config';

const config: Partial<AverConfig> = {
  ...defaultConfig(__dirname),
  plugins: [
    'plugins/plugin/index.js',
    'aver-test-plugin',
    function() {
      if (process.argv.includes('build')) return;

      this.aver.tap('builder:before-compile-ssr', ({ BODY }) => {
        BODY.splice(3, 0, '<div>inline</div>');
      });
    }
  ],
  buildPlugins: [
    ['plugins/build-plugin', { msg: 'build plugin options working' }]
  ]
};

export default config;
