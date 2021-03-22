<% /* eslint-disable no-undef */ %>
import { createApp } from './app';
import Vue from 'vue';
import axios from 'axios';
import { applyAsyncData, composeComponentOptions } from './utils';

(async() => {
  const { app, router, store, userReturns } = await createApp({ isServer: false });

  class ClientEntry {
    async init() {
      <% if (config.csrf) { %> this.configureCSRF(); <% } %>
      this.setRouterMixins();
      await this.initMixin();
  
      router.onReady(async() => {
        const averState = window.__AVER_STATE__;

        if (averState.asyncData) {
          const route = router.match(this.getLocation(router.options.base));
          for (const matched of route.matched) {
            for (const key of Object.keys(matched.components)) {
              let Component = matched.components[key];
  
              if (typeof Component === 'function' && !Component.options) {
                Component = await Component();
              }
  
              applyAsyncData(Component, averState.asyncData[Component.cid]);
            }
          }
        }

        router.beforeResolve(async(to, from, next) => {
          const matched = router.getMatchedComponents(to);
          const prevMatched = router.getMatchedComponents(from);
          let diffed = false;
          const activated = matched.filter((c, i) => diffed || (diffed = (prevMatched[i] !== c)));
          const asyncDataHooks = activated.map(c => {
            const { asyncData } = composeComponentOptions(c);
            if (typeof asyncData === 'function' && asyncData) return { c, asyncData };
            else return false;
          }).filter(_ => _);
  
          if (!asyncDataHooks.length) return next();
  
          try {
            await Promise.all(asyncDataHooks.map(async({ c, asyncData }) => {
              const data = await asyncData({ store, route: { to, from }, isServer: false });
              applyAsyncData(c, data);
            }));
            next();
          } catch (error) {
            next(error);
          }
        });
        
        app.$mount('#app');
      });
    }

    getLocation(base) {
      let path = window.location.pathname;
      if (base && path.toLowerCase().indexOf(base.toLowerCase()) === 0) {
        path = path.slice(base.length);
      }
      return (path || '/') + window.location.search + window.location.hash;
    }
  
    async initMixin() {
      <% const extensions = config.additionalExtensions.join('|'); %>
      const entries = <%= `require.context('./', true, /.\\/[^/]+\\/entry-client\\.(${extensions})$/i)` %>;
      const mixinContext = <%= `require.context('@/', false, /^\\.\\/entry-client\\.(${extensions})$/i)` %>;
      const entryMixins = [entries, mixinContext];
  
      for (const entryMixin of entryMixins) {
        for (const entry of entryMixin.keys()) {
          const mixin = entryMixin(entry).default;
          if (typeof mixin === 'function') await mixin({ userReturns });
        }
      }
    }
  
    <% if (config.csrf) { %>
    configureCSRF() {
      const token = document.querySelector('meta[name="csrf-token"]');
  
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        Vue.prototype.$csrf = token.content;
      } else {
        console.error('CSRF token not found');
      }
    }
    <% } %>
  
    setRouterMixins() {
      Vue.mixin({
        async beforeRouteUpdate(to, from, next) {
          const { asyncData } = this.$options;
          if (asyncData) {
            try {
              const data = await asyncData({
                store: this.$store,
                route: { to, from },
                isServer: false
              });
              applyAsyncData(this, data);
              next();
            } catch (error) {
              next(error);
            }
          } else {
            next();
          }
        }
      });
    }
  }

  const clientEntry = new ClientEntry();
  await clientEntry.init();
})();
