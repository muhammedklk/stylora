import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const PolicyPage = () => {
    const { policyType } = useParams();
    const { settings, loading } = useSettings();

    // Scroll to top on page mount or route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [policyType]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'var(--font-primary)' }}>
                <span>Loading Policy Details...</span>
            </div>
        );
    }

    // Map policy type URL slugs to settings fields and titles
    const policyMap = {
        shipping: {
            title: "Shipping & Delivery Policy",
            tag: "[ Shipping ]",
            content: settings.policyShipping || "We offer free standard shipping on all orders within India. Orders are processed within 24-48 hours and typically arrive within 3-5 business days. Once your package is shipped, you will receive a tracking link via email to monitor its progress.",
        },
        returns: {
            title: "Return & Exchange Policy",
            tag: "[ Returns ]",
            content: settings.policyReturns || "We accept returns on unworn, unwashed, and undamaged items with original tags attached within 14 days of delivery. Simply go to your account, find the order under your Order History, and select Return to begin the process. Refund credits will be issued to your original payment method.",
        },
        privacy: {
            title: "Privacy Statement",
            tag: "[ Privacy ]",
            content: settings.policyPrivacy || "Your privacy is vital to us. STYLORA collects basic information such as name, email, shipping address, and phone number to fulfill orders and improve site operations. We never sell, lease, or share your personal data with unverified third parties, and all payment details are encrypted securely.",
        },
        terms: {
            title: "Terms & Conditions of Service",
            tag: "[ Terms ]",
            content: settings.policyTerms || "Welcome to STYLORA. By accessing this site, you agree to comply with our Terms of Service. All content, imagery, and product designs remain the intellectual property of STYLORA India Pvt Ltd. We reserve the right to update product stock, descriptions, and pricing without prior notice.",
        }
    };

    const policy = policyMap[policyType] || {
        title: "Store Policy",
        tag: "[ Policy ]",
        content: "The requested policy details could not be found."
    };

    return (
        <main className="policy-main">
            {/* Centered Luxury Page Header */}
            <section className="shop-hero" style={{ height: '35vh' }}>
                <div className="shop-hero-overlay"></div>
                <div className="shop-hero-content">
                    <span className="shop-hero-tag">{policy.tag}</span>
                    <h1 className="shop-hero-title" style={{ fontSize: '32px' }}>{policy.title}</h1>
                    <p className="shop-hero-subtitle" style={{ fontSize: '13px' }}>STYLORA Store Operations Guidelines</p>
                </div>
            </section>

            {/* Document Content */}
            <div className="container" style={{ maxWidth: '800px', padding: '60px 20px 100px 20px' }}>
                <div 
                    style={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #eaeaea', 
                        padding: '40px 48px', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
                        lineHeight: '1.8',
                        fontFamily: 'var(--font-secondary)',
                        fontSize: '15px',
                        color: '#333333',
                        whiteSpace: 'pre-line' // respects new lines entered in textareas!
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                        <span style={{ height: '1px', flex: 1, backgroundColor: '#000' }}></span>
                        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#000', fontFamily: 'var(--font-primary)' }}>
                            Official Document
                        </span>
                        <span style={{ height: '1px', flex: 1, backgroundColor: '#000' }}></span>
                    </div>

                    {policy.content}

                    <div style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '30px', textAlign: 'center' }}>
                        <Link 
                            to="/shop" 
                            className="cart-secondary-btn d-inline-flex" 
                            style={{ width: 'auto', padding: '0 32px', height: '44px', fontSize: '11px' }}
                        >
                            Back to Collection
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PolicyPage;
