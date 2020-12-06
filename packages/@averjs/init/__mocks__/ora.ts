export let infoMsg = '';
export let succeedMsg = '';

class Ora {
  start() {
    return this;
  }

  info(msg: string) {
    infoMsg = msg;
  }

  succeed(msg: string) {
    succeedMsg = msg;
  }
}

export default () => new Ora();
