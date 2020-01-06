import LRU from 'lru-cache';
import { createBundleRenderer } from 'vue-server-renderer';

export default class BaseBuilder {
  createRenderer(bundle, options) {
    const bundleOptions = {
      cache: new LRU({
        max: 1000,
        maxAge: 1000 * 60 * 15
      }),
      runInNewContext: false
    };
  
    return createBundleRenderer(bundle, Object.assign(options, bundleOptions));
  }
}
