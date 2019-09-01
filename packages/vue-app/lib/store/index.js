import Vue from 'vue';
import Vuex from 'vuex';
import forEach from 'lodash/forEach';
import { ExportVuexStore } from '@averjs/vuex-decorators';
import createPersistedState from 'vuex-persistedstate';
import * as Cookies from 'js-cookie';
import merge from 'lodash/merge'

Vue.use(Vuex);

export function createStore(ssrContext) {
  const files = require.context('@/', true, /vuex\/[^.]+\.js$/i);
  const modules = {};
  const persistent = [];
  const plugins = [];

  forEach(files.keys(), r => {
    const storeFile = ExportVuexStore(files(r).default);
    if (typeof storeFile.moduleName !== 'undefined') {
      modules[storeFile.moduleName] = storeFile;
        
      if (storeFile.persistent && typeof storeFile.persistent === 'boolean') {
        persistent.push(storeFile.moduleName);
      } else if (storeFile.persistent && typeof storeFile.persistent === 'object') {
        forEach(storeFile.persistent, state => {
          persistent.push(storeFile.moduleName + '.' + state);
        });
      }
    }
  });

  if (persistent.length > 0) {
    plugins.push(
      createPersistedState({
        paths: persistent,
        storage: {
          getItem: key => {
            if (ssrContext.isServer) return ssrContext.context.cookies[key];
            return Cookies.get(key);
          },
          setItem: (key, value) => Cookies.set(key, value, { expires: 3, secure: process.env.NODE_ENV === 'production' }),
          removeItem: key => Cookies.remove(key)
        }
      })
    );
  }

  let defaultConfig = { modules, plugins };
  <% if (typeof config.store === 'object') print('defaultConfig = merge(defaultConfig, JSON.parse(\''+JSON.stringify(config.store)+'\'))'); %>

  const mixinContext = require.context('@/', false, /^\.\/store\.js$/i);
  for (const r of mixinContext.keys()) {
    const mixin = mixinContext(r).default;
    if (typeof mixin !== 'undefined') {
      const mixinConfig = mixin(defaultConfig);
      defaultConfig = merge(defaultConfig, mixinConfig);
    }
  }

  const store = new Vuex.Store(defaultConfig);

  if (module.hot) {
    files.keys().map(path => files(path));
    module.hot.accept(files.id, () => {
      const newFiles = require.context('@/', true, /vuex\/[^.]+\.js$/i);
      const newModules = {};

      newFiles.keys().forEach(r => {
        const storeFile = ExportVuexStore(newFiles(r).default);
        newModules[storeFile.moduleName] = storeFile;
      });

      store.hotUpdate({
        modules: newModules
      });
    });
  }

  if (!ssrContext.isServer) {
    if (window.__INITIAL_STATE__) {
      store.replaceState(window.__INITIAL_STATE__);
    }
  }

  return store;
}
