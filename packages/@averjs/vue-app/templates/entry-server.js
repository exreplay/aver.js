<% /* eslint-disable no-undef */ %>
import { createApp } from './app';
import Vue from 'vue';
import App from '@/App.vue';
import { applyAsyncData, composeComponentOptions, sanitizeComponent } from './utils';

<% if (config.csrf) { %> Vue.prototype.$csrf = ''; <% } %>

export default async context => {
  try {
    <% const extensions = config.additionalExtensions.join('|'); %>
    const entries = <%= `require.context('./', true, /.\\/[^/]+\\/entry-server\\.(${extensions})$/i, 'lazy')` %>;
    const mixinContext = <%= `require.context('@/', false, /^\\.\\/entry-server\\.(${extensions})$/i, 'lazy')` %>;
    const entryMixins = [entries, mixinContext];

    const renderedFns = [];
    const contextRendered = fn => {
      if (typeof fn === 'function') renderedFns.push(fn);
    };
    const { app, router, store, userReturns } = await createApp({ isServer: true, context });
    const meta = app.$meta();

    await new Promise(resolve => {
      router.push(context.url, resolve, () => {
        // if a navigation guard redirects to a new url, wait for it to be resolved, before continue
        const unregister = router.afterEach(to => {
          context.url = to.fullPath;
          context.params = to.params;
          context.query = to.query;
          unregister();
          resolve();
        });
      });
    });
    context.meta = meta;

    await new Promise((resolve, reject) => router.onReady(resolve, reject));
    const matchedComponents = router.getMatchedComponents();

    if (!matchedComponents.length) {
      const error = new Error('Page not found!');
      error.code = 404;
      throw error;
    }

    for (const entryMixin of entryMixins) {
      for (const entry of entryMixin.keys()) {
        const { default: mixin } = await entryMixin(entry);
        if (typeof mixin === 'function') await mixin({ ...context, userReturns, contextRendered });
      }
    }
        
    for (const [key] of Object.entries(store._actions)) {
      if (key.match(/serverInit/g)) {
        await store.dispatch(key, context);
      }
    }

    const asyncDatas = [];

    const { asyncData } = composeComponentOptions(App);
    if (typeof asyncData === 'function' && asyncData) {
      const data = await asyncData({
        app,
        store,
        route: {
          to: router.currentRoute,
          from: undefined
        },
        isServer: true
      });

      if (data) {
        const SanitizedApp = sanitizeComponent(App);
        applyAsyncData(SanitizedApp, data);
        if (!context.ssrState.asyncData) context.ssrState.asyncData = {};
        context.ssrState.asyncData.app = data;
      }
    }

    for (const component of matchedComponents) {
      const { asyncData } = composeComponentOptions(component);

      if (typeof asyncData === 'function' && asyncData) {
        const data = await asyncData({
          app,
          store,
          route: {
            to: router.currentRoute,
            from: undefined
          },
          isServer: true
        });

        if (data) {
          const SanitizedComponent = sanitizeComponent(component);
          applyAsyncData(SanitizedComponent, data);
          if (!context.ssrState.asyncData) context.ssrState.asyncData = {};
          asyncDatas.push(data);
        } else {
          asyncDatas.push(null);
        }
      } else {
        asyncDatas.push(null);
      }
    }

    context.ssrState.data = asyncDatas;

    context.rendered = async() => {
      for (const fn of renderedFns) await fn(context);
      context.state = store.state;
    };
        
    return app;
  } catch (error) {
    throw error;
  }
};
