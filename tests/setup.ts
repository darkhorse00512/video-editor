import "@testing-library/jest-dom";

// Setup custom jest matchers
expect.extend({
  toHaveBeenCalledOnceWith(received: jest.Mock, ...args: any[]) {
    const pass =
      received.mock.calls.length === 1 &&
      JSON.stringify(received.mock.calls[0]) === JSON.stringify(args);

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received.getMockName()} not to have been called once with ${args}`
          : `expected ${received.getMockName()} to have been called once with ${args}`,
    };
  },
});
