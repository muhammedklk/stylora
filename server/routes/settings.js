const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/siteSettings');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

const upload = require('../middlewares/uploadMiddleware');

// Get settings (public)
router.get('/', async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = await SiteSettings.create({});
        }

        // Auto-correct stale legacy default paths to valid asset paths
        let changed = false;
        if (!settings.heroImage || settings.heroImage.includes('home-hero-bg.png')) {
            settings.heroImage = 'assets/herobg.png';
            changed = true;
        }
        if (!settings.aboutHeroImage || settings.aboutHeroImage.includes('about-hero-bg.png')) {
            settings.aboutHeroImage = 'assets/herobg.png';
            changed = true;
        }
        if (!settings.shopHeroImage || settings.shopHeroImage.includes('shop-hero-bg.png')) {
            settings.shopHeroImage = 'assets/herobg.png';
            changed = true;
        }
        if (!settings.accessoriesHeroImage || settings.accessoriesHeroImage.includes('accessories-hero-bg.png')) {
            settings.accessoriesHeroImage = 'assets/herobg.png';
            changed = true;
        }
        if (!settings.contactHeroImage || settings.contactHeroImage.includes('contact-hero-bg.png')) {
            settings.contactHeroImage = 'assets/herobg.png';
            changed = true;
        }

        if (changed) {
            await settings.save();
        }

        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: 'Server error retrieving settings' });
    }
});

// Update settings (admin only)
router.put('/', authMiddleware, adminMiddleware, upload.fields([
    { name: 'heroImage', maxCount: 1 },
    { name: 'aboutHeroImage', maxCount: 1 },
    { name: 'shopHeroImage', maxCount: 1 },
    { name: 'accessoriesHeroImage', maxCount: 1 },
    { name: 'contactHeroImage', maxCount: 1 }
]), async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) {
            settings = new SiteSettings();
        }

        const fields = [
            'heroTitle', 'heroSubtitle', 'heroTag',
            'aboutTitle', 'aboutContent', 'aboutSubContent',
            'contactEmail', 'contactPhone', 'contactAddress',
            'socialInstagram', 'socialTwitter',
            'policyShipping', 'policyReturns', 'policyPrivacy', 'policyTerms'
        ];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        const imageFields = [
            'heroImage', 'aboutHeroImage', 'shopHeroImage', 
            'accessoriesHeroImage', 'contactHeroImage'
        ];

        imageFields.forEach(field => {
            if (req.files && req.files[field] && req.files[field][0]) {
                settings[field] = req.files[field][0].path.replace(/\\/g, '/');
            } else if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        // Auto-correct stale legacy default paths or empty values
        if (!settings.heroImage || settings.heroImage.includes('home-hero-bg.png')) settings.heroImage = 'assets/herobg.png';
        if (!settings.aboutHeroImage || settings.aboutHeroImage.includes('about-hero-bg.png')) settings.aboutHeroImage = 'assets/herobg.png';
        if (!settings.shopHeroImage || settings.shopHeroImage.includes('shop-hero-bg.png')) settings.shopHeroImage = 'assets/herobg.png';
        if (!settings.accessoriesHeroImage || settings.accessoriesHeroImage.includes('accessories-hero-bg.png')) settings.accessoriesHeroImage = 'assets/herobg.png';
        if (!settings.contactHeroImage || settings.contactHeroImage.includes('contact-hero-bg.png')) settings.contactHeroImage = 'assets/herobg.png';

        await settings.save();
        res.json(settings);
    } catch (err) {
        console.error("Error saving settings:", err);
        res.status(500).json({ message: 'Server error updating settings' });
    }
});

module.exports = router;
