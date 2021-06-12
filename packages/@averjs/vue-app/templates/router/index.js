/* eslint-disable @typescript-eslint/no-var-requires */
import Vue from 'vue';
import VueRouter from 'vue-router';
import RouterPrefetch from 'vue-router-prefetch';
import Meta from 'vue-meta';

Vue.use(VueRouter);
Vue.use(RouterPrefetch);
Vue.use(Meta, {
  ssrAppId: 1
});

export async function createRouter({ store, ssrContext }) {
  let routes = [{ path: '/', component: {} }];

  <% const extensions = config.additionalExtensions.join('|'); %>
  const mixinContext = <%= `require.context('@', true, /^\\.\\/pages\\/index\\.(${extensions})$/i, 'lazy')` %>;
  for (const r of mixinContext.keys()) {
    ({ default: routes } = await mixinContext(r));
  }

  let config = {
    mode: 'history',
    fallback: false
  };

  if (Array.isArray(routes)) config = { ...config, routes };
  else if (typeof routes === 'function') {
    config = await routes({ store, ssrContext, config });
  }

  return new VueRouter(config);
}
