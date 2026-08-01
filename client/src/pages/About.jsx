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
            {/* 1. HERO BANNER - Exact Contact Page Alignment */}
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

            {/* MAIN CONTENT BODY (Aligned to exact 60px margin grid) */}
            <div className="cpage-body" style={{ paddingTop: '50px', paddingBottom: '70px' }}>
                
                {/* 2. STATS GRID */}
                <div className="stats-grid" style={{ marginBottom: '50px' }}>
                    <div className="stat-card" style={{ padding: '24px 18px' }}>
                        <span className="stat-number" style={{ fontSize: '36px', marginBottom: '4px' }}>100%</span>
                        <span className="stat-label" style={{ fontSize: '11px' }}>Organic & Recycled</span>
                    </div>
                    <div className="stat-card" style={{ padding: '24px 18px' }}>
                        <span className="stat-number" style={{ fontSize: '36px', marginBottom: '4px' }}>40+</span>
                        <span className="stat-label" style={{ fontSize: '11px' }}>Artisan Workshops</span>
                    </div>
                    <div className="stat-card" style={{ padding: '24px 18px' }}>
                        <span className="stat-number" style={{ fontSize: '36px', marginBottom: '4px' }}>15K+</span>
                        <span className="stat-label" style={{ fontSize: '11px' }}>Global Customers</span>
                    </div>
                    <div className="stat-card" style={{ padding: '24px 18px' }}>
                        <span className="stat-number" style={{ fontSize: '36px', marginBottom: '4px' }}>0%</span>
                        <span className="stat-label" style={{ fontSize: '11px' }}>Quality Compromise</span>
                    </div>
                </div>

                {/* 3. [ THE VISION ] - Perfectly Aligned Side-by-Side Grid */}
                <section style={{ marginBottom: '60px' }}>
                    <div className="cpage-strip" style={{ marginBottom: '24px' }}>
                        <span className="cpage-strip-label">THE VISION</span>
                        <div className="cpage-strip-line" />
                    </div>
                    
                    <div style={{
                        background: '#ffffff',
                        border: '1px solid #eaeaea',
                        padding: '40px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '40px',
                        alignItems: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}>
                        <div>
                            <h2 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '16px', color: '#111', lineHeight: '1.25' }}>
                                {settings?.aboutTitle || 'Free-spirited fashion for the modern individual.'}
                            </h2>
                            <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#555', marginBottom: '20px' }}>
                                {settings?.aboutContent || 'STYLORA was born from a desire to eliminate the traditional markups of luxury fashion while maintaining absolute architectural purity in every garment.'}
                            </p>
                            <div style={{
                                paddingLeft: '18px',
                                borderLeft: '3px solid #c59b27',
                                fontStyle: 'italic',
                                fontSize: '14px',
                                color: '#333',
                                lineHeight: '1.6'
                            }}>
                                "High fashion shouldn't feel cold or exclusive. It should feel empowering, relatable, and built for real life."
                            </div>
                        </div>

                        <div style={{ position: 'relative', height: '260px', overflow: 'hidden', border: '1px solid #eaeaea' }}>
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
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase'
                            }}>
                                AW 2026 EDITION
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. BRAND PHILOSOPHY PILLARS */}
                <section style={{ marginBottom: '60px' }}>
                    <div className="cpage-strip" style={{ marginBottom: '24px' }}>
                        <span className="cpage-strip-label">BRAND PHILOSOPHY</span>
                        <div className="cpage-strip-line" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                        {pillars.map((pillar, idx) => (
                            <div 
                                key={pillar.num} 
                                className="pillar-card-item"
                                onMouseEnter={() => setActivePillar(idx)}
                                style={{
                                    background: activePillar === idx ? '#111111' : '#ffffff',
                                    color: activePillar === idx ? '#ffffff' : '#111111',
                                    padding: '30px 24px',
                                    border: '1px solid #eaeaea',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    letterSpacing: '0.15em',
                                    color: activePillar === idx ? '#c59b27' : '#999999',
                                    marginBottom: '14px',
                                    transition: 'color 0.4s ease'
                                }}>
                                    {pillar.num} / {pillar.subtitle.toUpperCase()}
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>{pillar.title}</h3>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', opacity: activePillar === idx ? 0.9 : 0.75, marginBottom: '18px', transition: 'opacity 0.4s ease' }}>
                                    {pillar.desc}
                                </p>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: activePillar === idx ? '#c59b27' : '#555555',
                                    transition: 'color 0.4s ease'
                                }}>
                                    {pillar.stat}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. [ TEXTILE EXCELLENCE ] */}
                <section style={{ marginBottom: '60px' }}>
                    <div className="cpage-strip" style={{ marginBottom: '24px' }}>
                        <span className="cpage-strip-label">TEXTILE EXCELLENCE</span>
                        <div className="cpage-strip-line" />
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
                                <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                                    <img 
                                        src={item.img} 
                                        alt={item.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        background: 'rgba(0,0,0,0.85)',
                                        color: '#fff',
                                        fontSize: '9px',
                                        fontWeight: 700,
                                        letterSpacing: '0.12em',
                                        padding: '4px 10px'
                                    }}>
                                        {item.tag}
                                    </span>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '8px' }}>{item.name}</h3>
                                    <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>{item.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. [ EVOLUTION ] */}
                <section style={{ marginBottom: '60px' }}>
                    <div className="cpage-strip" style={{ marginBottom: '24px' }}>
                        <span className="cpage-strip-label">EVOLUTION</span>
                        <div className="cpage-strip-line" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                        {milestones.map((ms, idx) => (
                            <div key={idx} className="milestone-card-item" style={{
                                background: '#ffffff',
                                border: '1px solid #eaeaea',
                                padding: '28px',
                                borderTop: '3px solid #c59b27'
                            }}>
                                <div style={{ color: '#c59b27', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
                                    {ms.year}
                                </div>
                                <h4 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '8px', color: '#111' }}>{ms.title}</h4>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>{ms.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 7. [ ARCHITECTURAL UTILITY ] */}
                <section style={{
                    background: '#111111',
                    color: '#ffffff',
                    padding: '40px 40px',
                    border: '1px solid #222222',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                }}>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justify: 'space-between',
                        alignItems: 'center',
                        gap: '24px'
                    }}>
                        <div style={{ flex: '1 1 500px', maxWidth: '750px' }}>
                            <span style={{ color: '#c59b27', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                                ARCHITECTURAL UTILITY
                            </span>
                            <h2 style={{ fontSize: '26px', fontWeight: 600, color: '#ffffff', margin: '0 0 10px 0', letterSpacing: '-0.01em' }}>
                                Crafted for life in motion.
                            </h2>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: '1.6' }}>
                                From essential heavyweight hoodies to structured smart trousers, every piece undergoes multi-phase stress testing for fit, comfort, and longevity.
                            </p>
                        </div>

                        <div>
                            <button 
                                className="about-cta-btn"
                                onClick={() => navigate('/shop')}
                                style={{
                                    backgroundColor: '#ffffff',
                                    color: '#111111',
                                    border: '1px solid #ffffff',
                                    padding: '14px 32px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                EXPLORE COLLECTION →
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default About;
