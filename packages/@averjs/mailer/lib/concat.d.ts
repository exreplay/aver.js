import Email from 'email-templates';

/* concat start */
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
/* concat end */
