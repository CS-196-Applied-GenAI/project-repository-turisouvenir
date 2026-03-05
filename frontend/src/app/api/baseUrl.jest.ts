/** Used by Jest so we don’t rely on import.meta in Node. */
export const getBaseUrl = (): string =>
  (typeof process !== 'undefined' && process.env?.VITE_API_URL) || 'http://localhost:3000';
