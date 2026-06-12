const getApiUrl = () => {
  let url = '';
  
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // If no URL is set, OR if the URL is hardcoded to localhost but we are accessing from an external IP (e.g. mobile device)
    if (!url || (url.includes('localhost') && !isLocalhost) || (url.includes('127.0.0.1') && !isLocalhost)) {
      // Use the current origin. During development, Vite proxies /api to the backend.
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
