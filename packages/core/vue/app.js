import Vue from 'vue';
import Component from 'vue-class-component';
import VueI18n from 'vue-i18n';
import axios from 'axios';
import App from '@/App.vue';
import { createRouter } from './router/';
import { createStore } from './store/';
import { sync } from 'vuex-router-sync';
import forEach from 'lodash/forEach';
import * as Cookies from 'js-cookie';
import userConfig from '@/../aver-config.js';
import { getAverjsConfig } from '@averjs/config';

const config = getAverjsConfig(userConfig);

if (config.progressbar) {
  const VueProgressBar = require('vue-progressbar');

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

  Vue.use(VueProgressBar, Object.assign(options, (typeof config.progressbar === 'object') ? config.progressbar : {}));
}

Vue.use(VueI18n);

axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
  return Promise.reject(error);
});

Component.registerHooks([
  'asyncData',
  'metaInfo'
]);

export function createApp(ssrContext) {
  const router = createRouter();
  const store = createStore(ssrContext);

  sync(store, router);

  const i18nConfig = {
    locale: 'de',
    fallbackLocale: 'de'
  };

  const i18n = new VueI18n(Object.assign(i18nConfig, (typeof config.i18n !== 'undefined') ? config.i18n : {}));

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

  Vue.router = router;

  const mixinContext = require.context('@/', false, /^\.\/app\.js$/i);
        
  forEach(mixinContext.keys(), r => {
    const Mixin = mixinContext(r).default;
    if (typeof Mixin !== 'undefined') {
      const mixin = new Mixin(ssrContext);
    }
  });
    
  const app = new Vue({
    i18n,
    router,
    store,
    ssrContext,
    render: h => h(App)
  });

  return { app, router, store };
};