// Jest type definitions for backend tests
// These declarations allow TypeScript to recognize Jest globals

declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(value: any): R;
      toEqual(value: any): R;
      toHaveProperty(prop: string, value?: any): R;
      toBeDefined(): R;
      toBeNull(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toContain(item: any): R;
      toHaveLength(length: number): R;
      toThrow(error?: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(times: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
    }

    interface Expect {
      (value: any): Matchers<any>;
      stringContaining(str: string): any;
      objectContaining(obj: any): any;
      any(constructor: any): any;
    }

    interface Describe {
      (name: string, fn: () => void): void;
    }

    interface It {
      (name: string, fn: () => void | Promise<void>): void;
    }

    interface Lifecycle {
      (fn: () => void | Promise<void>): void;
    }
  }

  var describe: jest.Describe;
  var test: jest.It;
  var it: jest.It;
  var expect: jest.Expect;
  var beforeEach: jest.Lifecycle;
  var afterEach: jest.Lifecycle;
  var beforeAll: jest.Lifecycle;
  var afterAll: jest.Lifecycle;
  var jest: {
    fn: () => any;
    clearAllMocks: () => void;
    mock: (module: string) => void;
    Mock: any;
  };
}

export {};
