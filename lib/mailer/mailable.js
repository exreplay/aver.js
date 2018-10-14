import Mailer from './index';

export default class Mailable {
    async send() {
        try {
            await Mailer.send(this.data);
        } catch(err) {
            throw err;
        }
    }
}
