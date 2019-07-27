export const mockRun = jest.fn();
export const mockInit = jest.fn();

const core = jest.fn().mockImplementation(() => {
  return {
    run: mockRun,
    init: mockInit
  };
});

export default core;
