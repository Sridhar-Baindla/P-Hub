const getApiUrl = () => {
  const override = typeof window !== 'undefined' && localStorage.getItem('VITE_API_URL_OVERRIDE');
  if (override) return override;

  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // Use current hostname and protocol
  const hostname = window.location.hostname || 'localhost';
  const protocol = window.location.protocol;
  
  // Default development behavior
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // For small screens / mobile devices accessing via local IP
  return `${protocol}//${hostname}:5000`;
};

export const API_URL = getApiUrl();
console.log('PHUB API Connection:', API_URL);
