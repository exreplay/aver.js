export let infoMsg = '';
export let succeedMsg = '';

class Ora {
  start() { return this; }
  info(msg) { infoMsg = msg; }
  succeed(msg) { succeedMsg = msg; }
}

export default () => new Ora();
