import path from 'path';
import { PluginFunction } from '@averjs/core';

const plugin: PluginFunction = function () {
  this.config.templates?.push({
    src: path.resolve(__dirname, '../entries/i18n.js'),
    dst: path.resolve(this.config.cacheDir, './i18n/i18n.js')
  });

  this.config.templates?.push({
    src: path.resolve(__dirname, '../entries/i18n.d.ts'),
    dst: path.resolve(this.config.cacheDir, './i18n/i18n.d.ts')
  });

  this.config.templates?.push({
    src: path.resolve(__dirname, '../entries/app.js'),
    dst: path.resolve(this.config.cacheDir, './i18n/app.js')
  });

  this.config.i18n = {
    silentTranslationWarn: true,
    ...this.config.i18n
  };

  if (!this.config.additionalTemplatesConfig)
    this.config.additionalTemplatesConfig = {};

  this.config.additionalTemplatesConfig.i18n = this.config.i18n;

  if (this.aver.config.webpack?.alias)
    this.aver.config.webpack.alias['@i18n'] = path.resolve(
      this.config.cacheDir,
      './i18n/i18n.js'
    );

  this.aver.tap('renderer:base-config', (chain) => {
    chain.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@kazupon/vue-i18n-loader');
  });
};

export default plugin;
