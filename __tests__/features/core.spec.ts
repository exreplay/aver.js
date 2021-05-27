import { aver, rebuild, testFeature } from '../utils/feature';
import fs from 'fs';
import path from 'path';

testFeature(
  'core',
  (currentDir) => {
    const robotsPath = path.resolve(currentDir, './robots.txt');

    afterAll(() => {
      fs.unlinkSync(robotsPath);
    });

    test('favicon should always respond with a 204', async () => {
      await page.goto('http://localhost:3000');
      const watchDog = page.waitForFunction('window.appStatus === "ready"');
      await watchDog;
      expect(await page.content()).toContain('<div id="app">204</div>');
    });

    test('should respond to robots.txt with the file content', async () => {
      let response = await page.goto('http://localhost:3000/robots.txt');
      expect(response?.status()).toBe(500);

      fs.writeFileSync(robotsPath, 'hello robots', 'utf-8');

      response = await page.goto('http://localhost:3000/robots.txt');
      expect(await response?.text()).toBe('hello robots');
    });

    test('should throw correct error messages', () => {
      try {
        aver.server?.onError({
          syscall: '',
          name: 'test',
          message: 'test',
          code: ''
        });
      } catch (error) {
        expect(error).toEqual({
          syscall: '',
          name: 'test',
          message: 'test',
          code: ''
        });
      }

      try {
        aver.server?.onError({
          syscall: 'listen',
          name: 'test',
          message: 'test',
          code: 'EACCES'
        });
      } catch (error) {
        expect(error).toBe('Pipe 3000 requires elevated privileges');
      }

      try {
        aver.server?.onError({
          syscall: 'listen',
          name: 'test',
          message: 'test',
          code: 'EADDRINUSE'
        });
      } catch (error) {
        expect(error).toBe('Pipe 3000 is already in use');
      }

      try {
        aver.server?.onError({
          syscall: 'listen',
          name: 'test',
          message: 'test',
          code: ''
        });
      } catch (error) {
        expect(error).toEqual({
          syscall: 'listen',
          name: 'test',
          message: 'test',
          code: ''
        });
      }

      expect((process.exit as jest.Mock<never, never>).mock.calls.length).toBe(
        2
      );
    });

    test('port should be normalized correctly', () => {
      expect(aver.server?.normalizePort('1234')).toBe('1234');
      expect(aver.server?.normalizePort('abcd')).toBe('abcd');
    });

    test('should require middlewares index.js file', async () => {
      const response = await page.goto('http://localhost:3000/middlewares');
      expect(response?.status()).toBe(200);
      expect(await response?.text()).toBe('test');
    });

    test('should use error middleware and print json with details', async () => {
      let response = await page.goto('http://localhost:3000/error');
      let content = await page.content();
      expect(response?.status()).toBe(500);
      expect(content).toContain('"success":false');
      expect(content).toContain('"errorId":"');
      expect(content).toContain('"msg":"something went wrong"');

      response = await page.goto('http://localhost:3000/individual-error');
      content = await page.content();
      expect(response?.status()).toBe(500);
      expect(content).toContain('"success":false');
      expect(content).toContain('"errorId":"');
      expect(content).toContain('"msg":"something went wrong"');
      expect(content).toContain('"data":{"test":"some data"}');
    });

    test('should throw with build errors', async () => {
      const appPath = path.resolve(currentDir, './src/App.vue');
      const app = fs.readFileSync(appPath, 'utf-8');

      fs.writeFileSync(appPath, '<template>', 'utf-8');

      try {
        await rebuild();
      } catch (error) {
        expect(error.message).toBe('Build error');
        expect(error.stack).toContain(
          'Newline required at end of file but not found'
        );
      } finally {
        fs.writeFileSync(appPath, app, 'utf-8');
      }
    });
  },
  {},
  () => {
    let exit: NodeJS.Process['exit'];

    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      exit = process.exit;
      process.exit = jest.fn<never, never>();
    });

    afterAll(() => {
      process.exit = exit;
    });
  }
);
