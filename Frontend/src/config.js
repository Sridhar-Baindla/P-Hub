const getApiUrl = () => {
  let url = '';
  
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  }
  
  // Intelligent resolution for cross-device authentication
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (url && (url.includes('localhost') || url.includes('127.0.0.1')) && !isLocalhost) {
      // If environment URL is localhost but we are on a remote device (e.g. mobile phone),
      // we must use the actual IP address to connect to the backend.
      url = `http://${window.location.hostname}:5000`;
    } else if (!url) {
      // If no environment URL is set:
      if (window.location.port === '5173' || window.location.port === '5174') {
        // We are using Vite dev server. Point directly to the Node backend on port 5000.
        url = `http://${window.location.hostname}:5000`;
      } else {
        // Production: Use the current origin
        url = window.location.origin;
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
