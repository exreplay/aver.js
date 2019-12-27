import './register-component-hooks';
import Vue from 'vue';
import VueI18n from 'vue-i18n';
import axios from 'axios';
import App from '@/App.vue';
import { createRouter } from './router/';
import { createStore } from './store/';
import { sync } from 'vuex-router-sync';
import * as Cookies from 'js-cookie';
<% if (config.progressbar) { %> 
import VueProgressBar from 'vue-progressbar';
<% } %>

<% if (config.progressbar) { %>
const options = {
  color: '#003B8E',
  failedColor: '#E0001A',
  thickness: '2px',
  transition: {
    speed: '0.2s',
    opacity: '0.6s',
    termination: 300
  },
  autoRevert: true,
  location: 'top',
  inverse: false
};

Vue.use(VueProgressBar, <% typeof config.progressbar === 'object' ? print('Object.assign(options, JSON.parse(\''+JSON.stringify(config.progressbar)+'\'))') : print('options') %>);
<% } %>


Vue.use(VueI18n);

axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
  return Promise.reject(error);
});

export function createApp(ssrContext) {
  const i18nConfig = {
    locale: 'de',
    fallbackLocale: 'de'
  };

  const i18n = new VueI18n(<% if(typeof config.i18n !== 'undefined') print('Object.assign(i18nConfig, JSON.parse(\''+JSON.stringify(config.i18n)+'\'))') %>);

  if (!ssrContext.isServer) i18n.locale = Cookies.get('language') || 'de';
  else i18n.locale = ssrContext.context.cookies['language'] || 'de';

  Vue.prototype.$locale = {
    change: (lang) => {
      i18n.locale = lang;
      Cookies.set('language', i18n.locale, { secure: process.env.NODE_ENV === 'production' });
    },
    current: () => {
      return i18n.locale;
    }
  };

  const router = createRouter({ i18n });
  const store = createStore(ssrContext);

  sync(store, router);

  Vue.router = router;

  const entries = [
    <% 
      if(typeof config.entries !== 'undefined' && typeof config.entries.app !== 'undefined') {
        for(const entry of config.entries.app) {
          print(`require('${entry}')`);
        }
      }
    %>
  ];

  const mixinContext = require.context('@/', false, /^\.\/app\.js$/i);
  for(const key of mixinContext.keys()) {
    const mixin = mixinContext(key).default;
    if(typeof mixin === 'function') mixin(ssrContext);
  }

  for(const entry of entries) {
    const mixin = entry.default;
    if(typeof mixin === 'function') mixin(ssrContext);
  }
    
  const app = new Vue({
    i18n,
    router,
    store,
    ssrContext,
    render: h => h(App)
  });

  return { app, router, store };
};
