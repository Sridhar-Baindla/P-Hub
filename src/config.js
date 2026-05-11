const getApiUrl = () => {
  const override = typeof window !== 'undefined' && localStorage.getItem('VITE_API_URL_OVERRIDE');
  if (override) return override;

  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // Use relative path for all environments by default, letting Vite's proxy handle it.
  // This completely eliminates CORS issues and "Failed to fetch" on mobile devices
  // because the browser will send the request to the same origin (e.g., the local IP),
  // and Vite will proxy it to the backend.
  return '';
};

export const API_URL = getApiUrl();
console.log('PHUB Connectivity Protocol: Proxy (Relative)');
