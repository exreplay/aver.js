declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development' | 'test';
    API_PATH: string;
    PROJECT_PATH: string;
  }
}

declare namespace Express {
  export interface Request {
     id?: string;
     error?: string;
  }
}