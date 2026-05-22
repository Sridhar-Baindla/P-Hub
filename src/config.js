const getApiUrl = () => {
  let url = '';
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  } else if (typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location;
    // For local dev, Vite proxy (5173) handles requests, but direct access to Express (5000) 
    // is sometimes more reliable across LAN if proxy is misconfigured.
    if (port === '5173' || port === '5174') {
      url = `${protocol}//${hostname}:5000`;
    }
  }

  // Prevent 301 redirects dropping POST bodies: upgrade to https if the page is loaded over https
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
    url = url.replace('http://', 'https://');
  }

  // Remove trailing slashes to prevent double-slash in fetch calls
  return url.replace(/\/+$/, '');
};

export const API_URL = getApiUrl();
console.log('PHUB API configured to:', API_URL === '' ? 'Same-Origin (Relative)' : `Absolute (${API_URL})`);
