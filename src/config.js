const getApiUrl = () => {
  // If VITE_API_URL is explicitly set (like in production Vercel/Netlify pointing to a deployed backend), use it.
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Otherwise, ALWAYS use relative paths ('').
  // In local development, this routes requests through Vite's dev server proxy (port 5173 -> 5000).
  // In production, this assumes the backend and frontend are hosted on the same domain.
  return '';
};

export const API_URL = getApiUrl();
console.log('PHUB API configured to:', API_URL === '' ? 'Proxy/Same-Origin (Relative)' : `Absolute (${API_URL})`);
