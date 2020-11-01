import { createApp } from './app';
// import Vue from 'vue';
import App from '@/App.vue';
import { composeComponentOptions } from './utils';

// Vue.prototype.$auth = null;
// <% if (config.csrf) { %> Vue.prototype.$csrf = ''; <% } %>

export default async context => {
  try {
    <%
      const extensions = config.additionalExtensions.join('|');
      print(`
    const entries = require.context('./', true, /.\\/[^/]+\\/entry-server\\.(${extensions})$/i);
    const mixinContext = require.context('@/', false, /^\\.\\/entry-server\\.(${extensions})$/i);
      `);
    %>
    const entryMixins = [ entries, mixinContext ];

    const renderedFns = [];
    const contextRendered = fn => {
      if(typeof fn === 'function') renderedFns.push(fn);
    }
    const { app, router, store, userReturns } = await createApp({ isServer: true, context });
    // const meta = app.$meta();

    // try {
    //   await router.push(context.url);
    // } catch {
    //   await new Promise((resolve, reject) => {
    //     const unregister = router.afterEach((to, from, next) => {
    //       context.aver.routePath = to.fullPath;
    //       context.url = to.fullPath;
    //       context.params = to.params;
    //       context.query = to.query;
    //       unregister();
    //       resolve();
    //     });
    //   });
    // }
    // context.meta = meta;
    await router.push(context.url);
    context.meta = {};

    await router.isReady();
    const matchedComponents = router.currentRoute.value.matched.flatMap(record => Object.values(record.components));

    if (!matchedComponents.length) {
      const error = new Error('Page not found!');
      error.code = 404;
      throw error;
    }

    for(const entryMixin of entryMixins) {
      for(const entry of entryMixin.keys()) {
        const mixin = entryMixin(entry).default;
        if(typeof mixin === 'function') await mixin({...context, userReturns, contextRendered});
      }
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

    context.rendered = async () => {
      for(const fn of renderedFns) await fn(context);
      context.state = store.state;
    };
        
    return app;
  } catch (err) {
    throw err;
  }
};
