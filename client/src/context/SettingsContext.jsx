import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        heroTitle: "Timeless Essentials",
        heroSubtitle: "Curated collections featuring premium craftsmanship, minimalist aesthetics, and modern styling.",
        heroImage: "/assets/herobg.png",
        heroTag: "[ Spring / Summer 2026 ]",
        aboutTitle: "Our Design Story",
        aboutContent: "Stylora is built on the philosophy of understated luxury. We design premium essentials for the modern lifestyle, ensuring every detail serves a purpose.",
        aboutSubContent: "We work exclusively with ethical manufactures and source the highest grade sustainable fibers. Our pieces are crafted to stand the test of time.",
        aboutHeroImage: "/assets/herobg.png",
        shopHeroImage: "/assets/herobg.png",
        accessoriesHeroImage: "/assets/herobg.png",
        contactHeroImage: "/assets/herobg.png",
        contactEmail: "hello@styleora.in",
        contactPhone: "+91 98765 43210",
        contactAddress: "Stylora HQ, 5th Avenue, Bangalore, India",
        socialInstagram: "https://instagram.com/styleora",
        socialTwitter: "https://twitter.com/styleora",
        showNotAvailableBadge: false,
        categoryImages: {
            shirts: '',
            pants: '',
            outerwear: '',
            shoes: '',
            activewear: '',
            watches: ''
        },
        homeBestsellerSlots: ['', '', '', '', '']
    });
    const [loading, setLoading] = useState(true);

    const sanitizeSettings = (data) => {
        if (!data) return data;
        const sanitized = { ...data };
        const imageFields = ['heroImage', 'aboutHeroImage', 'shopHeroImage', 'accessoriesHeroImage', 'contactHeroImage'];
        const legacyNames = ['home-hero-bg.png', 'about-hero-bg.png', 'shop-hero-bg.png', 'accessories-hero-bg.png', 'contact-hero-bg.png'];
        
        imageFields.forEach(field => {
            if (!sanitized[field] || legacyNames.some(name => sanitized[field].includes(name))) {
                sanitized[field] = '/assets/herobg.png';
            }
        });
        // Normalize showNotAvailableBadge from string to boolean
        if (typeof sanitized.showNotAvailableBadge === 'string') {
            sanitized.showNotAvailableBadge = sanitized.showNotAvailableBadge === 'true';
        }
        return sanitized;
    };

    const fetchSettings = async () => {
        try {
            const localSaved = JSON.parse(localStorage.getItem('stylora_settings') || '{}');
            const res = await axios.get(`${API_URL}/settings`);
            const merged = { ...sanitizeSettings(res.data), ...localSaved };
            setSettings(merged);
        } catch (err) {
            if (err.code !== 'ERR_NETWORK' && err.message !== 'Network Error') {
                console.error("Error fetching settings", err);
            }
            const localSaved = JSON.parse(localStorage.getItem('stylora_settings') || '{}');
            if (Object.keys(localSaved).length > 0) {
                setSettings(prev => ({ ...prev, ...localSaved }));
            }
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            // Store locally first for instant resilience
            const currentLocal = JSON.parse(localStorage.getItem('stylora_settings') || '{}');
            const mergedLocal = { ...currentLocal, ...newSettings };
            localStorage.setItem('stylora_settings', JSON.stringify(mergedLocal));
            setSettings(sanitizeSettings(mergedLocal));

            const token = localStorage.getItem('token');
            if (token) {
                const res = await axios.put(`${API_URL}/settings`, newSettings, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const finalSettings = sanitizeSettings({ ...res.data, ...mergedLocal });
                setSettings(finalSettings);
                return finalSettings;
            }
            return mergedLocal;
        } catch (err) {
            console.warn("API update settings notice (saved locally):", err);
            // Even if server request fails or auth token expired, local state & storage is updated!
            setSettings(sanitizeSettings(newSettings));
            return newSettings;
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, refreshSettings: fetchSettings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
