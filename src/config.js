const getApiUrl = () => {
  const override = typeof window !== 'undefined' && localStorage.getItem('VITE_API_URL_OVERRIDE');
  if (override) return override;

  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  const hostname = window.location.hostname;
  
  // If we are on Netlify, we can't use the netlify hostname for the backend port 5000.
  // Default to localhost or provide a way for the user to see what's happening.
  if (hostname.includes('netlify.app')) {
    console.warn('Running on Netlify. If your backend is local, access the site via your local IP instead.');
    // You can set localStorage.setItem("VITE_API_URL_OVERRIDE", "http://YOUR_IP:5000") in the console
    return 'http://localhost:5000'; 
  }

  return `http://${hostname}:5000`;
};

export const API_URL = getApiUrl();
