<% /* eslint-disable no-undef */ %>

import Vue from 'vue';
import VueI18n from 'vue-i18n';
import merge from 'lodash/merge';

Vue.use(VueI18n);

export let i18nInstance;

export async function createI18n({ isServer, context }) {
  const { default: Cookies } = await import('js-cookie');

  let i18nConfig = {
    locale: 'de',
    fallbackLocale: 'de'
  };

  <% if (typeof config.i18n !== 'undefined') print('i18nConfig = Object.assign(i18nConfig, JSON.parse(\'' + JSON.stringify(config.i18n) + '\'));') %>

  <% const extensions = config.additionalExtensions.join('|'); %>
  const mixinContext = <%= `require.context('@/', false, /^\\.\\/i18n\\.(${extensions})$/i, 'lazy')` %>;
  
  for (const r of mixinContext.keys()) {
    const { default: mixin } = await mixinContext(r);
    if (typeof mixin !== 'undefined') {
      const mixinConfig = await mixin(i18nConfig);
      i18nConfig = merge(i18nConfig, mixinConfig);
    }
  }

  console.log(i18nConfig);

  i18nInstance = new VueI18n(i18nConfig);

  if (!isServer) i18nInstance.locale = Cookies.get('language') || i18nConfig.locale;
  else i18nInstance.locale = context.req.cookies.language || i18nConfig.locale;

  Vue.prototype.$locale = {
    change: (lang) => {
      i18nInstance.locale = lang;
      Cookies.set('language', i18nInstance.locale, { secure: process.env.NODE_ENV === 'production' });
    },
    current: () => {
      return i18nInstance.locale;
    }
  };

  return i18nInstance;
}
