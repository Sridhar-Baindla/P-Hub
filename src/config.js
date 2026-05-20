const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('VITE_API_URL_OVERRIDE');
    
    // Dynamically detect local network IP (e.g. 192.168.X.X) and point directly to backend port 5000
    // This bypasses any Vite proxy issues and allows all local devices to connect reliably.
    const hostname = window.location.hostname;
    const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
    const isLocal = hostname === 'localhost' || hostname.endsWith('.local') || isIp;
    
    if (isLocal) {
      return `${window.location.protocol}//${hostname}:5000`;
    }
  }

  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  return '';
};

export const API_URL = getApiUrl();
console.log('PHUB Connectivity Protocol: ' + (API_URL ? 'Absolute (' + API_URL + ')' : 'Proxy (Relative)'));
