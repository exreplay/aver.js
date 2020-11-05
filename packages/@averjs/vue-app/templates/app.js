import './register-component-hooks';
import { createSSRApp } from 'vue';
import axios from 'axios';
import merge from 'lodash/merge';
import App from '@/App.vue';
import { createRouter } from './router/';
import { createStore } from './store/';
import { createI18n } from './i18n';
import { sync } from 'vuex-router-sync';
// <% if (config.progressbar) { %> 
// import VueProgressBar from 'vue-progressbar';
// <% } %>

// <% if (config.progressbar) { %>
// const options = {
//   color: '#003B8E',
//   failedColor: '#E0001A',
//   thickness: '2px',
//   transition: {
//     speed: '0.2s',
//     opacity: '0.6s',
//     termination: 300
//   },
//   autoRevert: true,
//   location: 'top',
//   inverse: false
// };

// Vue.use(VueProgressBar, <% typeof config.progressbar === 'object' ? print('Object.assign(options, JSON.parse(\''+JSON.stringify(config.progressbar)+'\'))') : print('options') %>);
// <% } %>

axios.interceptors.response.use((response) => {
  return response;
}, (error) => {
  return Promise.reject(error);
});

export async function createApp(ssrContext) {
  const app = createSSRApp(App);

  const i18n = createI18n({ app, ssrContext});
  const store = createStore(ssrContext);
  const router = createRouter({ i18n, store, ssrContext });

  sync(store, router);

  const appOptions = {
    i18n,
    ssrContext,
    context: {}
  };

  
  let userReturns = {};
  <%
    const extensions = config.additionalExtensions.join('|');
    print(`
  const entries = require.context('./', true, /.\\/[^/]\\/app\\.(${extensions})$/i);
  const mixinContext = require.context('@/', false, /^\\.\\/app\\.(${extensions})$/i);
    `);
  %>
  const entryMixins = [ entries, mixinContext ];

  for(const entryMixin of entryMixins) {
    for(const entry of entryMixin.keys()) {
      const mixin = entryMixin(entry).default;
      if(typeof mixin === 'function') {
        const returns = await mixin({ ...ssrContext, appOptions });
        userReturns = merge(userReturns, returns);
      }
    }
  }

  app.use(store).use(router)
  
  if(!ssrContext.isServer) app.use(i18n);

  return { app, router, store, userReturns };
};
