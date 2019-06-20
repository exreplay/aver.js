import Vue from 'vue';
import VueRouter from 'vue-router';
import Meta from 'vue-meta';

Vue.use(VueRouter);
Vue.use(Meta);

export function createRouter({ i18n }) {
  const routes = require('@/pages').default;
  const userConfig = <% if (typeof config.router === 'object') print('Object.assign({}, JSON.parse(\''+JSON.stringify(config.router)+'\'))'); %>
  const config = {
    mode: 'history',
    fallback: false,
    routes: typeof routes === 'function' ? routes({ i18n }) : routes
  };

  return new VueRouter(Object.assign(config, userConfig));
}
