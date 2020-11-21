import nodemailer from 'nodemailer';
import Email, { EmailConfig } from 'email-templates';
import path from 'path';
import merge from 'lodash/merge';
import { PluginFunction } from '@averjs/core/lib/plugins';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import './global';

export interface MailerOptions {
  emailTemplatesConfig: EmailConfig;
  nodemailerConfig: SMTPTransport.Options;
}

function establishConnection(nodemailerConfig: SMTPTransport.Options) {
  const defaultConfig = {
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

  const transporter = nodemailer.createTransport(
    merge({}, defaultConfig, nodemailerConfig)
  );

  transporter.verify(err => {
    if (err) console.log(err);
    else console.log('Successfully established connection with nodemailer!');
  });

  return transporter;
}

const plugin: PluginFunction = function(options: MailerOptions) {
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

  const { emailTemplatesConfig = {}, nodemailerConfig = {} } = options;
  const transporter = establishConnection(nodemailerConfig);

  const defaultEmailTemplatesConfig = {
    views: {
      root: path.resolve(process.env.API_PATH, './mail/templates')
    },
    send: true,
    transport: transporter,
    juice: true,
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: path.resolve(process.env.API_PATH, '../public/')
      }
    }
  } as EmailConfig;

  const mailer = new Email(
    merge({}, defaultEmailTemplatesConfig, emailTemplatesConfig)
  );

  this.aver.tap('server:after-register-middlewares', ({ middlewares }) => {
    middlewares.push((req, res, next) => {
      req.mailer = mailer;
      next();
    });
  });
};

export default plugin;
