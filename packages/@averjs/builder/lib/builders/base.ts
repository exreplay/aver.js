import LRU from 'lru-cache';
import {
  createBundleRenderer,
  BundleRendererOptions,
  BundleRenderer
} from 'vue-server-renderer';
import { VueMetaPlugin } from 'vue-meta';
import { Request } from 'express';

export interface BuilderContext {
  [index: string]: any;
  title: string | undefined;
  url: string;
  req: Partial<Request>;
  meta?: VueMetaPlugin;
  csrfToken?: string;
  state?: Record<string, unknown>;
  renderStyles?: () => string;
  renderResourceHints?: () => string;
  renderScripts?: () => string;
}

export default class BaseBuilder {
  createRenderer(
    bundle: string,
    options: BundleRendererOptions
  ): BundleRenderer {
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
