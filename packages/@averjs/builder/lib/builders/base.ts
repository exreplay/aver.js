// import LRU from 'lru-cache';
import { createBundleRenderer } from 'vue-bundle-renderer';
import { VueMetaPlugin } from 'vue-meta';
import { Request } from 'express';
import { renderToString } from '@vue/server-renderer';
import * as bundleRunner from 'bundle-runner';

export type BundleRendererOptions = Parameters<typeof createBundleRenderer>[1];

export interface BuilderContext {
  title: string | undefined;
  url: string;
  req: Partial<Request>;
  csrfToken?: string;
  meta?: VueMetaPlugin;
  state?: Record<string, unknown>;
}

export default class BaseBuilder {
  createRenderer(bundle: string, options: BundleRendererOptions) {  
    return createBundleRenderer(bundle, {
      ...options,
      runInNewContext: false,
      renderToString,
      bundleRunner
    });
  }
}
