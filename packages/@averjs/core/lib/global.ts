/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace Express {
  export interface Request {
    id?: string;
    error?: string;
  }
}
