import Mailer from './mailer';

export default class Mailable {
  async render(templatePart) {
    try {
      const dataClone = JSON.parse(JSON.stringify(this.data));
      delete dataClone.template;
      return await Mailer.render(`${this.data.template}/${templatePart}`, dataClone.locals);
    } catch (err) {
      throw err;
    }
  }

  async send() {
    try {
      return await Mailer.send(this.data);
    } catch (err) {
      throw err;
    }
  }
}
