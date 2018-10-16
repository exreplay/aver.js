import Vue from 'vue';
import { createApp } from './app';
import { forEach } from 'lodash';

Vue.prototype.$auth = null;
Vue.prototype.$modernizr = {};
Vue.prototype.$csrf = '';

const mixinContext = require.context('@/', false, /^\.\/entry-server\.js$/i);

export default async context => {
    try {
        const { app, router, store } = createApp({ isServer: true, context });
        const { url } = context;
        const meta = app.$meta();

        router.push(url);

        await new Promise((resolve, reject) => router.onReady(resolve, reject));
        const matchedComponents = router.getMatchedComponents();

        if (!matchedComponents.length) throw { code: 404 };

        context.meta = { inject: function() { Object.assign(this, meta.inject()); } };
        
        for (const r of mixinContext.keys()) {
            const EntryServerMixin = mixinContext(r).default;
            if (typeof EntryServerMixin !== 'undefined') {
                new EntryServerMixin(context);
            }
        }
        
        for(const [key, action] of Object.entries(store._actions)) {
            if (key.match(/serverInit/g)) {
                await store.dispatch(key, context);
            }
        }
        
        for(const component of matchedComponents) {
            if (typeof component.options.asyncData === 'function' && component.options.asyncData) {
                await component.options.asyncData({
                    store,
                    route: router.currentRoute,
                    data: component.options.props,
                    isServer: true
                });
            }
        }

        context.state = store.state;
        return app;
    } catch (err) {
        throw err;
    }
};
