<% /* eslint-disable no-undef */ %>
import './register-component-hooks';
import Vue from 'vue';
import axios from 'axios';
import merge from 'lodash/merge';
import App from '@/App.vue';
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
  let appOptions = {
    ssrContext,
    context: {},
    render: h => h(App)
  };
  let userReturns = {};


  <% const extensions = config.additionalExtensions.join('|'); %>
  const entries = <%= `require.context('./', true, /.\\/[^/]+\\/app\\.(${extensions})$/i, 'lazy')` %>;
  const mixinContext = <%= `require.context('@/', false, /^\\.\\/app\\.(${extensions})$/i, 'lazy')` %>;
  const entryMixins = [entries, mixinContext];
  const mixins = [];
  const beforeMixins = [];

  for (const entryMixin of entryMixins) {
    for (const entry of entryMixin.keys()) {
      const { default: mixin, before } = await entryMixin(entry);
      if (typeof mixin === 'function') mixins.push(mixin);
      if (typeof before === 'function') beforeMixins.push(before);
    }
  }

  for(const mixin of beforeMixins) {
    const returns = await mixin({ ...ssrContext, appOptions });
    userReturns = merge(userReturns, returns);
  }

  const { createStore } = await import('./store/');
  const { createRouter } = await import('./router/');
  const store = await createStore(ssrContext);
  const router = await createRouter({ store, ssrContext });

  appOptions = {
    ...appOptions,
    router,
    store
  };

  for(const mixin of mixins) {
    const returns = await mixin({ ...ssrContext, appOptions });
    userReturns = merge(userReturns, returns);
  }

  sync(store, router);

  Vue.router = router;
  
  if (!ssrContext.isServer) {
    const averState = window.__AVER_STATE__;
    if (averState.asyncData && averState.asyncData.app) applyAsyncData(sanitizeComponent(App), averState.asyncData.app);
  }
    
  const app = new Vue(appOptions);

  return { app, router, store, userReturns };
}
