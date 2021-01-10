declare namespace NodeJS {
  export interface ProcessEnv {
    REDIS_PORT: string;
    REDIS_HOST: string;
    REDIS_PASSWORD: string;
  }
}
