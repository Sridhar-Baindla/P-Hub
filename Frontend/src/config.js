const getApiUrl = () => {
  let url = '';
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  }
  
  // Fix for "Failed to fetch" on other devices (mobile testing)
  // If the API URL contains localhost or 127.0.0.1, it means we are in local development.
  // Instead of hardcoding the IP and port (which might be blocked by Windows Firewall),
  // we reset the URL to a relative path ('') so that the fetch goes through the current origin.
  // This allows the Vite proxy (port 5173) or the production Node server (port 5000) to handle it natively.
  if (typeof window !== 'undefined' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    url = '';
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
