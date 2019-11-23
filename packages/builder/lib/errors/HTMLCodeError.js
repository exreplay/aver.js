export default class HTMLCodeError extends Error {
  constructor(code, ...params) {
    super(...params);
  
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HTMLCodeError);
    }

    this.code = code;
    this.date = new Date();
  }
}
