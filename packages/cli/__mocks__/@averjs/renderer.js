export const mockCompile = jest.fn();
const renderer = jest.fn().mockImplementation(() => {
  return { compile: mockCompile };
});

export default renderer;
