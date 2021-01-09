import { ComponentOptions } from 'vue';
import { I18nOptions } from 'vue-i18n';
import { RouterOptions, RouteLocationNormalized } from 'vue-router';
import { Store, StoreOptions } from 'vuex';
import { BuilderContext } from '@averjs/builder';

export type UserReturns = Record<string, unknown>;

export interface SSRContext {
  isServer: boolean;
  context: BuilderContext;
}

export interface AppEntryContext<T extends any> extends SSRContext {
  test: string;
  appOptions: {
    [index: string]: any;
    i18n: I18nOptions;
    router: RouterOptions;
    store: Store<T>;
    ssrContext: SSRContext;
    context: Record<string, unknown>;
    render: ComponentOptions<any, any, any, any>['render'];
  };
}

export interface ServerEntryContext extends BuilderContext {
  userReturns: UserReturns;
  contextRendered: (fn: (context: BuilderContext) => void) => void;
}

export interface ClientEntryContext {
  userReturns: UserReturns;
}

export interface RouterEntryContext<T extends any> {
  i18n: I18nOptions;
  store: Store<T>;
  ssrContext: SSRContext;
  config: RouterOptions;
}

export interface AsyncDataContext<T extends any> {
  store: Store<T>;
  route: {
    to: RouteLocationNormalized;
    from?: RouteLocationNormalized;
  };
  isServer: boolean;
}

export type AppEntry<T = any> = (
  context: AppEntryContext<T>
) => UserReturns | void | Promise<void> | Promise<UserReturns>;
export type ServerEntry = (context: ServerEntryContext) => void | Promise<void>;
export type ClientEntry = (context: ClientEntryContext) => void | Promise<void>;
export type I18nEntry = (options: I18nOptions) => I18nOptions;
export type RouterEntry<T extends any> = (
  context: RouterEntryContext<T>
) => RouterOptions;
export type StoreEntry<T extends any> = (
  options: StoreOptions<T>
) => StoreOptions<T>;

// declare module 'vue/types/vue' {
//   interface Vue {
//     $locale: {
//       change<T>(lang: string | T): void;
//       current(): string;
//     };
//   }
// }

// declare module 'vue/types/options' {
//   interface ComponentOptions<V extends Vue> {
//     asyncData?: <T extends any>(context: AsyncDataContext<T>) => Promise<void>;
//   }
// }
