import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        heroTitle: "Timeless Essentials",
        heroSubtitle: "Curated collections featuring premium craftsmanship, minimalist aesthetics, and modern styling.",
        heroImage: "assets/herobg.png",
        heroTag: "[ Spring / Summer 2026 ]",
        aboutTitle: "Our Design Story",
        aboutContent: "Stylora is built on the philosophy of understated luxury. We design premium essentials for the modern lifestyle, ensuring every detail serves a purpose.",
        aboutSubContent: "We work exclusively with ethical manufactures and source the highest grade sustainable fibers. Our pieces are crafted to stand the test of time.",
        aboutHeroImage: "assets/herobg.png",
        shopHeroImage: "assets/herobg.png",
        accessoriesHeroImage: "assets/herobg.png",
        contactHeroImage: "assets/herobg.png",
        contactEmail: "hello@styleora.in",
        contactPhone: "+91 98765 43210",
        contactAddress: "Stylora HQ, 5th Avenue, Bangalore, India",
        socialInstagram: "https://instagram.com/styleora",
        socialTwitter: "https://twitter.com/styleora"
    });
    const [loading, setLoading] = useState(true);

    const sanitizeSettings = (data) => {
        if (!data) return data;
        const sanitized = { ...data };
        const imageFields = ['heroImage', 'aboutHeroImage', 'shopHeroImage', 'accessoriesHeroImage', 'contactHeroImage'];
        const legacyNames = ['home-hero-bg.png', 'about-hero-bg.png', 'shop-hero-bg.png', 'accessories-hero-bg.png', 'contact-hero-bg.png'];
        
        imageFields.forEach(field => {
            if (!sanitized[field] || legacyNames.some(name => sanitized[field].includes(name))) {
                sanitized[field] = 'assets/herobg.png';
            }
        });
        return sanitized;
    };

    const fetchSettings = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/settings');
            setSettings(sanitizeSettings(res.data));
        } catch (err) {
            console.error("Error fetching settings", err);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/settings', newSettings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(sanitizeSettings(res.data));
            return res.data;
        } catch (err) {
            console.error("Error updating settings", err);
            throw err;
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
