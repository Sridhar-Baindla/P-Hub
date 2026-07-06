const getApiUrl = () => {
  let url = '';
  
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  }
  
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // If no URL is set, or if it points to localhost/127.0.0.1/0.0.0.0 while we are on a network IP
    if (!url || ((url.includes('localhost') || url.includes('127.0.0.1') || url.includes('0.0.0.0')) && !isLocalhost)) {
      url = window.location.origin;
      
      // If we are accessing via a dev server port (e.g. 5173) from an external IP,
      // bypass the proxy and hit the backend directly on port 5000 to prevent proxy drop/CORS issues.
      if (!isLocalhost && window.location.port && window.location.port !== '5000') {
        url = `${window.location.protocol}//${window.location.hostname}:5000`;
      }
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
