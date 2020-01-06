import path from 'path';
import nodemailer from 'nodemailer';
import Email from 'email-templates';

class Mailer {
  constructor() {
    if (!process.env.SMTP_HOST) return;

    const transporter = this.establishConnection();

    this.email = new Email({
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
    });
  }

  establishConnection() {
    const transporter = nodemailer.createTransport({
      pool: true,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    transporter.verify(err => {
      if (err) console.log(err);
      else console.log('Successfully connected to SMTP!');
    });

    return transporter;
  }
}

const mailer = new Mailer();
export default mailer.email;
