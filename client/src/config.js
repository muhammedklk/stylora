const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    const hostname = window.location.hostname;
    const protocol = window.location.protocol || 'http:';
    
    if (hostname.includes('vercel.app')) {
        return '/api';
    }
    if (hostname.includes('.onrender.com')) {
        return 'https://stylora-xzws.onrender.com/api';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    // Dynamic IP resolution for mobile devices on local network (e.g. 192.168.x.x, 10.x.x.x)
    return `${protocol}//${hostname}:5000/api`;
};

export const API_URL = getApiUrl();
export const SERVER_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

// High Resolution Ultra-HD Luxury Photography Map
const MOCK_IMAGE_MAP = {
    'assets/find-section-img-1.png': 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=1800&q=95&auto=format&fit=crop',
    'assets/find-section-img-2.png': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1800&q=95&auto=format&fit=crop',
    'assets/find-section-img-3.png': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1800&q=95&auto=format&fit=crop',
    'assets/find-section-img-4.png': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1800&q=95&auto=format&fit=crop',
    'assets/find-section-img-5.png': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1800&q=95&auto=format&fit=crop',
    'assets/find-section-img-6.png': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1800&q=95&auto=format&fit=crop',
    'assets/find-section-img-7.png': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1800&q=95&auto=format&fit=crop',
    'assets/find-section-img-8.png': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=1800&q=95&auto=format&fit=crop',
    'assets/longines-moonpnase(pr-1).png': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1800&q=95&auto=format&fit=crop',
    'assets/essential-Hoodie-(pr-1).png': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1800&q=95&auto=format&fit=crop',
    'assets/sand-over(pr-1).png': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1800&q=95&auto=format&fit=crop',
    'assets/occian-h00die(pr-1).png': 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=1800&q=95&auto=format&fit=crop',
    'assets/core-utlity-pants(pr-1).png': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1800&q=95&auto=format&fit=crop',
    'assets/acc-briefcase.png': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1800&q=95&auto=format&fit=crop',
    'assets/acc-sunglasses.png': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1800&q=95&auto=format&fit=crop',
    'assets/acc-wallet.png': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=1800&q=95&auto=format&fit=crop',
    'assets/acc-cap.png': 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=1800&q=95&auto=format&fit=crop',
    'assets/acc-bracelet.png': 'https://images.unsplash.com/photo-1611591475777-233ca539e231?w=1800&q=95&auto=format&fit=crop',
    'assets/acc-socks.png': 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=1800&q=95&auto=format&fit=crop'
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1800&q=95&auto=format&fit=crop';

export const resolveImageUrl = (img) => {
    if (!img) return DEFAULT_FALLBACK;
    if (typeof img !== 'string') return DEFAULT_FALLBACK;
    let trimmed = img.trim();
    if (!trimmed) return DEFAULT_FALLBACK;

    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;

    // Map local assets to high-res Unsplash links
    if (MOCK_IMAGE_MAP[trimmed]) trimmed = MOCK_IMAGE_MAP[trimmed];
    else if (MOCK_IMAGE_MAP[cleanPath]) trimmed = MOCK_IMAGE_MAP[cleanPath];

    // Automatically upscale any Unsplash image URL to Ultra-HD 1800px & 95% quality!
    if (trimmed.includes('images.unsplash.com')) {
        trimmed = trimmed
            .replace(/w=\d+/g, 'w=1800')
            .replace(/q=\d+/g, 'q=95');
        if (!trimmed.includes('w=')) trimmed += '&w=1800';
        if (!trimmed.includes('q=')) trimmed += '&q=95';
        if (!trimmed.includes('auto=format')) trimmed += '&auto=format';
        if (!trimmed.includes('fit=crop')) trimmed += '&fit=crop';
    }

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
