declare module '@babel/helper-compilation-targets' {
  import {
    TargetsOptions,
    Options as BabelPresetOptions
  } from '@babel/preset-env';

  const getTarget: (
    inputTargets?: TargetsOptions,
    options?: BabelPresetOptions
  ) => TargetsOptions;
  const isRequired: (
    name: string,
    targets: TargetsOptions,
    options?: Pick<BabelPresetOptions, 'include' | 'exclude'> & {
      compatData?: Record<string, Record<string, unknown>>;
    }
  ) => void;

  export { isRequired };
  export default getTarget;
}
