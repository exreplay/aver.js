import Vue              from 'vue';
import Component        from 'vue-class-component';
import VueI18n          from 'vue-i18n';
import axios            from 'axios';
import App              from '@/App.vue';
import { createRouter } from './router/';
import { createStore }  from './store/';
import { sync }         from 'vuex-router-sync';
import Vuebar           from 'vuebar';

Vue.use(Vuebar);
Vue.use(VueI18n);

axios.interceptors.response.use((response) => {
    return response;
}, (error) => {
    return Promise.reject(error);
});

Component.registerHooks([
    'asyncData',
    'metaInfo'
]);

export function createApp(ssrContext) {
    const router = createRouter();
    const store = createStore(ssrContext);

    sync(store, router);

    const i18n = new VueI18n({
        locale: 'de',
        fallbackLocale: 'de'
    });

    Vue.prototype.$locale = {
        change(lang) {
            i18n.locale = lang;
        },
        current() {
            return i18n.locale;
        }
    };
    
    const app = new Vue({
        i18n,
        router,
        store,
        ssrContext,
        render: h => h(App)
    });

    Vue.router = router;

    return { app, router, store };
};
