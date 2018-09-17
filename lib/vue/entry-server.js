import Vue from 'vue';
import { createApp } from './app';
import { forEach } from 'lodash';

Vue.prototype.$auth = null;
Vue.prototype.$modernizr = {};
Vue.prototype.$csrf = '';

const mixinContext = require.context('@/', false, /^\.\/entry-server\.js$/i);

export default context => {
    return new Promise((resolve, reject) => {
        const { app, router, store } = createApp({ isServer: true, context });
        const meta = app.$meta();

        const { url } = context;
        router.push(url);
        context.meta = { inject: function() { Object.assign(this, meta.inject()); } };

        forEach(mixinContext.keys(), r => {
            const EntryServerMixin = mixinContext(r).default;
            if (typeof EntryServerMixin !== 'undefined') {
                new EntryServerMixin(context);
            }
        });

        let dispatches = [];

        forEach(store._actions, (action, key) => {
            if (key.match(/serverInit/g)) {
                dispatches.push(store.dispatch(key, context));
            }
        });

        Promise.all(dispatches).then(() => {
            context.state = store.state;

            router.onReady(() => {
                const matchedComponents = router.getMatchedComponents();
    
                if (!matchedComponents.length) {
                    return reject();
                }
    
                Promise.all(matchedComponents.map(Component => {
                    if (typeof Component.options.asyncData === 'function' && Component.options.asyncData) {
                        return Component.options.asyncData({
                            store,
                            route: router.currentRoute,
                            data: Component.options.props,
                            isServer: true
                        });
                    }
                })).then(() => {
                    resolve(app);
                }).catch(reject);
            }, reject);
        }).catch(reject);
    });
};
