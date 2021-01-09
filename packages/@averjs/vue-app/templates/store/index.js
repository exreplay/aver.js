<% /* eslint-disable no-undef */ %>
import { createStore as createVuexStore } from 'vuex';
import { ExportVuexStore, config } from '@averjs/vuex-decorators';
import createPersistedState from 'vuex-persistedstate';
import * as Cookies from 'js-cookie';
import merge from 'lodash/merge';

export function createStore(ssrContext) {
  <% const extensions = config.additionalExtensions.join('|'); %>
  const files = <%= `require.context('@/', true, /vuex\\/([^/]+)\\.(${extensions})$/i);` %>;
  const modules = {};
  const persistent = [];
  const plugins = [];
  let defaultConfig = {};
  let globalStoreSet = false;
  const ignoredGlobalStores = [];

  for (const r of files.keys()) {
    const store = files(r).default;

    if (typeof store === 'function') {
      const storeFile = ExportVuexStore(store);
      if (typeof storeFile.moduleName !== 'undefined') {
        modules[storeFile.moduleName] = storeFile;
          
        if (storeFile.persistent && typeof storeFile.persistent === 'boolean') {
          persistent.push(storeFile.moduleName);
        } else if (storeFile.persistent && typeof storeFile.persistent === 'object') {
          for (const state of storeFile.persistent) {
            persistent.push(storeFile.moduleName + '.' + state);
          }
        }
      }
    } else if (typeof store === 'object' && store.moduleName) {
      modules[store.moduleName] = store;
    } else if (typeof store === 'object') {
      if (!globalStoreSet) {
        // Copy object, otherwise it is not mutable
        const globalStore = { ...store };
        if (globalStore.namespaced) delete globalStore.namespaced;
        defaultConfig = { ...globalStore };
        globalStoreSet = r;
      } else {
        ignoredGlobalStores.push(r);
      }
    }
  }

  if (ignoredGlobalStores.length > 0 && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    // eslint-disable-next-line no-return-assign
    const ignoreGlobalStoresList = ignoredGlobalStores.reduce((prev, cur) => prev += `, '${cur}'`, '').substring(1);

    console.warn(`
We found multiple files which try to set the global store. Be aware that there can only be 1 global store file.
The file '${globalStoreSet}' was used.
The following files have been ignored:${ignoreGlobalStoresList}.
    `);
  }

  if (persistent.length > 0) {
    plugins.push(
      createPersistedState({
        paths: persistent,
        storage: {
          getItem: key => {
            if (ssrContext.isServer) return ssrContext.context.req.cookies[key];
            return Cookies.get(key);
          },
          setItem: (key, value) => Cookies.set(key, value, { expires: 3, secure: process.env.NODE_ENV === 'production' }),
          removeItem: key => Cookies.remove(key)
        }
      })
    );
  }

  defaultConfig = { ...defaultConfig, modules, plugins };
  <% if (typeof config.store === 'object') print('defaultConfig = merge(defaultConfig, JSON.parse(\'' + JSON.stringify(config.store) + '\'))'); %>
  
  <% print(`const mixinContext = require.context('@/', false, /^\\.\\/store\\.(${extensions})$/i);`); %>

  // eslint-disable-next-line no-undef
  for (const r of mixinContext.keys()) {
    // eslint-disable-next-line no-undef
    const mixin = mixinContext(r).default;
    if (typeof mixin !== 'undefined') {
      const mixinConfig = mixin(defaultConfig);
      defaultConfig = merge(defaultConfig, mixinConfig);
    }
  }

  const store = createVuexStore(defaultConfig);
  
  // Pass the final store to the @averjs/vuex-decorators configuration
  config.store = store;

  if (module.hot) {
    files.keys().map(path => files(path));
    module.hot.accept(files.id, () => {
      const newFiles = <%= `require.context('@/', true, /vuex\\/([^/]+)\\.(${extensions})$/i);` %>;
      const newModules = {};
      let newConfig = {};

      for (const r of newFiles.keys()) {
        const store = newFiles(r).default;
    
        if (typeof store === 'function') {
          const storeFile = ExportVuexStore(store);
          if (typeof storeFile.moduleName !== 'undefined') {
            newModules[storeFile.moduleName] = storeFile;
          }
        } else if (typeof store === 'object' && store.moduleName) {
          newModules[store.moduleName] = store;
        } else if (typeof store === 'object') {
          if (!globalStoreSet || globalStoreSet === r) {
            // Copy object, otherwise it is not mutable
            const globalStore = { ...store };
            if (globalStore.namespaced) delete globalStore.namespaced;
            newConfig = { ...globalStore };
            globalStoreSet = r;
          }
        }
      }

      store.hotUpdate({ ...newConfig, modules: newModules });
    });
  }

  if (!ssrContext.isServer) {
    if (window.__INITIAL_STATE__) {
      store.replaceState(window.__INITIAL_STATE__);
    }
  }

  if (persistent.length > 0) {
    createPersistedState({
      paths: persistent,
      storage: {
        getItem: key => {
          if (ssrContext.isServer) return ssrContext.context.req.cookies[key];
          return Cookies.get(key);
        },
        setItem: (key, value) => Cookies.set(key, value, { expires: 3, secure: process.env.NODE_ENV === 'production' }),
        removeItem: key => Cookies.remove(key)
      }
    })(store);
  }

  return store;
}
