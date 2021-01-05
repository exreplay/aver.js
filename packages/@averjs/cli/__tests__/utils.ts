export function setProcessArgs(...args: string[]) {
  process.argv = process.argv.reduce((prev, next) => {
    return [...prev, next, ...(next.includes('jest') && args)].filter(_ => _);
  }, [] as string[]);
}
