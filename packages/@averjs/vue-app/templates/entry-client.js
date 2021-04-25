<% /* eslint-disable no-undef */ %>
import { createApp } from './app';
import Vue from 'vue';
import axios from 'axios';
import { applyAsyncData, composeComponentOptions, sanitizeComponent } from './utils';

(async() => {
  const { app, router, store, userReturns } = await createApp({ isServer: false });

  class ClientEntry {
    async init() {
      <% if (config.csrf) { %> this.configureCSRF(); <% } %>
      this.setRouterMixins();
      await this.initMixin();
  
      router.onReady(async() => {
        const averState = window.__AVER_STATE__;

        if (averState.data) {
          const route = router.match(this.getLocation(router.options.base));
          let index = 0;
          for (const matched of route.matched) {
            for (const key of Object.keys(matched.components)) {
              let Component = matched.components[key];
  
              if (typeof Component === 'function' && !Component.options) {
                Component = await Component();
              }
  
              const SanitizedComponent = sanitizeComponent(Component);
              applyAsyncData(SanitizedComponent, averState.data[index]);
            }
            index++;
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
              const data = await asyncData({ app, store, route: { to, from }, isServer: false });
              const SanitizedComponent = sanitizeComponent(c);
              applyAsyncData(SanitizedComponent, data);
            }));
            next();
          } catch (error) {
            next(error);
          }
        });
        
        app.$mount('#app');

        router.afterEach(() => {
          Vue.nextTick(() => {
            setTimeout(() => this.hotReload(), 100);
          });
        });
        
        Vue.nextTick(() => {
          this.hotReload();
        });
      });
    }

    hotReload() {
      if (module.hot) {
        const route = router.match(this.getLocation(router.options.base));
        // Map the matched routes and return their ctor
        const routes = route.matched.map(m => {
          const component = m.components.default;
          if (typeof component === 'object' && !component.options) return component._Ctor[0];
          else return component;
        });
        const components = this.deepMapChildren(app.$root.$children, [], routes);
        components.forEach(this.applyHmrUpdate.bind(this));
      }
    }

    deepMapChildren(children, components, routes) {
      for (const child of children) {
        // Compare the components ctor to find only router components
        const isRoute = routes.find(r => r === child.$options._Ctor[0]);
        if (isRoute) components.push(child);
        // If App.vue component has no asyncData, push it anyway so that hmr works if it gets added later.
        // Because the App.vue component always is the entry point we check if the parent is the root instance.
        else if (!isRoute && child.$options.parent === app.$root) components.push(child);

        if (child.$children && child.$children.length) this.deepMapChildren(child.$children, components, routes);
      }

      return components;
    }

    applyHmrUpdate(component, index) {
      if (component.$vnode.data._hasHotReload) return;
      component.$vnode.data._hasHotReload = true;
      
      const _forceUpdate = component.$forceUpdate.bind(component.$parent);
      const hotReload = this.hotReload.bind(this);

      component.$vnode.context.$forceUpdate = async function() {
        if (index - 1 >= 0) {
          const matched = router.currentRoute.matched[index - 1];
          if (!matched) return;
          for (const key of Object.keys(matched.components)) {
            let Component = matched.components[key];
  
            if (typeof Component === 'object' && !Component.options) {
              Component = Vue.extend(Component);
              Component._Ctor = Component;
            }
  
            const { asyncData } = Component.options;
            if (asyncData) {
              const data = await asyncData({
                app,
                store,
                route: { to: router.currentRoute },
                isServer: false
              });
              applyAsyncData(Component, data);
            }
          }
          _forceUpdate();
          setTimeout(() => hotReload(), 100);
        } else {
          await _forceUpdate();

          const Component = this.$children[0];

          const { asyncData } = Component.$options;
          if (asyncData) {
            const data = await asyncData({
              app,
              store,
              route: { to: router.currentRoute },
              isServer: false
            });

            for (const key of Object.keys(data || {})) {
              Component[key] = data[key];
            }
          }

          setTimeout(() => hotReload(), 100);
        }
      };
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
                app,
                store: this.$store,
                route: { to, from },
                isServer: false
              });
              for (const key of Object.keys(data || {})) {
                this[key] = data[key];
              }
              next();
            } catch (error) {
              next(error);
            }
            next();
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
