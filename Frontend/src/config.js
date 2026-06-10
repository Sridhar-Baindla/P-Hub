const getApiUrl = () => {
  let url = '';
  
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    if (!url) {
      // Use the current origin. During development, Vite proxies /api to the backend.
      // In production, the backend is on the same origin or handled by a reverse proxy.
      url = window.location.origin;
    }
  }

  // Remove any trailing slashes
  url = url.replace(/\/+$/, '');
  
  // Append /api namespace to guarantee backend route targeting
  if (!url.endsWith('/api')) {
    url += '/api';
  }

  return url;
};

export const API_URL = getApiUrl();

export const SOCKET_URL = (() => {
  try {
    if (API_URL.startsWith('http')) {
      const url = new URL(API_URL);
      return url.origin;
    }
    return window.location.origin;
  } catch (e) {
    return window.location.origin;
  }
})();

console.log('PHUB API configured to:', API_URL);
