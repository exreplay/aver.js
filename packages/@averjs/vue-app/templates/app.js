<% /* eslint-disable no-undef */ %>
import './register-component-hooks';
import Vue from 'vue';
import axios from 'axios';
import merge from 'lodash/merge';
import App from '@/App.vue';
import { createRouter } from './router/';
import { createStore } from './store/';
import { createI18n } from './i18n';
import { sync } from 'vuex-router-sync';
import { applyAsyncData, sanitizeComponent } from './utils';
<% if (config.progressbar) { %>
import VueProgressBar from 'vue-progressbar';

Vue.use(VueProgressBar, {
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
  inverse: false,
  <%= typeof config.progressbar === 'object' ? `...JSON.parse('${JSON.stringify(config.progressbar)}')` : '' %>
});
<% } %>

axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
  return Promise.reject(error);
});

export async function createApp(ssrContext) {
  const i18n = createI18n(ssrContext);
  const store = createStore(ssrContext);
  const router = createRouter({ i18n, store, ssrContext });

  sync(store, router);

  Vue.router = router;
  
  if (!ssrContext.isServer) {
    const averState = window.__AVER_STATE__;
    if (averState.asyncData && averState.asyncData.app) applyAsyncData(sanitizeComponent(App), averState.asyncData.app);
  }

  const appOptions = {
    i18n,
    router,
    store,
    ssrContext,
    context: {},
    render: h => h(App)
  };
  
  let userReturns = {};
  <% const extensions = config.additionalExtensions.join('|'); %>
  const entries = <%= `require.context('./', true, /.\\/[^/]+\\/app\\.(${extensions})$/i);` %>;
  const mixinContext = <%= `require.context('@/', false, /^\\.\\/app\\.(${extensions})$/i);` %>;
  const entryMixins = [entries, mixinContext];

  for (const entryMixin of entryMixins) {
    for (const entry of entryMixin.keys()) {
      const mixin = entryMixin(entry).default;
      if (typeof mixin === 'function') {
        const returns = await mixin({ ...ssrContext, appOptions });
        userReturns = merge(userReturns, returns);
      }
    }
  }
    
  const app = new Vue(appOptions);

  return { app, router, store, userReturns };
}
