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

// Logic from vue-router https://github.com/vuejs/vue-router/blob/4c81be8ffb00b545396766f0a7ffff3c779b64db/src/history/html5.js#L88
function getLocation (base) {
  let path = decodeURI(window.location.pathname)
  if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
    path = path.slice(base.length)
  }
  return (path || '/') + window.location.search + window.location.hash
}

export async function createApp(ssrContext) {
  const i18n = createI18n(ssrContext);
  const store = createStore(ssrContext);
  const router = createRouter({ i18n, store, ssrContext });

  sync(store, router);

  Vue.router = router;

  const appOptions = {
    i18n,
    router,
    store,
    ssrContext,
    context: {},
    render: h => h(App)
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

  if(ssrContext.isServer) {
    appOptions.context.route = router.resolve(ssrContext.context.url).route;
  } else {
    const path = getLocation(router.options.base);
    appOptions.context.route = router.resolve(path).route;
  }
    
  const app = new Vue(appOptions);

  return { app, router, store, userReturns };
};
