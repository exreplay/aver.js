import Vue          from 'vue';
import VueRouter    from 'vue-router';
import Meta         from 'vue-meta';

Vue.use(VueRouter);
Vue.use(Meta);

export function createRouter() {
    const routes = require('@/pages').default;

    return new VueRouter({
        mode: 'history',
        fallback: false,
        routes: routes
    });
}
