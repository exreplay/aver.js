import Vue                  from 'vue';
import Vuex                 from 'vuex';
import forEach              from 'lodash/forEach';
import { ExportVuexStore }  from 'vuex-decorators';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export function createStore(ssrContext) {
    const files = require.context('@/', true, /vuex\/[^.]+\.js$/i);
    const modules = {};
    const persistent = [];

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

    const store = new Vuex.Store({
        modules
    });

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

        if (persistent.length > 0) {
            createPersistedState({
                paths: persistent
            })(store);
        }
    }

    return store;
}
