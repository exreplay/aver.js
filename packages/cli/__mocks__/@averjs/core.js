export const mockRun = jest.fn();
export const mockBuild = jest.fn();

const core = jest.fn().mockImplementation(() => {
  return {
    run: mockRun,
    build: mockBuild
  };
});

export default core;
