import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

const Contact = () => {
    const { settings } = useSettings();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const getHeroBg = (img) => {
        if (!img) return undefined;
        const resolved = img.startsWith('http') 
            ? img 
            : (img.startsWith('uploads/') ? `http://localhost:5000/${img}` : (img.startsWith('/') ? img : `/${img}`));
        return `url("${resolved}")`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Thank you for contacting us! Our team will get back to you shortly.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
    };

    return (
        <div>
            {/* Contact Hero Section */}
            <section className="contact-hero" style={{ backgroundImage: getHeroBg(settings?.contactHeroImage) }}>
                <div className="contact-hero-overlay"></div>
                <div className="contact-hero-content">
                    <span className="contact-hero-tag">[ Contact Us ]</span>
                    <h1 className="contact-hero-title">We'd love to hear from you.</h1>
                    <p className="contact-hero-subtitle">Get in touch with our team for support, styling queries, or general feedback.</p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="contact-section">
                <div className="container">
                    <div className="row contact-grid">
                        {/* Left: Contact Info */}
                        <div className="col-md-6 contact-info-col">
                            <span className="section-tag">[ Get in Touch ]</span>
                            <h2 className="contact-section-title">Visit our spaces or drop a message.</h2>
                            <p className="contact-section-desc">Have a question about our collections, sizing, or store locations? Reach out to us through any of the channels below.</p>

                            <div className="contact-info-list">
                                {/* Info Item 1 */}
                                <div className="contact-info-item">
                                    <div className="info-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                    </div>
                                    <div className="info-text">
                                        <h3>Headquarters</h3>
                                        <p>{settings.contactAddress || 'Styleora India Pvt Ltd., 4th Floor, Retail Hub, MG Road, Bangalore, Karnataka - 560001'}</p>
                                    </div>
                                </div>
                                {/* Info Item 2 */}
                                <div className="contact-info-item">
                                    <div className="info-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                    </div>
                                    <div className="info-text">
                                        <h3>Support Email</h3>
                                        <p><a href={`mailto:${settings.contactEmail || 'support@styleora.in'}`}>{settings.contactEmail || 'support@styleora.in'}</a></p>
                                    </div>
                                </div>
                                {/* Info Item 3 */}
                                <div className="contact-info-item">
                                    <div className="info-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                    </div>
                                    <div className="info-text">
                                        <h3>Customer Helpline</h3>
                                        <p><a href={`tel:${settings.contactPhone || '+918040004000'}`}>{settings.contactPhone || '+91 80 4000 4000'}</a></p>
                                    </div>
                                </div>
                                {/* Info Item 4 */}
                                <div className="contact-info-item">
                                    <div className="info-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                    </div>
                                    <div className="info-text">
                                        <h3>Support Hours</h3>
                                        <p>Monday - Saturday: 09:00 AM - 06:00 PM IST</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Contact Form */}
                        <div className="col-md-6 contact-form-col">
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="contact-name">Full Name</label>
                                    <input 
                                        type="text" 
                                        id="contact-name" 
                                        className="contact-input"
                                        placeholder="e.g. Rahul Menon" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-email">E-mail Address</label>
                                    <input 
                                        type="email" 
                                        id="contact-email" 
                                        className="contact-input"
                                        placeholder="e.g. rahul@example.com" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-subject">Subject</label>
                                    <input 
                                        type="text" 
                                        id="contact-subject" 
                                        className="contact-input"
                                        placeholder="e.g. Sizing query, Order support" 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="contact-message">Your Message</label>
                                    <textarea 
                                        id="contact-message" 
                                        className="contact-input contact-textarea"
                                        placeholder="Write your message here..." 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="contact-submit-btn">Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
