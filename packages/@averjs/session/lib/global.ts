/* eslint-disable @typescript-eslint/no-namespace */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace NodeJS {
  export interface ProcessEnv {
    REDIS_PORT: string;
    REDIS_HOST: string;
    REDIS_PASSWORD: string;
  }
}
