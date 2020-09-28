import { ComponentOptions } from 'vue';
import VueI18n, { I18nOptions } from 'vue-i18n';
import VueRouter, { RouterOptions, Route } from 'vue-router';
import { Store, StoreOptions } from 'vuex';
import { BuilderContext } from '@averjs/builder/dist/builders/base';

export type UserReturns = Record<string, unknown>;

export interface SSRContext extends BuilderContext {
  isServer: boolean;
}

export interface AppEntryContext<T extends any> extends SSRContext {
  test: string;
  appOptions: {
    i18n: VueI18n;
    router: VueRouter;
    store: Store<T>;
    ssrContext: SSRContext,
    context: Record<string, unknown>;
    render: ComponentOptions<any, any, any, any>['render']
  }
}

export interface ServerEntryContext extends SSRContext {
  userReturns: UserReturns;
  contextRendered: (fn: (context: SSRContext) => void) => void;
}

export interface ClientEntryContext {
  userReturns: UserReturns;
}

export interface RouterEntryContext<T extends any> {
  i18n: VueI18n;
  store: Store<T>;
  ssrContext: SSRContext;
  config: RouterOptions
}

export interface AsyncDataContext<T extends any> {
  store: Store<T>;
  route: {
    to: Route;
    from?: Route;
  };
  isServer: boolean;
}

export type AppEntry<T = any> = (context: AppEntryContext<T>) => UserReturns | void | Promise<void> | Promise<UserReturns>;
export type ServerEntry = (context: ServerEntryContext) => void | Promise<void>;
export type ClientEntry = (context: ClientEntryContext) => void | Promise<void>;
export type I18nEntry = (options: I18nOptions) => I18nOptions;
export type RouterEntry<T extends any> = (context: RouterEntryContext<T>) => RouterOptions;
export type StoreEntry<T extends any> = (options: StoreOptions<T>) => StoreOptions<T>;

declare module 'vue/types/vue' {
  interface Vue {
    $locale: {
      change<T>(lang: string | T): void;
      current(): string;
    };
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    asyncData?: <T extends any>(context: AsyncDataContext<T>) => Promise<void>;
  }
}