import { AverConfig } from '@averjs/config';

const client = jest.fn();
const server = jest.fn();
const base = jest.fn();

const config: AverConfig = {
  plugins: [
    function () {
      this.aver.tap('after-close', () => {
        expect(client.mock.calls.length).toBe(1);
        expect(server.mock.calls.length).toBe(1);
        expect(base.mock.calls.length).toBe(2);
      });
    }
  ],
  webpack: {
    client,
    server,
    base
  }
};

export default config;
