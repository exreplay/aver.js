/* eslint-disable @typescript-eslint/no-namespace */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace NodeJS {
  export interface ProcessEnv {
    MONGODB_HOST: string;
    MONGODB_USERNAME: string;
    MONGODB_PASSWORT: string;
    MONGODB_DATENBANK: string;
    MONGODB_OPTIONS: string;
  }
}