import { createI18n as createVueI18n } from 'vue-i18n'
import * as Cookies from 'js-cookie';
import merge from 'lodash/merge';

export function createI18n({ isServer, context }) {
  let i18nConfig = {
    legacy: true,
    locale: 'de',
    fallbackLocale: 'de'
  };

  <% if(typeof config.i18n !== 'undefined') print('i18nConfig = Object.assign(i18nConfig, JSON.parse(\''+JSON.stringify(config.i18n)+'\'));') %>

  const mixinContext = <%
    const extensions = config.additionalExtensions.join('|');
    print(`require.context('@/', false, /^\\.\\/i18n\\.(${extensions})$/i);`);
  %>
  for (const r of mixinContext.keys()) {
    const mixin = mixinContext(r).default;
    if (typeof mixin !== 'undefined') {
      const mixinConfig = mixin(i18nConfig);
      i18nConfig = merge(i18nConfig, mixinConfig);
    }
  }

  const i18n = createVueI18n(i18nConfig);

  if (!isServer) i18n.locale = Cookies.get('language') || i18nConfig.locale;
  else i18n.locale = context.req.cookies.language || i18nConfig.locale;

  // Vue.prototype.$locale = {
  //   change: (lang) => {
  //     i18n.locale = lang;
  //     Cookies.set('language', i18n.locale, { secure: process.env.NODE_ENV === 'production' });
  //   },
  //   current: () => {
  //     return i18n.locale;
  //   }
  // };

  return i18n;
}
