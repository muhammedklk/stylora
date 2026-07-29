import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { resolveImageUrl } from '../config';

const Contact = () => {
    const { settings } = useSettings();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const getHeroBg = (img) => {
        if (!img) return undefined;
        return `url("${resolveImageUrl(img)}")`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSending(true);
        setTimeout(() => {
            setSending(false);
            setSent(true);
            setName('');
            setEmail('');
            setSubject('');
            setMessage('');
            setTimeout(() => setSent(false), 5000);
        }, 1000);
    };

    const heroBgStyle = settings?.contactHeroImage
        ? { backgroundImage: getHeroBg(settings.contactHeroImage) }
        : {};

    return (
        <div className="cpage-root">

            {/* ── Hero Banner ─────────────────────────────── */}
            <section className="cpage-hero" style={heroBgStyle}>
                <div className="cpage-hero-overlay" />
                <div className="cpage-hero-inner">
                    <span className="cpage-hero-eyebrow">Contact Us</span>
                    <h1 className="cpage-hero-title">
                        {settings?.contactTitle || "We'd love to hear from you."}
                    </h1>
                    <p className="cpage-hero-sub">
                        {settings?.contactSubtitle ||
                            'Reach out to our team for support, styling queries, or general feedback.'}
                    </p>
                </div>
            </section>

            {/* ── Main Content ─────────────────────────────── */}
            <div className="cpage-body">

                {/* ── Top Strip ── */}
                <div className="cpage-strip">
                    <span className="cpage-strip-label">GET IN TOUCH</span>
                    <div className="cpage-strip-line" />
                </div>

                {/* ── Two Column Grid ── */}
                <div className="cpage-grid">

                    {/* LEFT — Info */}
                    <div className="cpage-left">
                        <p className="cpage-left-intro">
                            Have a question about our collections, sizing, or store locations?
                            Reach out through any of the channels below.
                        </p>

                        <div className="cpage-info-list">

                            <div className="cpage-info-item">
                                <div className="cpage-info-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="1.8"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <div className="cpage-info-text">
                                    <span className="cpage-info-label">Headquarters</span>
                                    <span className="cpage-info-val">
                                        {settings?.contactAddress ||
                                            'Styleora India Pvt Ltd., 4th Floor, Retail Hub, MG Road, Bangalore — 560001'}
                                    </span>
                                </div>
                            </div>

                            <div className="cpage-info-item">
                                <div className="cpage-info-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="1.8"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div className="cpage-info-text">
                                    <span className="cpage-info-label">Support Email</span>
                                    <a className="cpage-info-link"
                                        href={`mailto:${settings?.contactEmail || 'support@styleora.in'}`}>
                                        {settings?.contactEmail || 'support@styleora.in'}
                                    </a>
                                </div>
                            </div>

                            <div className="cpage-info-item">
                                <div className="cpage-info-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="1.8"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <div className="cpage-info-text">
                                    <span className="cpage-info-label">Customer Helpline</span>
                                    <a className="cpage-info-link"
                                        href={`tel:${settings?.contactPhone || '+918040004000'}`}>
                                        {settings?.contactPhone || '+91 80 4000 4000'}
                                    </a>
                                </div>
                            </div>

                            <div className="cpage-info-item">
                                <div className="cpage-info-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="1.8"
                                        strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <div className="cpage-info-text">
                                    <span className="cpage-info-label">Support Hours</span>
                                    <span className="cpage-info-val">
                                        Mon – Sat &nbsp;·&nbsp; 09:00 AM – 06:00 PM IST
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Response badge */}
                        <div className="cpage-badge">
                            <span className="cpage-badge-dot" />
                            Average response time: under 2 hours
                        </div>
                    </div>

                    {/* RIGHT — Form */}
                    <div className="cpage-right">
                        <div className="cpage-form-header">
                            <h2 className="cpage-form-title">Send a Message</h2>
                            <p className="cpage-form-sub">Fill in the form and we'll get back to you shortly.</p>
                        </div>

                        {sent && (
                            <div className="cpage-success">
                                ✓ &nbsp; Message sent! We'll respond within 2 hours.
                            </div>
                        )}

                        <form className="cpage-form" onSubmit={handleSubmit}>
                            <div className="cpage-form-row">
                                <div className="cpage-field">
                                    <label className="cpage-label" htmlFor="cn-name">Full Name</label>
                                    <input
                                        id="cn-name"
                                        className="cpage-input"
                                        type="text"
                                        placeholder="e.g. Rahul Menon"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="cpage-field">
                                    <label className="cpage-label" htmlFor="cn-email">Email Address</label>
                                    <input
                                        id="cn-email"
                                        className="cpage-input"
                                        type="email"
                                        placeholder="e.g. rahul@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="cpage-field">
                                <label className="cpage-label" htmlFor="cn-subject">Subject</label>
                                <input
                                    id="cn-subject"
                                    className="cpage-input"
                                    type="text"
                                    placeholder="e.g. Sizing query, Order support"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="cpage-field">
                                <label className="cpage-label" htmlFor="cn-message">Your Message</label>
                                <textarea
                                    id="cn-message"
                                    className="cpage-input cpage-textarea"
                                    placeholder="Write your message here..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="cpage-submit"
                                disabled={sending}
                            >
                                {sending ? (
                                    <>Sending &nbsp;<span className="cpage-spinner" /></>
                                ) : (
                                    <>
                                        Send Message
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
