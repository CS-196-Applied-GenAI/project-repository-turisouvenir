/**
 * API base URL. In tests, Jest replaces this module to avoid import.meta.
 */
export const getBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) {
    return (import.meta as { env: { VITE_API_URL: string } }).env.VITE_API_URL;
  }
  return 'http://localhost:3000';
};
