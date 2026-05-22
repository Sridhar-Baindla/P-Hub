const getApiUrl = () => {
  let url = '';
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  }
  
  // Remove any trailing slashes
  url = url.replace(/\/+$/, '');
  
  // Append /api namespace to guarantee backend route targeting and prevent collisions
  if (!url.endsWith('/api')) {
    url += '/api';
  }

  return url;
};

export const API_URL = getApiUrl();
console.log('PHUB API configured to:', API_URL);
