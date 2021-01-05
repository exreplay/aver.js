export function setProcessArgs(...args: string[]) {
  process.argv = [process.argv[0], 'aver', ...args];
}
