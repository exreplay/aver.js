import { aver, testFeature } from '../utils/feature';

testFeature(
  'www',
  () => {
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
