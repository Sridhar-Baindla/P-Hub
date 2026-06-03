const getApiUrl = () => {
  let url = '';
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  }
  
  // Fix for "Failed to fetch" on other devices (mobile testing)
  // If the API URL contains localhost or 127.0.0.1, but we are accessing the app from a network IP (e.g., 192.168.x.x),
  // replace localhost with the actual network IP so the phone knows where to reach the backend.
  if (typeof window !== 'undefined' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    const currentHost = window.location.hostname;
    url = url.replace(/localhost|127\.0\.0\.1/, currentHost);
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
