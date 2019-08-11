export const mockRun = jest.fn();

const core = jest.fn().mockImplementation(() => {
  return {
    run: mockRun
  };
});

export default core;
