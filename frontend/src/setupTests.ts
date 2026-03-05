import '@testing-library/jest-dom';

// API base URL for tests (baseUrl.jest.ts uses this)
process.env.VITE_API_URL = process.env.VITE_API_URL || 'http://localhost:3000';

// Polyfill for react-router and other deps in jsdom
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Request/Response/Headers for react-router (jsdom does not provide them)
if (typeof global.Request === 'undefined') {
  try {
    const { Request: R, Response: Res, Headers: H } = require('undici');
    global.Request = R;
    global.Response = Res;
    global.Headers = H;
  } catch {
    if (typeof globalThis !== 'undefined' && typeof (globalThis as { Request?: unknown }).Request !== 'undefined') {
      global.Request = (globalThis as { Request: typeof Request }).Request;
      global.Response = (globalThis as { Response: typeof Response }).Response;
      global.Headers = (globalThis as { Headers: typeof Headers }).Headers;
    } else {
      (global as unknown as { Request: unknown }).Request = class Request {};
      (global as unknown as { Response: unknown }).Response = class Response {};
      (global as unknown as { Headers: unknown }).Headers = class Headers {};
    }
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.scrollTo (jsdom not implemented)
window.scrollTo = () => {};
