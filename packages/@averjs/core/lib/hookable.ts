import Config from 'webpack-chain';
import { Express } from 'express';
import { ExpressMiddlewares } from './server';
import { Server } from 'http';
import { BuilderContext } from '@averjs/builder/lib/builders/base';
import { Watcher } from './core';

interface RegisterMiddlewaresContext {
  app: Express;
  middlewares: ExpressMiddlewares;
  server: Server;
}
type RegisterRoutesContext = RegisterMiddlewaresContext;

interface BeforeCompileSsrContext {
  context: BuilderContext;
  HTML_ATTR?: string;
  HEAD_ATTRS?: string;
  HEAD: (string | undefined)[];
  BODY_ATTRS?: string;
  BODY: (string | undefined)[];
}
type BeforeCompileStaticContext = BeforeCompileSsrContext;

interface TappableHooks {
  'server:before-register-middlewares': (
    context: RegisterMiddlewaresContext
  ) => Promise<void> | void;
  'server:after-register-middlewares': (
    context: RegisterMiddlewaresContext
  ) => Promise<void> | void;
  'server:before-register-routes': (
    context: RegisterRoutesContext
  ) => Promise<void> | void;
  'server:after-register-routes': (
    context: RegisterRoutesContext
  ) => Promise<void> | void;
  'builder:before-compile-static': (
    context: BeforeCompileStaticContext
  ) => Promise<void> | void;
  'builder:before-compile-ssr': (
    context: BeforeCompileSsrContext
  ) => Promise<void> | void;
  'renderer:base-config': (chain: Config) => Promise<void> | void;
  'renderer:client-config': (chain: Config) => Promise<void> | void;
  'renderer:server-config': (chain: Config) => Promise<void> | void;
  'before-close': (watchers: Watcher[]) => Promise<void> | void;
  'after-close': () => Promise<void> | void;
}

type Hooks = {
  [K in keyof TappableHooks]?: TappableHooks[K][];
};

export default class Hookable {
  hooks: Hooks = {};

  constructor() {
    this.tap = this.tap.bind(this);
    this.callHook = this.callHook.bind(this);
  }

  tap<K extends keyof TappableHooks>(name: K, fn: TappableHooks[K]) {
    if (!name || typeof fn !== 'function') return;

    if (!this.hooks[name]) this.hooks[name] = [];
    (this.hooks[name] as TappableHooks[K][]).push(fn);
  }

  async callHook<
    K extends keyof TappableHooks,
    A extends Parameters<TappableHooks[K]>
  >(name: K, ...args: A) {
    if (!this.hooks[name]) return;

    for (const hook of this.hooks[name] as TappableHooks[K][]) {
      await (hook as (...args: unknown[]) => Promise<void>)(...args);
    }
  }
}
