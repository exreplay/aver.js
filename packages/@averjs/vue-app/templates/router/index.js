import Vue from 'vue';
import VueRouter from 'vue-router';
import Meta from 'vue-meta';

Vue.use(VueRouter);
Vue.use(Meta);

export function createRouter({ i18n }) {
  const routes = require('@/pages').default;
  let config = {
    mode: 'history',
    fallback: false
  };

  if (Array.isArray(routes)) config = { ...config, routes };
  else if (typeof routes === 'function') config = routes({ i18n, config });

  return new VueRouter(config);
}
