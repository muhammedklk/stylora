import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { resolveImageUrl } from '../config';

const About = () => {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [activePillar, setActivePillar] = useState(0);

    const getHeroBg = (img) => {
        if (!img) return undefined;
        return `url("${resolveImageUrl(img)}")`;
    };

    const pillars = [
        {
            num: "01",
            title: "Minimalist Aesthetics",
            subtitle: "Purity of form",
            desc: "Clean silhouettes, neutral earth tones, and uncompromised structural cuts.",
            stat: "100% Timeless"
        },
        {
            num: "02",
            title: "Master Craftsmanship",
            subtitle: "Precision engineering",
            desc: "Every stitch and pocket placement undergoes multi-phase quality audits.",
            stat: "40+ Workshops"
        },
        {
            num: "03",
            title: "Architectural Utility",
            subtitle: "Apparel in motion",
            desc: "Tailored trousers & hoodies featuring hidden storage and stretch weaves.",
            stat: "360° Comfort"
        },
        {
            num: "04",
            title: "Ethical Transparency",
            subtitle: "Sustainable future",
            desc: "Organic cotton & zero-plastic packaging with radical supply chain transparency.",
            stat: "Zero Waste"
        }
    ];

    const materials = [
        {
            name: "Heavyweight Organic Cotton",
            detail: "380 GSM combed cotton spun for structural drape and pill-free durability.",
            tag: "SUSTAINABLE FABRIC",
            img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80"
        },
        {
            name: "Spun Breathable Linen",
            detail: "Premium long-staple flax woven for lightweight airflow during warm summer days.",
            tag: "NATURAL WEAVE",
            img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80"
        },
        {
            name: "Tailored Wool Blend",
            detail: "Insulated wool composite offering refined outerwear warmth with cinematic drape.",
            tag: "LUXURY TEXTILE",
            img: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80"
        }
    ];

    const milestones = [
        {
            year: "2024",
            title: "Conception & Spark",
            desc: "STYLORA was founded to eliminate luxury markups while preserving architectural purity."
        },
        {
            year: "2025",
            title: "Sustainable Pipeline",
            desc: "Transitioned entire production line to certified organic cotton and zero-plastic packaging."
        },
        {
            year: "2026",
            title: "Global Flagships",
            desc: "Expanded into digital storefronts and physical showrooms serving customers in 40+ countries."
        }
    ];

    return (
        <div className="about-page-wrapper light-theme" style={{ backgroundColor: '#faf9f6', color: '#111' }}>
            {/* 1. HERO BANNER - Matched to Contact Page Height & Dark Style */}
            <section className="cpage-hero" style={{ backgroundImage: getHeroBg(settings?.aboutHeroImage) }}>
                <div className="cpage-hero-overlay"></div>
                <div className="cpage-hero-inner">
                    <span className="cpage-hero-eyebrow">THE STYLORA NARRATIVE</span>
                    <h1 className="cpage-hero-title">Crafted for Motion.<br />Born to Endure.</h1>
                    <p className="cpage-hero-sub">
                        Redefining modern menswear through understated luxury, ethical craftsmanship, and relentless attention to architectural detail.
                    </p>
                </div>
            </section>

            {/* 2. COMPACT STATS STRIP */}
            <section style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '30px 0' }}>
                <div className="container">
                    <div className="stats-grid" style={{ gap: '20px' }}>
                        <div className="stat-card" style={{ padding: '20px 15px' }}>
                            <span className="stat-number" style={{ fontSize: '36px', marginBottom: '4px' }}>100%</span>
                            <span className="stat-label" style={{ fontSize: '11px' }}>Organic & Recycled</span>
                        </div>
                        <div className="stat-card" style={{ padding: '20px 15px' }}>
                            <span className="stat-number" style={{ fontSize: '36px', marginBottom: '4px' }}>40+</span>
                            <span className="stat-label" style={{ fontSize: '11px' }}>Artisan Workshops</span>
                        </div>
                        <div className="stat-card" style={{ padding: '20px 15px' }}>
                            <span className="stat-number" style={{ fontSize: '36px', marginBottom: '4px' }}>15K+</span>
                            <span className="stat-label" style={{ fontSize: '11px' }}>Global Customers</span>
                        </div>
                        <div className="stat-card" style={{ padding: '20px 15px' }}>
                            <span className="stat-number" style={{ fontSize: '36px', marginBottom: '4px' }}>0%</span>
                            <span className="stat-label" style={{ fontSize: '11px' }}>Quality Compromise</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. REDESIGNED [ THE VISION ] - Compact Side-by-Side Card Layout */}
            <section style={{ padding: '50px 0', background: '#faf9f6' }}>
                <div className="container">
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #eaeaea',
                        borderRadius: '0',
                        padding: '40px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '35px',
                        alignItems: 'center',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.02)'
                    }}>
                        <div>
                            <span className="section-tag" style={{ marginBottom: '12px' }}>[ THE VISION ]</span>
                            <h2 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '16px', color: '#111' }}>
                                {settings?.aboutTitle || 'Free-spirited fashion for the modern individual.'}
                            </h2>
                            <p style={{ fontSize: '14px', lineHeight: '1.65', color: '#555', marginBottom: '16px' }}>
                                {settings?.aboutContent || 'STYLORA was born from a desire to eliminate the traditional markups of luxury fashion while maintaining absolute architectural purity in every garment.'}
                            </p>
                            <div style={{
                                paddingLeft: '16px',
                                borderLeft: '3px solid #c59b27',
                                fontStyle: 'italic',
                                fontSize: '14px',
                                color: '#333',
                                lineHeight: '1.5'
                            }}>
                                "High fashion shouldn't feel cold or exclusive. It should feel empowering, relatable, and built for real life."
                            </div>
                        </div>

                        <div style={{ position: 'relative', height: '240px', overflow: 'hidden', border: '1px solid #eaeaea' }}>
                            <img 
                                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80" 
                                alt="Stylora Editorial Vision" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: '12px',
                                right: '12px',
                                background: 'rgba(0,0,0,0.85)',
                                color: '#fff',
                                padding: '6px 12px',
                                fontSize: '10px',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase'
                            }}>
                                AW 2026 EDITION
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. BRAND PHILOSOPHY PILLARS */}
            <section style={{ background: '#ffffff', padding: '50px 0', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                        <span className="section-tag">[ BRAND PHILOSOPHY ]</span>
                        <h2 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '6px', margin: 0 }}>
                            Our Four Core Pillars
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        {pillars.map((pillar, idx) => (
                            <div 
                                key={pillar.num} 
                                onMouseEnter={() => setActivePillar(idx)}
                                style={{
                                    background: activePillar === idx ? '#111111' : '#faf9f6',
                                    color: activePillar === idx ? '#ffffff' : '#111111',
                                    padding: '28px 22px',
                                    border: '1px solid rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    color: activePillar === idx ? '#c59b27' : '#999999',
                                    marginBottom: '12px'
                                }}>
                                    {pillar.num} / {pillar.subtitle.toUpperCase()}
                                </div>
                                <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>{pillar.title}</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.55', opacity: activePillar === idx ? 0.9 : 0.75, marginBottom: '16px' }}>
                                    {pillar.desc}
                                </p>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: activePillar === idx ? '#c59b27' : '#555555'
                                }}>
                                    {pillar.stat}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. REDESIGNED [ TEXTILE EXCELLENCE ] - Sleek Compact Horizontal Cards Strip */}
            <section style={{ padding: '50px 0', background: '#faf9f6' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <div>
                            <span className="section-tag" style={{ margin: 0 }}>[ TEXTILE EXCELLENCE ]</span>
                            <h2 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '4px', margin: 0 }}>
                                Signature Materials
                            </h2>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {materials.map((item, index) => (
                            <div key={index} className="material-card" style={{
                                background: '#ffffff',
                                border: '1px solid #eaeaea',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                                    <img 
                                        src={item.img} 
                                        alt={item.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        background: 'rgba(0,0,0,0.8)',
                                        color: '#fff',
                                        fontSize: '9px',
                                        fontWeight: 700,
                                        letterSpacing: '0.12em',
                                        padding: '3px 8px'
                                    }}>
                                        {item.tag}
                                    </span>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>{item.name}</h3>
                                    <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.5', margin: 0 }}>{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. REDESIGNED [ EVOLUTION ] - Compact 3-Column Milestone Horizontal Cards */}
            <section style={{ background: '#ffffff', padding: '50px 0', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                        <span className="section-tag">[ EVOLUTION ]</span>
                        <h2 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', marginTop: '6px', margin: 0 }}>
                            The STYLORA Journey
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                        {milestones.map((ms, idx) => (
                            <div key={idx} style={{
                                background: '#faf9f6',
                                border: '1px solid #eaeaea',
                                padding: '25px',
                                borderTop: '3px solid #c59b27'
                            }}>
                                <div style={{ color: '#c59b27', fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
                                    {ms.year}
                                </div>
                                <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#111' }}>{ms.title}</h4>
                                <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.55', margin: 0 }}>{ms.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. REDESIGNED [ ARCHITECTURAL UTILITY ] - Sleek Compact Banner */}
            <section style={{ padding: '40px 0', background: '#111111', color: '#ffffff' }}>
                <div className="container">
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justify: 'space-between',
                        alignItems: 'center',
                        gap: '24px'
                    }}>
                        <div style={{ maxWidth: '650px' }}>
                            <span style={{ color: '#c59b27', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                                [ ARCHITECTURAL UTILITY ]
                            </span>
                            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
                                Crafted for life in motion.
                            </h2>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: '1.5' }}>
                                From essential heavyweight hoodies to structured smart trousers, every piece undergoes multi-phase stress testing for fit, comfort, and longevity.
                            </p>
                        </div>

                        <div>
                            <button 
                                onClick={() => navigate('/shop')}
                                style={{
                                    backgroundColor: '#ffffff',
                                    color: '#111111',
                                    border: '1px solid #ffffff',
                                    padding: '14px 32px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                EXPLORE COLLECTION →
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
