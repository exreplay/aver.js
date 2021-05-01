import nodemailer from 'nodemailer';
import Email, { EmailConfig } from 'email-templates';
import path from 'path';
import merge from 'lodash/merge';
import { PluginFunction } from '@averjs/core';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export interface MailerOptions {
  emailTemplatesConfig: EmailConfig;
  nodemailerConfig: SMTPTransport.Options;
}

function establishConnection(nodemailerConfig: SMTPTransport.Options) {
  const transporter = nodemailer.createTransport(nodemailerConfig);

  transporter.verify((err) => {
    if (err) console.error(err);
    else console.log('Successfully established connection with nodemailer!');
  });

  return transporter;
}

export function mergeOptions(options?: MailerOptions) {
  const { emailTemplatesConfig = {}, nodemailerConfig = {} } = options || {};

  const defaultNodemailerConfig = {
    pool: true,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  };

  const defaultEmailTemplatesConfig = {
    views: {
      root: path.resolve(process.env.API_PATH, './mail/templates')
    },
    send: true,
    juice: true,
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: path.resolve(process.env.API_PATH, '../public/')
      }
    }
  } as EmailConfig;

  return {
    nodemailerConfig: merge({}, defaultNodemailerConfig, nodemailerConfig),
    emailTemplatesConfig: merge(
      {},
      defaultEmailTemplatesConfig,
      emailTemplatesConfig
    )
  };
}

const plugin: PluginFunction = function (options: MailerOptions) {
  if (process.argv.includes('build')) return;

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD
  ) {
    console.warn(
      'Mailer disabled. You need to provide the following env variables: SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASSWORD.'
    );
    return;
  }

  const { emailTemplatesConfig, nodemailerConfig } = mergeOptions(options);
  const transporter = establishConnection(nodemailerConfig);

  emailTemplatesConfig.transport = transporter;

  const mailer = new Email(emailTemplatesConfig);

  this.aver.tap('server:after-register-middlewares', ({ middlewares }) => {
    middlewares.push((req, res, next) => {
      req.mailer = mailer;
      next();
    });
  });
};

export default plugin;
