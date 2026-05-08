const getApiUrl = () => {
  const override = typeof window !== 'undefined' && localStorage.getItem('VITE_API_URL_OVERRIDE');
  if (override) return override;

  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  const hostname = window.location.hostname;
  
  // If we are on localhost, use the relative path (Vite Proxy handles it)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return ''; 
  }

  // Fail-safe: For mobile devices accessing via IP (e.g. 192.168.x.x),
  // we try to reach the backend on the same host but port 5000.
  // This is a backup if the relative proxy fails for some reason.
  return `http://${hostname}:5000`;
};

export const API_URL = getApiUrl();
console.log('PHUB Connectivity Protocol:', API_URL === '' ? 'Proxy (Relative)' : `Direct (${API_URL})`);
