declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development' | 'test' | undefined;
    API_PATH: string;
    PROJECT_PATH: string;

    REDIS_PORT: string;
    REDIS_HOST: string;
    REDIS_PASSWORD: string;
  }
}
