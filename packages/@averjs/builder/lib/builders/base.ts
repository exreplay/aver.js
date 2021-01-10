// import LRU from 'lru-cache';
import { createBundleRenderer } from 'vue-bundle-renderer';
import { VueMetaPlugin } from 'vue-meta';
import { Request } from 'express';
import path from 'path';
import * as bundleRunner from 'bundle-runner';

export type BundleRendererOptions = Parameters<typeof createBundleRenderer>[1];

export interface BuilderContext {
  [index: string]: any;
  title: string | undefined;
  url: string;
  req: Partial<Request>;
  meta?: VueMetaPlugin;
  csrfToken?: string;
  state?: Record<string, unknown>;
}

export default class BaseBuilder {
  createRenderer(bundle: string, options: Partial<BundleRendererOptions>) {
    return createBundleRenderer(bundle, {
      ...options,
      runInNewContext: false,
      vueServerRenderer: require('@vue/server-renderer'),
      bundleRunner,
      basedir: path.resolve(process.env.PROJECT_PATH, '../dist'),
      publicPath: '/dist/'
    } as BundleRendererOptions);
  }
}
