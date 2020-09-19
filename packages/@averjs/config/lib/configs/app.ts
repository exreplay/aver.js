import { I18nOptions } from 'vue-i18n';

export interface AverAppConfig {
  i18n?: I18nOptions;
  progressbar?: {
    color?: string;
    failedColor?: string;
    thickness?: string;
    transition?: {
      speed?: string;
      opacity?: string;
      termination?: number;
    };
    autoRevert?: boolean;
    location?: 'left' | 'right' | 'top' | 'bottom';
    position?: 'relative' | 'absolute' | 'fixed';
    inverse?: boolean;
    autoFinish?: boolean;
  } | boolean;
}

export default (): AverAppConfig => ({
  i18n: {
    silentTranslationWarn: true
  },
  progressbar: true
});
