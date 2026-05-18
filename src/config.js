const getApiUrl = () => {
  const override = typeof window !== 'undefined' && localStorage.getItem('VITE_API_URL_OVERRIDE');
  if (override) return override;

  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  return '';
};

export const API_URL = getApiUrl();
console.log('PHUB Connectivity Protocol: ' + (API_URL ? 'Absolute' : 'Proxy (Relative)'));
