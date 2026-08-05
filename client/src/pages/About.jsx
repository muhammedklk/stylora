import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { resolveImageUrl } from '../config';

const About = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [activePillar, setActivePillar] = useState(null);

    const getHeroBg = (img) => {
        if (!img) return undefined;
        return `url("${resolveImageUrl(img)}")`;
    };

    const pillars = [
        {
            num: '01',
            title: 'Minimalist Aesthetics',
            subtitle: 'Purity of Form',
            desc: 'Clean silhouettes, neutral earth tones, and uncompromised structural cuts that transcend seasonal trends.',
            stat: '100% Timeless',
        },
        {
            num: '02',
            title: 'Master Craftsmanship',
            subtitle: 'Precision Engineering',
            desc: 'Every stitch and pocket placement undergoes multi-phase quality audits by certified artisan workshops.',
            stat: '40+ Workshops',
        },
        {
            num: '03',
            title: 'Architectural Utility',
            subtitle: 'Apparel in Motion',
            desc: 'Tailored trousers and hoodies featuring hidden storage systems and four-way stretch weaves.',
            stat: '360° Comfort',
        },
        {
            num: '04',
            title: 'Ethical Transparency',
            subtitle: 'Sustainable Future',
            desc: 'Organic cotton and zero-plastic packaging with radical supply chain transparency for conscious consumers.',
            stat: 'Zero Waste',
        },
    ];

    const materials = [
        {
            name: 'Heavyweight Organic Cotton',
            detail: '380 GSM combed cotton spun for structural drape and pill-free durability that improves with each wash.',
            tag: 'SUSTAINABLE FABRIC',
            img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
        },
        {
            name: 'Spun Breathable Linen',
            detail: 'Premium long-staple flax woven for lightweight airflow during warm summer days — naturally wrinkle-resistant.',
            tag: 'NATURAL WEAVE',
            img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
        },
        {
            name: 'Tailored Wool Blend',
            detail: 'Insulated wool composite offering refined outerwear warmth with cinematic drape and structured shoulders.',
            tag: 'LUXURY TEXTILE',
            img: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
        },
    ];

    const milestones = [
        {
            year: '2024',
            title: 'Conception & Spark',
            desc: 'STYLORA was founded to eliminate luxury markups while preserving absolute architectural purity in every garment.',
        },
        {
            year: '2025',
            title: 'Sustainable Pipeline',
            desc: 'Transitioned entire production to certified organic cotton and zero-plastic packaging across all product lines.',
        },
        {
            year: '2026',
            title: 'Global Flagships',
            desc: 'Expanded into digital storefronts and physical showrooms serving customers across 40+ countries worldwide.',
        },
    ];

    return (
        <div className="apage-root">

            {/* ── Hero Banner ─────────────────────────────── */}
            <section
                className="cpage-hero"
                style={settings?.aboutHeroImage ? { backgroundImage: getHeroBg(settings.aboutHeroImage) } : {}}
            >
                <div className="cpage-hero-overlay" />
                <div className="cpage-hero-inner">
                    <span className="cpage-hero-eyebrow">The Stylora Narrative</span>
                    <h1 className="cpage-hero-title">
                        {settings?.aboutHeading || 'Crafted for Motion.\nBorn to Endure.'}
                    </h1>
                    <p className="cpage-hero-sub">
                        {settings?.aboutSubtitle ||
                            'Redefining modern menswear through understated luxury, ethical craftsmanship, and relentless attention to architectural detail.'}
                    </p>
                </div>
            </section>

            {/* ── Main Body ──────────────────────────────── */}
            <div className="cpage-body">

                {/* ── Stats Row ─────────────────────────── */}
                <div className="apage-stats-row">
                    {[
                        { num: '100%', label: 'Organic & Recycled' },
                        { num: '40+',  label: 'Artisan Workshops' },
                        { num: '15K+', label: 'Global Customers' },
                        { num: '0%',   label: 'Quality Compromise' },
                    ].map((s) => (
                        <div key={s.label} className="apage-stat-card">
                            <span className="apage-stat-num">{s.num}</span>
                            <span className="apage-stat-label">{s.label}</span>
                        </div>
                    ))}
                </div>

                {/* ── The Vision ────────────────────────── */}
                <section className="apage-section">
                    <div className="cpage-strip">
                        <span className="cpage-strip-label">The Vision</span>
                        <div className="cpage-strip-line" />
                    </div>

                    <div className="apage-vision-grid">
                        <div className="apage-vision-text">
                            <h2 className="apage-vision-heading">
                                {settings?.aboutTitle || 'Free-spirited fashion for the modern individual.'}
                            </h2>
                            <p className="apage-vision-body">
                                {settings?.aboutContent ||
                                    'STYLORA was born from a desire to eliminate the traditional markups of luxury fashion while maintaining absolute architectural purity in every garment. We believe premium clothing should feel empowering, not exclusive.'}
                            </p>
                            <blockquote className="apage-blockquote">
                                "High fashion shouldn't feel cold or exclusive. It should feel empowering, relatable, and built for real life."
                            </blockquote>
                        </div>

                        <div className="apage-vision-image">
                            <img
                                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
                                alt="Stylora Editorial Vision"
                            />
                            <div className="apage-vision-badge">AW 2026 EDITION</div>
                        </div>
                    </div>
                </section>

                {/* ── Brand Philosophy Pillars ───────────── */}
                <section className="apage-section">
                    <div className="cpage-strip">
                        <span className="cpage-strip-label">Brand Philosophy</span>
                        <div className="cpage-strip-line" />
                    </div>

                    <div className="apage-pillars-grid">
                        {pillars.map((pillar, idx) => (
                            <div
                                key={pillar.num}
                                className={`apage-pillar-card ${activePillar === idx ? 'active' : ''}`}
                                onMouseEnter={() => setActivePillar(idx)}
                                onMouseLeave={() => setActivePillar(null)}
                            >
                                <div className="apage-pillar-eyebrow">
                                    {pillar.num} &nbsp;/&nbsp; {pillar.subtitle.toUpperCase()}
                                </div>
                                <h3 className="apage-pillar-title">{pillar.title}</h3>
                                <p className="apage-pillar-desc">{pillar.desc}</p>
                                <span className="apage-pillar-stat">{pillar.stat}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Textile Excellence ─────────────────── */}
                <section className="apage-section">
                    <div className="cpage-strip">
                        <span className="cpage-strip-label">Textile Excellence</span>
                        <div className="cpage-strip-line" />
                    </div>

                    <div className="apage-materials-grid">
                        {materials.map((item) => (
                            <div key={item.name} className="apage-material-card">
                                <div className="apage-material-img-wrap">
                                    <img src={item.img} alt={item.name} />
                                    <span className="apage-material-tag">{item.tag}</span>
                                </div>
                                <div className="apage-material-body">
                                    <h3 className="apage-material-name">{item.name}</h3>
                                    <p className="apage-material-detail">{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Evolution / Timeline ───────────────── */}
                <section className="apage-section">
                    <div className="cpage-strip">
                        <span className="cpage-strip-label">Evolution</span>
                        <div className="cpage-strip-line" />
                    </div>

                    <div className="apage-milestones-grid">
                        {milestones.map((ms, idx) => (
                            <div key={idx} className="apage-milestone-card">
                                <div className="apage-milestone-year">{ms.year}</div>
                                <h4 className="apage-milestone-title">{ms.title}</h4>
                                <p className="apage-milestone-desc">{ms.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA Dark Banner ────────────────────── */}
                <section className="apage-cta-banner">
                    <div className="apage-cta-left">
                        <span className="apage-cta-eyebrow">ARCHITECTURAL UTILITY</span>
                        <h2 className="apage-cta-heading">Crafted for life in motion.</h2>
                        <p className="apage-cta-sub">
                            From essential heavyweight hoodies to structured smart trousers, every piece undergoes
                            multi-phase stress testing for fit, comfort, and longevity.
                        </p>
                    </div>
                    <div className="apage-cta-right">
                        <button className="apage-cta-btn" onClick={() => navigate('/shop')}>
                            EXPLORE COLLECTION →
                        </button>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default About;
