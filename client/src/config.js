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

const MOCK_IMAGE_MAP = {
    'assets/find-section-img-1.png': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&q=80',
    'assets/find-section-img-2.png': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80',
    'assets/find-section-img-3.png': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
    'assets/find-section-img-4.png': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80',
    'assets/find-section-img-5.png': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80',
    'assets/find-section-img-6.png': 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&q=80'
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80';

export const resolveImageUrl = (img) => {
    if (!img) return DEFAULT_FALLBACK;
    if (typeof img !== 'string') return DEFAULT_FALLBACK;
    const trimmed = img.trim();
    if (!trimmed) return DEFAULT_FALLBACK;

    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    if (MOCK_IMAGE_MAP[trimmed]) return MOCK_IMAGE_MAP[trimmed];
    if (MOCK_IMAGE_MAP[cleanPath]) return MOCK_IMAGE_MAP[cleanPath];

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
        return trimmed;
    }
    if (cleanPath.startsWith('uploads/')) {
        return SERVER_URL ? `${SERVER_URL}/${cleanPath}` : `/${cleanPath}`;
    }
    if (cleanPath.startsWith('assets/')) {
        return `/${cleanPath}`;
    }
    return `/assets/${cleanPath}`;
};

