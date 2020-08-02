import { createBundleRenderer } from 'vue-bundle-renderer';

export default class BaseBuilder {
  createRenderer(bundle, options) {
    const bundleOptions = {
      vueServerRenderer: require('@vue/server-renderer'),
      runInNewContext: false
    };
  
    return createBundleRenderer(bundle, Object.assign(options, bundleOptions));
  }
}
