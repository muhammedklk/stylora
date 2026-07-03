const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    // If on Render, point to the correct backend service URL
    if (hostname.includes('.onrender.com')) {
        return 'https://stylora-xzws.onrender.com/api';
    }
    return 'https://stylora-xzws.onrender.com/api';
};

export const API_URL = getApiUrl();
