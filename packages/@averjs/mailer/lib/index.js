import nodemailer from 'nodemailer';
import Email from 'email-templates';
import path from 'path';
import merge from 'lodash/merge';

function establishConnection(nodemailerConfig) {
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

  const transporter = nodemailer.createTransport(merge({}, defaultConfig, nodemailerConfig));

  transporter.verify(err => {
    if (err) console.log(err);
    else console.log('Successfully established connection with nodemailer!');
  });

  return transporter;
}

export default function(options) {
  const {
    emailTemplatesConfig = {},
    nodemailerConfig = {}
  } = options;

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('Mailer disabled. You need to provide the following env variables: SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASSWORD.');
    return;
  }

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
  };

  const mailer = new Email(merge({}, defaultEmailTemplatesConfig, emailTemplatesConfig));

  this.aver.tap('server:after-register-middlewares', ({ app, middlewares }) => {
    middlewares.push((req, res, next) => {
      req.mailer = mailer;
      next();
    });
  });
};
