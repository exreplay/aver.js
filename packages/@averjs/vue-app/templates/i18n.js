<% /* eslint-disable no-undef */ %>

import Vue from 'vue';
import VueI18n from 'vue-i18n';
import * as Cookies from 'js-cookie';
import merge from 'lodash/merge';

Vue.use(VueI18n);

export function createI18n({ isServer, context }) {
  let i18nConfig = {
    locale: 'de',
    fallbackLocale: 'de'
  };

  <% if (typeof config.i18n !== 'undefined') print('i18nConfig = Object.assign(i18nConfig, JSON.parse(\'' + JSON.stringify(config.i18n) + '\'));') %>

  <% const extensions = config.additionalExtensions.join('|'); %>
  const mixinContext = <%= `require.context('@/', false, /^\\.\\/i18n\\.(${extensions})$/i)` %>;
  
  for (const r of mixinContext.keys()) {
    const mixin = mixinContext(r).default;
    if (typeof mixin !== 'undefined') {
      const mixinConfig = mixin(i18nConfig);
      i18nConfig = merge(i18nConfig, mixinConfig);
    }
  }

  const i18n = new VueI18n(i18nConfig);

  if (!isServer) i18n.locale = Cookies.get('language') || i18nConfig.locale;
  else i18n.locale = context.req.cookies.language || i18nConfig.locale;

  Vue.prototype.$locale = {
    change: (lang) => {
      i18n.locale = lang;
      Cookies.set('language', i18n.locale, { secure: process.env.NODE_ENV === 'production' });
    },
    current: () => {
      return i18n.locale;
    }
  };

  return i18n;
}
