import { StoreOptions } from 'vuex';

export interface AverVueAppConfig {
  store?: StoreOptions<any>;
}

export default (): AverVueAppConfig => ({
  store: {}
});
