// 导入@testing-library/jest-dom，提供额外的DOM匹配器
import '@testing-library/jest-dom';

// 模拟TextEncoder和TextDecoder
class MockTextEncoder {
  encode(input: string): Uint8Array {
    return new TextEncoder().encode(input);
  }
}

class MockTextDecoder {
  decode(input: Uint8Array): string {
    return new TextDecoder().decode(input);
  }
}

// @ts-ignore
if (typeof TextEncoder === 'undefined') {
  // @ts-ignore
  window.TextEncoder = MockTextEncoder;
}

// @ts-ignore
if (typeof TextDecoder === 'undefined') {
  // @ts-ignore
  window.TextDecoder = MockTextDecoder;
}

// 模拟localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// 模拟fetch API
const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
);

Object.defineProperty(window, 'fetch', {
  value: mockFetch
});

// 移除location模拟，使用React Testing Library的内置模拟

// 模拟window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn(() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }))
});
