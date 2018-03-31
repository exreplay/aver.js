import Vue              from 'vue';
import { createApp }    from './app';
import _                from 'lodash';

Vue.prototype.$auth = null;
Vue.prototype.$modernizr = {};
Vue.prototype.$csrf = '';

export default context => {
    return new Promise((resolve, reject) => {
        const { app, router, store } = createApp({isServer: true});
        const meta = app.$meta();

        const { url } = context;
        router.push(url);
        context.meta = { inject: function() { Object.assign(this, meta.inject()); } };

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
                let dispatches = [];

                _.forEach(store._actions, (action, key) => {
                    if (key.match(/serverInit/g)) {
                        dispatches.push(store.dispatch(key, context));
                    }
                });

                Promise.all(dispatches).then(() => {
                    context.state = store.state;
                    resolve(app);
                }).catch(reject);
            }).catch(reject);
        }, reject);
    });
};
