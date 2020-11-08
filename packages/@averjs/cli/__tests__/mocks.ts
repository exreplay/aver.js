const mockeCoreRun = jest.fn();
const mockInitRun = jest.fn();
const mockeCoreBuild = jest.fn();
const mockCompile = jest.fn();

jest.mock('@averjs/init', () => {
  return jest.fn().mockImplementation(() => {
    return {
      run: mockInitRun
    };
  });
});

jest.mock('@averjs/renderer', () => {
  return jest.fn().mockImplementation(() => {
    return {
      compile: mockCompile
    };
  });
});

jest.mock('@averjs/core', () => {
  return jest.fn().mockImplementation(() => {
    return {
      config: {},
      run: mockeCoreRun,
      build: mockeCoreBuild
    };
  });
});

export {
  mockeCoreRun,
  mockInitRun,
  mockeCoreBuild,
  mockCompile
};
