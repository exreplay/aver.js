/* eslint-disable @typescript-eslint/no-var-requires */
import Vue from 'vue';
import VueRouter from 'vue-router';
import Meta from 'vue-meta';

Vue.use(VueRouter);
Vue.use(Meta, {
  ssrAppId: 1
});

export function createRouter({ i18n, store, ssrContext }) {
  let routes = [{ path: '/', component: {} }];

  try {
    ({ default: routes } = require('@/pages'));
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') console.error(error);
  }

  let config = {
    mode: 'history',
    fallback: false
  };

  if (Array.isArray(routes)) config = { ...config, routes };
  else if (typeof routes === 'function') {
    config = routes({ i18n, store, ssrContext, config });
  }

  return new VueRouter(config);
}
