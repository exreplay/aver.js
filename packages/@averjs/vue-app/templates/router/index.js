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
  let routes = [{ path: '/', component: {} }];

  try {
    ({ default: routes } = require('@/pages'));
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') console.error(error);
  }

  let config = {
    history: ssrContext.isServer ? createMemoryHistory() : createWebHistory(),
    fallback: false
  };

  if (Array.isArray(routes)) config = { ...config, routes };
  else if (typeof routes === 'function') {
    config = routes({ i18n, store, ssrContext, config });
  }

  return createVueRouter(config);
}
