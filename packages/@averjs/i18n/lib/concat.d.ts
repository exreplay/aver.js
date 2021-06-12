import { I18nOptions } from 'vue-i18n';
declare module '@averjs/config/dist/config' {
  interface AverAppConfig {
    i18n?: I18nOptions;
  }
}
