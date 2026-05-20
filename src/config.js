const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('VITE_API_URL_OVERRIDE');
    
    // In local development (localhost, .local, or a local IP), we must use relative paths ('')
    // to route all API calls through the Vite dev server proxy (port 5173).
    // This is highly secure and robust: it bypasses host firewall restrictions on port 5000,
    // avoids port conflicts with other Windows services, and enables seamless multi-device login.
    const hostname = window.location.hostname;
    const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
    const isLocal = hostname === 'localhost' || hostname.endsWith('.local') || isIp;
    
    if (isLocal) {
      return '';
    }
  }

  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return '';
};

export const API_URL = getApiUrl();
console.log('PHUB Connectivity Protocol: ' + (API_URL ? 'Absolute (' + API_URL + ')' : 'Proxy (Relative)'));
