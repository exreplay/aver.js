const stores = {};

export function VuexClass(options) {
    if (typeof options === 'function') {
        assignStates(options);
    } else {
        return (target) => {
            let store = stores[getClassName(target)];

            if (typeof options !== 'undefined' && typeof options.extend !== 'undefined') {
                for (let i = 0; i < Object.keys(options.extend).length; i++) {
                    const obj = options.extend[Object.keys(options.extend)[i]];
                    const extendStore = stores[obj.name];
                    Object.assign(store.state, extendStore.state);
                    Object.assign(store.getters, extendStore.getters);
                    Object.assign(store.actions, extendStore.actions);
                    Object.assign(store.mutations, extendStore.mutations);
                }
            }

            assignStates(target);
            if (typeof options !== 'undefined') {
                if (options.persistent) { store['persistent'] = options.persistent; } else { store['persistent'] = false; }
            }
        };
    }
}

export function Getter(target, key, descriptor) {
    initStore(target);
    stores[getClassName(target)].getters[key] = (state, getters, rootState, rootGetters) => {
        const thisObject = { $store: { state, getters, rootState, rootGetters }};
        for(const key of Object.keys(state)) {
            Object.assign(thisObject, { [key]: state[key] });
        }
        const output = target[key].call(thisObject);
        return output;
    };
}

export function HasGetter(target, key, descriptor) {
    initStore(target);
    stores[getClassName(target)].getters[key] = state => state[key];
}

export function Mutation(target, key, descriptor) {
    initStore(target);
    stores[getClassName(target)].mutations[key] = (state, payload) => {
        target[key].call(state, payload);
    };
}

export function HasGetterAndMutation(target, key, descriptor) {
    initStore(target);
    stores[getClassName(target)].getters[key] = state => state[key];
    stores[getClassName(target)].mutations[key] = (state, val) => {
        state[key] = val;
    };
}

export function Action(target, key, descriptor) {
    initStore(target);
    stores[getClassName(target)].actions[key] = ({ state, rootState, commit, dispatch, getters, rootGetters }, payload) => {
        const thisObject = { $store: { state, rootState, commit, dispatch, getters, rootGetters } };
        for(const key of Object.keys(state)) {
            Object.assign(thisObject, { [key]: state[key] });
        }
        return target[key].call(thisObject, payload);
    };
}

export function ExportVuexStore(target) {
    return stores[getClassName(target)];
}

function assignStates(Obj) {
    const target = new Obj();
    const props = Object.getOwnPropertyNames(target);
    if (typeof target['moduleName'] === 'undefined') {
        console.error(`You need to define the 'moduleName' class variable inside '${target.constructor.name}'! Otherwise it won't be added to the Vuex Store!`);
    }
    stores[getClassName(target)]['moduleName'] = target['moduleName'];
    props.splice(props.indexOf('moduleName'), 1);
    
    initStore(target);
    
    const stateFactory = () => getStates(target, props);
    stores[getClassName(target)].state = stateFactory;

    const proto = Object.getPrototypeOf(target);
    const functions = Object.getOwnPropertyNames(proto);

    for(const func of functions) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, func);
        if(descriptor && descriptor.get) {
            stores[getClassName(target)].getters[func] = (state, getters, rootState, rootGetters) => {
                const thisObject = { $store: { state, getters, rootState, rootGetters }};
                for(const key of Object.keys(state)) {
                    Object.assign(thisObject, { [key]: state[key] });
                }
                const output = descriptor.get.call(thisObject);
                return output;
            };
        } else if(descriptor) {
            // console.log(func, descriptor);
        }
    }
}

function getStates(target, props) {
    const s = {};
    for (let i = 0; i < Object.keys(props).length; i++) {
        const prop = props[Object.keys(props)[i]];
        s[prop] = target[prop];
    }
    return s;
}

function initStore(target) {
    if (typeof stores[getClassName(target)] === 'undefined') {
        stores[getClassName(target)] = {
            namespaced: true,
            state: () => { return {}; },
            getters: {},
            actions: {},
            mutations: {}
        };
    }
}

function getClassName(Obj) {
    let target = new Obj.constructor();
    if (typeof target === 'function') target = new Obj();
    return target['moduleName'];
}
