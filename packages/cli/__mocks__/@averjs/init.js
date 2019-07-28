export const mockRun = jest.fn();

const init = jest.fn().mockImplementation(() => {
  return {
    run: mockRun
  };
});

export default init;
