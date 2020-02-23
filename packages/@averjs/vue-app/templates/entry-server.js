import { createApp } from './app';
import Vue from 'vue';
import App from '@/App.vue';
import { composeComponentOptions } from './utils';

Vue.prototype.$auth = null;
Vue.prototype.$modernizr = {};
<% if (config.csrf) { %> Vue.prototype.$csrf = ''; <% } %>

const mixinContext = require.context('@/', false, /^\.\/entry-server\.js$/i);

export default async context => {
  try {
    const entries = [
      <% 
        if(typeof config.entries !== 'undefined' && typeof config.entries.server !== 'undefined') {
          for(const entry of config.entries.server) {
            print(`require('${entry}')`);
          }
        }
      %>
    ];
    const { app, router, store } = createApp({ isServer: true, context });
    const { url } = context;
    const meta = app.$meta();

    router.push(url);
    context.meta = meta;

    await new Promise((resolve, reject) => router.onReady(resolve, reject));
    const matchedComponents = router.getMatchedComponents();

    if (!matchedComponents.length) {
      const error = new Error('Page not found!');
      error.code = 404;
      throw error;
    }
        
    for (const key of mixinContext.keys()) {
      const mixin = mixinContext(key).default;
      if (typeof mixin === 'function') mixin(context);
    }

    for(const entry of entries) {
      const mixin = entry.default;
      if(typeof mixin === 'function') mixin(context);
    }
        
    for (const [key] of Object.entries(store._actions)) {
      if (key.match(/serverInit/g)) {
        await store.dispatch(key, context);
      }
    }

    for (const component of matchedComponents) {
      const { asyncData } = composeComponentOptions(component);

      if (typeof asyncData === 'function' && asyncData) {
        await asyncData({
          store,
          route: {
            to: router.currentRoute,
            from: undefined
          },
          isServer: true
        });
      }
    }

    const { asyncData } = composeComponentOptions(App);
    if (typeof asyncData === 'function' && asyncData) {
      await asyncData({
        store,
        route: {
          to: router.currentRoute,
          from: undefined
        },
        isServer: true
      });
    }

    context.rendered = () => {
      context.state = store.state;
    };
        
    return app;
  } catch (err) {
    throw err;
  }
};
