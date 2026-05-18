const getApiUrl = () => {
  // Clear any old/faulty overrides to prevent 404 errors on mobile when network changes
  if (typeof window !== 'undefined') {
    localStorage.removeItem('VITE_API_URL_OVERRIDE');
  }

  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // Enforce relative path proxying via Vite
  return '';
};

export const API_URL = getApiUrl();
console.log('PHUB Connectivity Protocol: ' + (API_URL ? 'Absolute' : 'Proxy (Relative)'));
