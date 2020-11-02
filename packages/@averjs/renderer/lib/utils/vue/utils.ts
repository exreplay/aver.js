export const isJS = (file: string) => /\.js(\?[^.]+)?$/.test(file);
export const isCSS = (file: string) => /\.css(\?[^.]+)?$/.test(file);