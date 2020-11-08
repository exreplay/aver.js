export function setProcessArgs(...args) {
  process.argv = process.argv.reduce((prev, next) => {
    return [
      ...prev,
      next,
      ...(next.includes('jest') && args)
    ].filter(_ => _);
  }, []);
}
