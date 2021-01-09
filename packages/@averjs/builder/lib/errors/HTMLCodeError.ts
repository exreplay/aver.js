export default class HTMLCodeError extends Error {
  code: number;
  date: Date;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(code: number, ...params: any[]) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HTMLCodeError);
    }

    this.code = code;
    this.date = new Date();
  }
}
