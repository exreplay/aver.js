import { Compilation, Compiler } from 'webpack';

export const isJS = (file: string) => /\.js(\?[^.]+)?$/.test(file);
export const isCSS = (file: string) => /\.css(\?[^.]+)?$/.test(file);

export const onEmit = (
  compiler: Compiler,
  name: string,
  stageName: string,
  hook: (
    compilation: Compilation,
    cb: (error?: Error | null | false, result?: void) => void
  ) => void
) => {
  compiler.hooks.compilation.tap(name, (compilation) => {
    if (compilation.compiler !== compiler) return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const stage = Compilation[stageName];
    compilation.hooks.processAssets.tapAsync({ name, stage }, (assets, cb) => {
      hook(compilation, cb);
    });
  });
};
