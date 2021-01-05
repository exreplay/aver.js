import { Request, Response, NextFunction } from 'express';
import mailer, { mergeOptions } from '../lib';
import Email from 'email-templates';

jest.mock('nodemailer');

type PartialRequest = Partial<Request & { mailer: typeof Email }>;
type Handler = (
  req: PartialRequest,
  res: Partial<Response>,
  next: NextFunction
) => void;

interface HookPayload {
  middlewares: Handler[];
}

const hooks: ((payload: HookPayload) => void)[] = [];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const averThis: any = {
  aver: {
    tap: (hook: string, fn: (payload: HookPayload) => void) => {
      hooks.push(fn);
    }
  }
};

describe('mailer plugin', () => {
  let warnOutputData = '';
  let errorOutputData = '';
  let outputData = '';

  beforeEach(() => {
    process.env.API_PATH = __dirname;
    outputData = '';
    console.warn = jest.fn(inputs => (warnOutputData = inputs));
    console.error = jest.fn(inputs => (errorOutputData = inputs));
    console.log = jest.fn(inputs => (outputData = inputs));
  });

  afterEach(() => {
    process.env.API_PATH = '';
    process.env.SMTP_HOST = '';
    process.env.SMTP_PORT = '';
    process.env.SMTP_USER = '';
    process.env.SMTP_PASSWORD = '';

    jest.clearAllMocks();
  });

  it('should not run when build process arg is set', () => {
    process.argv.push('build');
    const result = mailer.call(averThis);
    expect(result).toBeUndefined();
    process.argv = process.argv.filter(a => a !== 'build');
  });

  it('should log warning when env variables are not defined', () => {
    mailer.call(averThis);
    expect(warnOutputData).toBe(
      'Mailer disabled. You need to provide the following env variables: SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASSWORD.'
    );
  });

  it('should merge options correctly', () => {
    let { emailTemplatesConfig, nodemailerConfig } = mergeOptions();

    expect(emailTemplatesConfig.send).toBeTruthy();
    expect(nodemailerConfig.pool).toBeTruthy();

    ({ emailTemplatesConfig, nodemailerConfig } = mergeOptions({
      emailTemplatesConfig: {
        message: {
          text: 'test'
        }
      },
      nodemailerConfig: {
        html: 'test'
      }
    }));

    expect(emailTemplatesConfig.message.text).toBe('test');
    expect(nodemailerConfig.html).toBe('test');
  });

  it('should add middleware and pass the mailer to the request object', () => {
    process.env.SMTP_HOST = 'test';
    process.env.SMTP_PORT = 'test';
    process.env.SMTP_USER = 'test';
    process.env.SMTP_PASSWORD = 'test';

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');
    const verify = jest.fn();
    nodemailer.createTransport.mockReturnValue({
      verify
    });

    mailer.call(averThis);
    expect(hooks.length).toBe(1);

    const middlewares: Handler[] = [];
    hooks[0]({ middlewares });
    expect(middlewares.length).toBe(1);

    const req: PartialRequest = {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    middlewares[0](req, {}, () => {});
    expect(req.mailer).toBeInstanceOf(Email);
  });

  it('should log correctly on verify', () => {
    process.env.SMTP_HOST = 'test';
    process.env.SMTP_PORT = 'test';
    process.env.SMTP_USER = 'test';
    process.env.SMTP_PASSWORD = 'test';

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodemailer = require('nodemailer');
    let verify = jest.fn((fn: (err?: Error) => void) => {
      fn();
    });
    nodemailer.createTransport.mockReturnValue({
      verify
    });

    mailer.call(averThis);

    expect(outputData).toBe(
      'Successfully established connection with nodemailer!'
    );

    jest.clearAllMocks();

    const testError = new Error('test');
    verify = jest.fn((fn: (err?: Error) => void) => {
      fn(testError);
    });
    nodemailer.createTransport.mockReturnValue({
      verify
    });

    mailer.call(averThis);

    expect(errorOutputData).toBe(testError);
  });
});
