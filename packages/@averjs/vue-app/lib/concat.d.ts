declare module 'vue/types/vue' {
  interface Vue {
    $locale: {
      change<T>(lang: string | T): void;
      current(): string;
    };
  }
}

declare module 'vue/types/options' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ComponentOptions<V extends Vue> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    asyncData?: <T extends any>(context: AsyncDataContext<T>) => Promise<void>;
  }
}
