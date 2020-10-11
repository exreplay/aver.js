import LRU from 'lru-cache';
import { createBundleRenderer, BundleRendererOptions } from 'vue-server-renderer';
import { VueMetaPlugin } from 'vue-meta';
import { Request } from 'express';

export interface BuilderContext {
  title: string | undefined;
  url: string;
  req: Partial<Request>;
  csrfToken?: string;
  meta?: VueMetaPlugin;
  state?: Record<string, unknown>;
  renderStyles?: () => string;
  renderResourceHints?: () => string;
  renderScripts?: () => string;
}

export default class BaseBuilder {
  createRenderer(bundle: string, options: BundleRendererOptions) {
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
