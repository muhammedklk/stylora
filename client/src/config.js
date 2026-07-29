const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    if (hostname.includes('vercel.app')) {
        return '/api';
    }
    if (hostname.includes('.onrender.com')) {
        return 'https://stylora-xzws.onrender.com/api';
    }
    return '/api';
};

export const API_URL = getApiUrl();
export const SERVER_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

export const resolveImageUrl = (img) => {
    if (!img) return '/assets/find-section-img-1.png';
    if (typeof img !== 'string') return '/assets/find-section-img-1.png';
    const trimmed = img.trim();
    if (!trimmed) return '/assets/find-section-img-1.png';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
        return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    if (cleanPath.startsWith('uploads/')) {
        return SERVER_URL ? `${SERVER_URL}/${cleanPath}` : `/${cleanPath}`;
    }
    if (cleanPath.startsWith('assets/')) {
        return `/${cleanPath}`;
    }
    return `/assets/${cleanPath}`;
};

