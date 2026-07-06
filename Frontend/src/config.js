const getApiUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL;
    url = url.replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    return url;
  }
  
  // Default to relative path. This routes all API calls through the current origin.
  // In development, Vite's proxy intercepts /api and forwards to http://127.0.0.1:5000
  // This bypasses firewall issues since all traffic goes through the Vite dev server port.
  return '/api';
};

export const API_URL = getApiUrl();

export const SOCKET_URL = (() => {
  try {
    if (API_URL.startsWith('http')) {
      const url = new URL(API_URL);
      return url.origin;
    }
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  } catch (e) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
})();

console.log('PHUB API configured to:', API_URL);
