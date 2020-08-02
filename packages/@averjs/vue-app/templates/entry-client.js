import { createApp } from './app';
import axios from 'axios';
import { composeComponentOptions } from './utils';

(async () => {
  const { app, router, store, userReturns } = await createApp({ isServer: false });

  class ClientEntry {
    async init() {
      // this.addMobileCheck();
      <% if (config.csrf) { %> this.configureCSRF(); <% } %>
      // this.setRouterMixins();
      await this.initMixin();
  
      router.beforeResolve(async (to, from, next) => {
        const matched = to.matched;
        const prevMatched = from.matched;
        let diffed = false;
        const activated = matched.filter((c, i) => diffed || (diffed = (prevMatched[i] !== c)));
        const asyncDataHooks = activated.map(c => {
          const { asyncData } = composeComponentOptions(c);
          if (typeof asyncData === 'function' && asyncData) return asyncData
          else return false;
        }).filter(_ => _);

        if (!asyncDataHooks.length) return next();

        try {
          await Promise.all(asyncDataHooks.map(hook => hook({ store, route: { to, from }, isServer: false })))
          next();
        } catch(err) {
          next(err);
        }
      });
      
      // if(window.__AVER__.routePath === app.$options.context.route.fullPath) app.$mount('#app');
      // else {
      //   const unregister = router.afterEach((to, from, next) => {
      //     unregister();
      //     app.$mount('#app');
      //   });
      // }

      app.mount('#app');
    }
  
    async initMixin() {
      <%
        const extensions = config.additionalExtensions.join('|');
        print(`
      const entries = require.context('./', true, /.\\/[^/]+\\/entry-client\\.(${extensions})$/i);
      const mixinContext = require.context('@/', false, /^\\.\\/entry-client\\.(${extensions})$/i);
        `);
      %>
      const entryMixins = [ entries, mixinContext ];
  
      for(const entryMixin of entryMixins) {
        for(const entry of entryMixin.keys()) {
          const mixin = entryMixin(entry).default;
          if(typeof mixin === 'function') await mixin({ userReturns });
        }
      }
    }
  
    <% if (config.csrf) { %>
    configureCSRF() {
      let token = document.querySelector('meta[name="csrf-token"]');
  
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        // Vue.prototype.$csrf = token.content;
      } else {
        console.error('CSRF token not found');
      }
    }
    <% } %>
  
    // setRouterMixins() {
    //   Vue.mixin({
    //     async beforeRouteUpdate(to, from, next) {
    //       const { asyncData } = this.$options;
    //       if (asyncData) {
    //         try {
    //           await asyncData({
    //             store: this.$store,
    //             route: { to, from },
    //             isServer: false
    //           });
    //           next();
    //         } catch(err) {
    //           next(err);
    //         }
    //       } else {
    //         next();
    //       }
    //     }
    //   });
    // }
  }

  const clientEntry = new ClientEntry();
  await clientEntry.init();
})();