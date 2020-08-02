import {
  createRouter as createVueRouter,
  createWebHistory,
  createMemoryHistory
} from 'vue-router';
// import Meta from 'vue-meta';

// Vue.use(VueRouter);
// Vue.use(Meta, {
//   ssrAppId: 1
// });

export function createRouter({ i18n, store, ssrContext }) {
  const routes = require('@/pages').default;
  let config = {
    history: ssrContext.isServer ? createMemoryHistory() : createWebHistory(),
    fallback: false
  };

  if (Array.isArray(routes)) config = { ...config, routes };
  else if (typeof routes === 'function') config = routes({ i18n, store, ssrContext, config });

  return createVueRouter(config);
}
