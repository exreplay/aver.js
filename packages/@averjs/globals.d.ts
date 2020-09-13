declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'production' | 'development' | 'test';
  }
}

declare namespace Express {
  export interface Request {
     id?: string;
     error?: string;
  }
}