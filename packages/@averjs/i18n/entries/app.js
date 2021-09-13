import { createI18n } from './i18n';

export default async ({ isServer, appOptions, context }) => {
  const i18n = await createI18n({ isServer, context });
  appOptions.i18n = i18n;
};
