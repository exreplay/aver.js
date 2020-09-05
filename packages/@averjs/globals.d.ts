declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development' | 'test';
    API_PATH: string;
    PROJECT_PATH: string;
  }
}
