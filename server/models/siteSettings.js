const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    heroTitle: { type: String, default: "Timeless Essentials" },
    heroSubtitle: { type: String, default: "Curated collections featuring premium craftsmanship, minimalist aesthetics, and modern styling." },
    heroImage: { type: String, default: "assets/herobg.png" },
    heroTag: { type: String, default: "[ Spring / Summer 2026 ]" },
    
    aboutTitle: { type: String, default: "Our Design Story" },
    aboutContent: { type: String, default: "Stylora is built on the philosophy of understated luxury. We design premium essentials for the modern lifestyle, ensuring every detail serves a purpose." },
    aboutSubContent: { type: String, default: "We work exclusively with ethical manufactures and source the highest grade sustainable fibers. Our pieces are crafted to stand the test of time." },
    aboutHeroImage: { type: String, default: "assets/herobg.png" },
    
    shopHeroImage: { type: String, default: "assets/herobg.png" },
    accessoriesHeroImage: { type: String, default: "assets/herobg.png" },
    contactHeroImage: { type: String, default: "assets/herobg.png" },

    contactEmail: { type: String, default: "hello@styleora.in" },
    contactPhone: { type: String, default: "+91 98765 43210" },
    contactAddress: { type: String, default: "Stylora HQ, 5th Avenue, Bangalore, India" },
    socialInstagram: { type: String, default: "https://instagram.com/styleora" },
    socialTwitter: { type: String, default: "https://twitter.com/styleora" },
    
    policyShipping: { 
        type: String, 
        default: "We offer free standard shipping on all orders within India. Orders are processed within 24-48 hours and typically arrive within 3-5 business days. Once your package is shipped, you will receive a tracking link via email to monitor its progress." 
    },
    policyReturns: { 
        type: String, 
        default: "We accept returns on unworn, unwashed, and undamaged items with original tags attached within 14 days of delivery. Simply go to your account, find the order under your Order History, and select Return to begin the process. Refund credits will be issued to your original payment method." 
    },
    policyPrivacy: { 
        type: String, 
        default: "Your privacy is vital to us. STYLORA collects basic information such as name, email, shipping address, and phone number to fulfill orders and improve site operations. We never sell, lease, or share your personal data with unverified third parties, and all payment details are encrypted securely." 
    },
    policyTerms: { 
        type: String, 
        default: "Welcome to STYLORA. By accessing this site, you agree to comply with our Terms of Service. All content, imagery, and product designs remain the intellectual property of STYLORA India Pvt Ltd. We reserve the right to update product stock, descriptions, and pricing without prior notice." 
    }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
