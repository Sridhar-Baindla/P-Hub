const getApiUrl = () => {
  // If VITE_API_URL is explicitly set (like in production Vercel/Netlify pointing to a deployed backend), use it.
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fix for "Server Error (404)" on other devices:
  // When running Vite dev server (port 5173) and accessing from a mobile device (e.g. 192.168.x.x),
  // the Vite proxy sometimes fails to forward POST requests correctly, returning a 404 HTML page.
  // We can bypass the proxy by pointing directly to the Express server on port 5000.
  if (typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location;
    if (port === '5173' || port === '5174') {
      return `${protocol}//${hostname}:5000`;
    }
  }

  // Otherwise, use relative paths ('').
  // This works perfectly in production where Node.js serves the frontend on the same port.
  return '';
};

export const API_URL = getApiUrl();
console.log('PHUB API configured to:', API_URL === '' ? 'Same-Origin (Relative)' : `Absolute (${API_URL})`);
