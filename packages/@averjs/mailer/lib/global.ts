/* eslint-disable @typescript-eslint/no-namespace */
import Email from 'email-templates';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare global {
  namespace Express {
    export interface Request {
      mailer: Email;
    }
  }

  namespace NodeJS {
    export interface ProcessEnv {
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASSWORD: string;
    }
  }
}
