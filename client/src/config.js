const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    // If on Render, e.g., stylora-1.onrender.com, map to stylora.onrender.com
    if (hostname.includes('.onrender.com')) {
        const subdomain = hostname.split('.')[0];
        const baseSubdomain = subdomain.endsWith('-1') ? subdomain.slice(0, -2) : subdomain;
        return `https://${baseSubdomain}.onrender.com/api`;
    }
    return 'https://stylora.onrender.com/api';
};

export const API_URL = getApiUrl();
