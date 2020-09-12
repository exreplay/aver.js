import Config from 'webpack-chain';
import { Express } from 'express';
import { ExpressMiddlewares } from './server';
import { Server } from 'http';
import { BuilderContext } from '@averjs/builder/dist/builders/base';

interface RegisterMiddlewaresContext {
  app: Express;
  middlewares: ExpressMiddlewares;
  server: Server;
}
type RegisterRoutesContext = RegisterMiddlewaresContext;

interface BeforeCompileSsrContext {
  context: BuilderContext;
  HTML_ATTR?: string,
  HEAD_ATTRS?: string,
  HEAD: (string | undefined)[],
  BODY_ATTRS?: string,
  BODY: (string | undefined)[];
}
type BeforeCompileStaticContext = BeforeCompileSsrContext;

interface TappableHooks {
  'server:before-register-middlewares': (context: RegisterMiddlewaresContext) => void;
  'server:after-register-middlewares': (context: RegisterMiddlewaresContext) => void;
  'server:before-register-routes': (context: RegisterRoutesContext) => void;
  'server:after-register-routes': (context: RegisterRoutesContext) => void;
  'builder:before-compile-static': (context: BeforeCompileStaticContext) => void;
  'builder:before-compile-ssr': (context: BeforeCompileSsrContext) => void;
  'renderer:base-config': (chain: Config) => void;
  'renderer:client-config': (chain: Config) => void;
  'renderer:server-config': (chain: Config) => void;
}

type Hooks = { [K in keyof TappableHooks] : TappableHooks[K][]; };

export default class Hookable {
  hooks: Hooks = {} as never;

  constructor() {
    this.tap = this.tap.bind(this);
    this.callHook = this.callHook.bind(this);
  }

  tap<K extends keyof TappableHooks>(name: K, fn: TappableHooks[K]) {
    if (!name || typeof fn !== 'function') return;

    if (!this.hooks[name]) this.hooks[name] = [];
    this.hooks[name].push(fn as never);
  }

  async callHook<K extends keyof TappableHooks, A extends Parameters<TappableHooks[K]>>(name: K, ...args: A) {
    if (!this.hooks[name]) return;
    
    for (const hook of this.hooks[name]) {
      await (hook as (...args: unknown[]) => void)(...args);
    }
  }
}