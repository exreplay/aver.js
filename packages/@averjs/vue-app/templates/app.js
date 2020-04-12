import './register-component-hooks';
import Vue from 'vue';
import axios from 'axios';
import merge from 'lodash/merge';
import App from '@/App.vue';
import { createRouter } from './router/';
import { createStore } from './store/';
import { createI18n } from './i18n';
import { sync } from 'vuex-router-sync';
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

axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
  return Promise.reject(error);
});

export async function createApp(ssrContext) {
  const i18n = createI18n(ssrContext);
  const router = createRouter({ i18n });
  const store = createStore(ssrContext);

  sync(store, router);

  Vue.router = router;

  const appOptions = {
    i18n,
    router,
    store,
    ssrContext,
    render: h => h(App)
  };

  const entries = [
    <% 
      if(typeof config.entries !== 'undefined' && typeof config.entries.app !== 'undefined') {
        for(const entry of config.entries.app) {
          print(`require('${entry}'),`);
        }
      }
    %>
  ];
  let userReturns = {};

  const mixinContext = <%
    const extensions = config.additionalExtensions.join('|');
    print(`require.context('@/', false, /^\\.\\/app\\.(${extensions})$/i);`);
  %>
  for(const key of mixinContext.keys()) entries.push(mixinContext(key));

  for(const entry of entries) {
    const mixin = entry.default;
    if(typeof mixin === 'function') {
      const returns = await mixin({ ...ssrContext, appOptions });
      userReturns = merge(userReturns, returns);
    }
  }
    
  const app = new Vue(appOptions);

  return { app, router, store, userReturns };
};
