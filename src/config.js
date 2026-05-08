const getApiUrl = () => {
  const override = typeof window !== 'undefined' && localStorage.getItem('VITE_API_URL_OVERRIDE');
  if (override) return override;

  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // With Vite Proxy configured in vite.config.js, we should use relative paths
  // This is the most robust way to handle multi-device access and deployments
  return ''; 
};

export const API_URL = getApiUrl();
console.log('PHUB API Mode: Relative (via Proxy)');
