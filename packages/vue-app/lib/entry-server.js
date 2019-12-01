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
          route: router.currentRoute,
          isServer: true
        });
      }
    }

    const { asyncData } = composeComponentOptions(App);
    if (typeof asyncData === 'function' && asyncData) {
      await asyncData({
        store,
        route: router.currentRoute,
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
